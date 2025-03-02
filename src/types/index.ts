export interface User {
  id: string;
  username: string | null;
  createdAt: string;
  lastActive: string;
}

export interface JuzProgress {
  juzId: number;
  completed: boolean;
  completedAt: string | null;
}

export interface UserProgress {
  userId: string;
  username: string | null;
  juzProgress: JuzProgress[];
  totalCompleted: number;
  completedHatims: number;
}

export interface Hatim {
  id: string;
  userId: string;
  username: string | null;
  completedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalCompletedJuz: number;
  totalHatims: number;
  topUsers: {
    userId: string;
    username: string | null;
    completedCount: number;
    hatimCount: number;
  }[];
}

export interface GlobalStats {
  totalUsers: number;
  totalCompletedJuz: number;
  totalHatims: number;
  recentHatims: Hatim[];
}