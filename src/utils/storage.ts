import { v4 as uuidv4 } from 'uuid';
import { User, UserProgress, JuzProgress, Hatim, GlobalStats } from '../types';
import { supabase } from './supabase';

// Local Storage Keys
const USER_KEY = 'quran_tracker_user';
const ADMIN_PASSWORD = 'turgut72'; // In a real app, this would be securely stored

// Get or create user
export const getOrCreateUser = async (): Promise<User> => {
  const storedUser = localStorage.getItem(USER_KEY);

  if (storedUser) {
    const user = JSON.parse(storedUser) as User;
    // Update last active
    user.lastActive = new Date().toISOString();
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    // Check if user exists in database
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingUser) {
      // User doesn't exist in database, create them
      await supabase.from('users').insert({
        id: user.id,
        username: user.username,
        created_at: user.createdAt,
        last_active: user.lastActive,
      });
    } else {
      // Update last active
      await supabase
        .from('users')
        .update({ last_active: user.lastActive })
        .eq('id', user.id);
    }

    return user;
  }

  // Create new user
  const newUser: User = {
    id: uuidv4(),
    username: null,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };

  localStorage.setItem(USER_KEY, JSON.stringify(newUser));

  try {
    // Save to database
    await supabase.from('users').insert({
      id: newUser.id,
      username: newUser.username,
      created_at: newUser.createdAt,
      last_active: newUser.lastActive,
    });

    // Initialize progress for new user
    await initializeUserProgress(newUser.id);
  } catch (error) {
    console.error('Error creating user:', error);
  }

  return newUser;
};

// Update username
export const updateUsername = async (
  userId: string,
  username: string
): Promise<User> => {
  const storedUser = localStorage.getItem(USER_KEY);

  if (storedUser) {
    const user = JSON.parse(storedUser) as User;
    user.username = username;
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    try {
      // Update in database
      await supabase.from('users').update({ username }).eq('id', userId);
    } catch (error) {
      console.error('Error updating username:', error);
    }

    return user;
  }

  throw new Error('User not found');
};

// Initialize progress for a new user
const initializeUserProgress = async (userId: string): Promise<void> => {
  const juzProgress: JuzProgress[] = Array.from({ length: 30 }, (_, i) => ({
    juzId: i + 1,
    completed: false,
    completedAt: null,
  }));

  try {
    // Save to database
    await supabase.from('user_progress').insert({
      user_id: userId,
      juz_progress: juzProgress,
      total_completed: 0,
      completed_hatims: 0,
    });
  } catch (error) {
    console.error('Error initializing user progress:', error);
  }
};

// Get user progress
export const getUserProgress = async (
  userId: string
): Promise<UserProgress> => {
  try {
    // Check if user exists in database
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', userId)
      .single();

    if (!existingUser) {
      // User doesn't exist in database, create them
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedUser) {
        const user = JSON.parse(storedUser) as User;
        await supabase.from('users').insert({
          id: user.id,
          username: user.username,
          created_at: user.createdAt,
          last_active: user.lastActive,
        });
      }
    }

    // Get from database
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      console.warn('No user progress data found, initializing...');
      return initializeAndGetUserProgress(userId);
    }

    return {
      userId: data.user_id,
      username: existingUser?.username || null,
      juzProgress: data.juz_progress,
      totalCompleted: data.total_completed,
      completedHatims: data.completed_hatims,
    };
  } catch (error) {
    console.error('Error getting user progress:', error);
    return initializeAndGetUserProgress(userId);
  }
};

// Initialize and get user progress
const initializeAndGetUserProgress = async (
  userId: string
): Promise<UserProgress> => {
  const juzProgress: JuzProgress[] = Array.from({ length: 30 }, (_, i) => ({
    juzId: i + 1,
    completed: false,
    completedAt: null,
  }));

  try {
    // Get username
    const { data: userData } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .maybeSingle();

    // Save to database
    await supabase.from('user_progress').insert({
      user_id: userId,
      juz_progress: juzProgress,
      total_completed: 0,
      completed_hatims: 0,
    });

    return {
      userId,
      username: userData?.username || null,
      juzProgress,
      totalCompleted: 0,
      completedHatims: 0,
    };
  } catch (error) {
    console.error('Error initializing user progress:', error);
    
    // Return default progress if database operations fail
    return {
      userId,
      username: null,
      juzProgress,
      totalCompleted: 0,
      completedHatims: 0,
    };
  }
};

// Update juz completion status
export const updateJuzCompletion = async (
  userId: string,
  juzId: number,
  completed: boolean
): Promise<UserProgress> => {
  try {
    // Get current progress
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      // If no progress found, initialize it
      const progress = await initializeAndGetUserProgress(userId);
      // Then try updating again
      return updateJuzCompletion(userId, juzId, completed);
    }

    const juzProgress: JuzProgress[] = data.juz_progress;
    const juzIndex = juzProgress.findIndex((j) => j.juzId === juzId);

    if (juzIndex !== -1) {
      // Only update if the status is changing
      if (juzProgress[juzIndex].completed !== completed) {
        juzProgress[juzIndex].completed = completed;
        juzProgress[juzIndex].completedAt = completed
          ? new Date().toISOString()
          : null;

        // Update total completed count
        const totalCompleted = juzProgress.filter((j) => j.completed).length;

        // Check if a hatim is completed (all 30 juz)
        let completedHatims = data.completed_hatims;
        if (totalCompleted === 30 && data.total_completed < 30) {
          completedHatims += 1;

          try {
            // Record the hatim completion
            await supabase.from('hatims').insert({
              id: uuidv4(),
              user_id: userId,
              completed_at: new Date().toISOString(),
            });
          } catch (error) {
            console.error('Error recording hatim completion:', error);
          }
        }

        try {
          // Save the updated progress
          await supabase
            .from('user_progress')
            .update({
              juz_progress: juzProgress,
              total_completed: totalCompleted,
              completed_hatims: completedHatims,
            })
            .eq('user_id', userId);
        } catch (error) {
          console.error('Error updating juz completion:', error);
        }

        // Get username
        const { data: userData } = await supabase
          .from('users')
          .select('username')
          .eq('id', userId)
          .maybeSingle();

        return {
          userId,
          username: userData?.username || null,
          juzProgress,
          totalCompleted,
          completedHatims,
        };
      }
    }

    // Get username
    const { data: userData } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .maybeSingle();

    return {
      userId,
      username: userData?.username || null,
      juzProgress: data.juz_progress,
      totalCompleted: data.total_completed,
      completedHatims: data.completed_hatims,
    };
  } catch (error) {
    console.error('Error updating juz completion:', error);
    throw new Error('Failed to update juz completion');
  }
};

// Get all users progress (for admin)
export const getAllUsersProgress = async (): Promise<UserProgress[]> => {
  try {
    const { data, error } = await supabase.from('user_progress').select('*');

    if (error || !data) {
      console.error('Error getting all users progress:', error);
      return [];
    }

    // Get all usernames
    const { data: usersData } = await supabase
      .from('users')
      .select('id, username');

    const usernameMap = new Map();
    if (usersData) {
      usersData.forEach((user) => {
        usernameMap.set(user.id, user.username);
      });
    }

    return data.map((item) => ({
      userId: item.user_id,
      username: usernameMap.get(item.user_id) || null,
      juzProgress: item.juz_progress,
      totalCompleted: item.total_completed,
      completedHatims: item.completed_hatims,
    }));
  } catch (error) {
    console.error('Error getting all users progress:', error);
    return [];
  }
};

// Get global statistics
export const getGlobalStats = async (): Promise<GlobalStats> => {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get total completed juz
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('total_completed, completed_hatims');

    const totalCompletedJuz = progressData
      ? progressData.reduce((sum, item) => sum + item.total_completed, 0)
      : 0;

    const totalHatims = progressData
      ? progressData.reduce((sum, item) => sum + item.completed_hatims, 0)
      : 0;

    // Get recent hatims
    const { data: hatimData } = await supabase
      .from('hatims')
      .select('id, user_id, completed_at')
      .order('completed_at', { ascending: false })
      .limit(5);

    // Get usernames for hatims
    const userIds = hatimData ? hatimData.map((h) => h.user_id) : [];
    const { data: usersData } = await supabase
      .from('users')
      .select('id, username')
      .in('id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000']);

    const usernameMap = new Map();
    if (usersData) {
      usersData.forEach((user) => {
        usernameMap.set(user.id, user.username);
      });
    }

    const recentHatims: Hatim[] = hatimData
      ? hatimData.map((h) => ({
          id: h.id,
          userId: h.user_id,
          username: usernameMap.get(h.user_id) || null,
          completedAt: h.completed_at,
        }))
      : [];

    return {
      totalUsers: totalUsers || 0,
      totalCompletedJuz,
      totalHatims,
      recentHatims,
    };
  } catch (error) {
    console.error('Error getting global stats:', error);
    // Return default stats if there's an error
    return {
      totalUsers: 0,
      totalCompletedJuz: 0,
      totalHatims: 0,
      recentHatims: [],
    };
  }
};

// Verify admin password
export const verifyAdminPassword = (password: string): boolean => {
  return password === ADMIN_PASSWORD;
};