import React, { useState, useEffect } from 'react';
import { getOrCreateUser, getUserProgress, getGlobalStats } from '../utils/storage';
import { User, UserProgress, GlobalStats } from '../types';
import ProgressChart from '../components/ProgressChart';
import JuzGrid from '../components/JuzGrid';
import GlobalStatsComponent from '../components/GlobalStats';
import { Calendar, Clock, TrendingUp, Award } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import toast, { Toaster } from 'react-hot-toast';

const ProgressPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  
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
    
    // Simulate connection after 1 second
    setTimeout(() => {
      setIsConnected(true);
    }, 1000);
    
    return () => {
      setIsConnected(false);
    };
  }, []);
  
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
  
  // Calculate statistics
  const completedJuz = progress.juzProgress.filter(j => j.completed);
  const completionDates = completedJuz
    .filter(j => j.completedAt)
    .map(j => new Date(j.completedAt as string))
    .sort((a, b) => a.getTime() - b.getTime());
  
  const firstCompletionDate = completionDates.length > 0 ? completionDates[0] : null;
  const lastCompletionDate = completionDates.length > 0 ? completionDates[completionDates.length - 1] : null;
  
  // Calculate average completion time if there are at least 2 completions
  let averageCompletionTime = null;
  if (completionDates.length >= 2) {
    let totalTimeDiff = 0;
    for (let i = 1; i < completionDates.length; i++) {
      totalTimeDiff += completionDates[i].getTime() - completionDates[i-1].getTime();
    }
    const avgTimeDiffMs = totalTimeDiff / (completionDates.length - 1);
    const avgTimeDiffDays = avgTimeDiffMs / (1000 * 60 * 60 * 24);
    averageCompletionTime = avgTimeDiffDays.toFixed(1);
  }
  
  // Format dates
  const formatDate = (date: Date | null) => {
    if (!date) return 'Henüz tamamlanmadı';
    return format(date, 'PPP', { locale: tr });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      
      <div className={`fixed bottom-4 right-4 z-50 flex items-center space-x-2 px-3 py-2 rounded-full shadow-md ${
        isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        <span className="text-xs font-medium">
          {isConnected ? 'Canlı Bağlantı' : 'Çevrimdışı'}
        </span>
      </div>
      
      <div className="bg-pattern bg-opacity-5 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-primary-900 mb-2">İlerleme Detayları</h2>
        <p className="text-gray-600">
          Kuran-ı Kerim okuma ilerlemenizi detaylı olarak görüntüleyin.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="card mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Cüz Durumu</h3>
            <JuzGrid 
              juzProgress={progress.juzProgress} 
              onJuzClick={() => {}} 
              readOnly={true}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card flex flex-col items-center p-6">
              <Calendar className="h-8 w-8 text-primary-900 mb-3" />
              <h4 className="text-lg font-semibold text-gray-800 mb-1">İlk Tamamlama</h4>
              <p className="text-sm text-gray-600 text-center">{formatDate(firstCompletionDate)}</p>
            </div>
            
            <div className="card flex flex-col items-center p-6">
              <Calendar className="h-8 w-8 text-primary-900 mb-3" />
              <h4 className="text-lg font-semibold text-gray-800 mb-1">Son Tamamlama</h4>
              <p className="text-sm text-gray-600 text-center">{formatDate(lastCompletionDate)}</p>
            </div>
            
            <div className="card flex flex-col items-center p-6">
              <Clock className="h-8 w-8 text-primary-900 mb-3" />
              <h4 className="text-lg font-semibold text-gray-800 mb-1">Ortalama Süre</h4>
              <p className="text-sm text-gray-600 text-center">
                {averageCompletionTime ? `${averageCompletionTime} gün` : 'Hesaplanamıyor'}
              </p>
            </div>
            
            <div className="card flex flex-col items-center p-6">
              <Award className="h-8 w-8 text-accent-700 mb-3" />
              <h4 className="text-lg font-semibold text-gray-800 mb-1">Hatim Sayısı</h4>
              <p className="text-sm text-gray-600 text-center">
                {progress.completedHatims} hatim
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <ProgressChart juzProgress={progress.juzProgress} />
          
          <div className="card mt-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                <TrendingUp className="h-5 w-5 inline-block mr-2" />
                İlerleme Özeti
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600">Toplam Cüz</p>
                  <p className="text-2xl font-bold text-primary-900">30</p>
                </div>
                
                <div>
                  <p className="text-gray-600">Tamamlanan</p>
                  <p className="text-2xl font-bold text-green-700">{progress.totalCompleted}</p>
                </div>
                
                <div>
                  <p className="text-gray-600">Tamamlanma Oranı</p>
                  <p className="text-2xl font-bold text-accent-700">
                    %{Math.round((progress.totalCompleted / 30) * 100)}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-600">Kullanıcı Adı</p>
                  <p className="text-xl font-bold text-secondary-700">
                    {user.username || 'İsimsiz Kullanıcı'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Tamamlanan Cüzler</h3>
          
          {completedJuz.length === 0 ? (
            <p className="text-gray-600 text-center py-4">Henüz tamamlanmış cüz bulunmamaktadır.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cüz No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tamamlanma Tarihi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {completedJuz.map((juz) => (
                    <tr key={juz.juzId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{juz.juzId}. Cüz</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {juz.completedAt ? formatDate(new Date(juz.completedAt)) : '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <GlobalStatsComponent stats={globalStats} />
      </div>
    </div>
  );
};

export default ProgressPage;