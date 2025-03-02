import React, { useState, useEffect } from 'react';
import { Book, Award, Clock } from 'lucide-react';
import { getOrCreateUser, getUserProgress, updateJuzCompletion, getGlobalStats } from '../utils/storage';
import { User, UserProgress, JuzProgress, GlobalStats } from '../types';
import JuzGrid from '../components/JuzGrid';
import ProgressChart from '../components/ProgressChart';
import JuzModal from '../components/JuzModal';
import UserProfile from '../components/UserProfile';
import GlobalStatsComponent from '../components/GlobalStats';
import RealtimeIndicator from '../components/RealtimeIndicator';
import toast, { Toaster } from 'react-hot-toast';
import { io } from 'socket.io-client';

const HomePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [selectedJuz, setSelectedJuz] = useState<JuzProgress | null>(null);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getOrCreateUser();
        setUser(currentUser);
        
        const userProgress = await getUserProgress(currentUser.id);
        setProgress(userProgress);
        
        const stats = await getGlobalStats();
        setGlobalStats(stats);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Veriler yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Connect to WebSocket - using a dummy URL since we're not actually connecting
    // In a real app, this would be a real WebSocket server
    const mockSocket = {
      on: (event: string, callback: Function) => {
        if (event === 'connect') {
          // Simulate connection after 1 second
          setTimeout(() => {
            setIsConnected(true);
            callback();
          }, 1000);
        }
        return mockSocket;
      },
      disconnect: () => {
        setIsConnected(false);
      }
    };
    
    // Simulate socket connection
    mockSocket.on('connect', () => {});
    
    return () => {
      mockSocket.disconnect();
    };
  }, []);
  
  const handleJuzClick = (juzId: number) => {
    if (progress) {
      const juz = progress.juzProgress.find(j => j.juzId === juzId);
      if (juz) {
        setSelectedJuz(juz);
      }
    }
  };
  
  const handleJuzComplete = async (juzId: number, completed: boolean) => {
    if (user) {
      try {
        const updatedProgress = await updateJuzCompletion(user.id, juzId, completed);
        setProgress(updatedProgress);
        
        // Refresh global stats
        const stats = await getGlobalStats();
        setGlobalStats(stats);
        
        toast.success(completed ? 'Cüz tamamlandı!' : 'Cüz tamamlanmadı olarak işaretlendi');
      } catch (error) {
        console.error('Error updating juz:', error);
        toast.error('Cüz güncellenirken bir hata oluştu');
      }
    }
  };
  
  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    
    // Also update username in progress
    if (progress) {
      setProgress({
        ...progress,
        username: updatedUser.username
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  if (!user || !progress || !globalStats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Hata</h2>
          <p className="text-gray-700 mb-4">
            Veriler yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      <RealtimeIndicator isConnected={isConnected} />
      
      <div className="bg-pattern bg-opacity-5 rounded-xl p-6 mb-8 text-center">
        <h2 className="text-3xl font-bold text-primary-900 mb-2">Hoş Geldiniz</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Kuran-ı Kerim okuma takip uygulamasına hoş geldiniz. Okuduğunuz cüzleri işaretleyerek ilerlemenizi takip edebilirsiniz.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <Book className="h-6 w-6 text-primary-900" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Toplam Cüz</h3>
            <p className="text-2xl font-bold text-primary-900">30</p>
          </div>
        </div>
        
        <div className="card flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <Award className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Tamamlanan</h3>
            <p className="text-2xl font-bold text-green-700">{progress.totalCompleted}</p>
          </div>
        </div>
        
        <div className="card flex items-center">
          <div className="bg-orange-100 p-3 rounded-full mr-4">
            <Clock className="h-6 w-6 text-accent-700" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Hatim Sayısı</h3>
            <p className="text-2xl font-bold text-accent-700">{progress.completedHatims}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="card mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Cüzler</h3>
            <JuzGrid 
              juzProgress={progress.juzProgress} 
              onJuzClick={handleJuzClick} 
            />
          </div>
          
          <GlobalStatsComponent stats={globalStats} />
        </div>
        
        <div>
          <UserProfile user={user} onUpdate={handleUserUpdate} />
          
          <div className="mt-6">
            <ProgressChart juzProgress={progress.juzProgress} />
          </div>
          
          <div className="card mt-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Motivasyon</h3>
              <div className="arabic-text text-2xl mb-4 text-primary-900">
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
              </div>
              <p className="text-gray-600 italic">
                "Kim Kur'an okur ve onu ezberlerse, Allah onu helal sayana helal, haram sayana haram kılarak cennete koyar."
              </p>
              <p className="text-sm text-gray-500 mt-2">- Tirmizi, Fedailü'l-Kur'an, 13</p>
            </div>
          </div>
        </div>
      </div>
      
      {selectedJuz && (
        <JuzModal 
          juz={selectedJuz} 
          onClose={() => setSelectedJuz(null)} 
          onComplete={handleJuzComplete} 
        />
      )}
    </div>
  );
};

export default HomePage;