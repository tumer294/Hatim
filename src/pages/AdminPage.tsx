import React, { useState, useEffect } from 'react';
    import { getAllUsersProgress, verifyAdminPassword } from '../utils/storage';
    import { UserProgress, AdminStats } from '../types';
    import { BarChart3, User, CheckCircle, XCircle } from 'lucide-react';
    
    const AdminPage: React.FC = () => {
      const [isAdmin, setIsAdmin] = useState(false);
      const [password, setPassword] = useState('');
      const [usersProgress, setUsersProgress] = useState<UserProgress[]>([]);
      const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);
      
      useEffect(() => {
        const checkAdminStatus = () => {
          const storedAdminStatus = localStorage.getItem('isAdmin');
          if (storedAdminStatus === 'true') {
            setIsAdmin(true);
          }
        };
        
        checkAdminStatus();
      }, []);
      
      const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (verifyAdminPassword(password)) {
          setIsAdmin(true);
          localStorage.setItem('isAdmin', 'true');
          loadAdminData();
        } else {
          setError('Yanlış şifre');
        }
      };
      
      const loadAdminData = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          const allUsers = await getAllUsersProgress();
          setUsersProgress(allUsers);
          
          // Calculate admin stats
          const totalUsers = allUsers.length;
          const totalCompletedJuz = allUsers.reduce((sum, user) => sum + user.totalCompleted, 0);
          const totalHatims = allUsers.reduce((sum, user) => sum + user.completedHatims, 0);
          
          // Sort users by completed juz count
          const sortedUsers = [...allUsers].sort((a, b) => b.totalCompleted - a.totalCompleted);
          
          // Get top 5 users
          const topUsers = sortedUsers.slice(0, 5).map(user => ({
            userId: user.userId,
            username: user.username || null,
            completedCount: user.totalCompleted,
            hatimCount: user.completedHatims
          }));
          
          setAdminStats({
            totalUsers,
            totalCompletedJuz,
            totalHatims,
            topUsers
          });
        } catch (err: any) {
          setError('Veriler yüklenirken bir hata oluştu: ' + err.message);
        } finally {
          setIsLoading(false);
        }
      };
      
      useEffect(() => {
        if (isAdmin) {
          loadAdminData();
        }
      }, [isAdmin]);
      
      if (!isAdmin) {
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="card text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Yönetici Girişi</h2>
              {error && <div className="text-red-500 mb-4">{error}</div>}
              <form onSubmit={handlePasswordSubmit} className="max-w-sm mx-auto">
                <div className="mb-4">
                  <input
                    type="password"
                    id="password"
                    placeholder="Yönetici şifresini girin"
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary">Giriş</button>
              </form>
            </div>
          </div>
        );
      }
      
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
      
      return (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold text-primary-900 mb-6">Yönetici Paneli</h2>
          
          {error && <div className="text-red-500 mb-4">{error}</div>}
          
          {adminStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <User className="h-6 w-6 text-primary-900" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Toplam Kullanıcı</h3>
                  <p className="text-2xl font-bold text-primary-900">{adminStats.totalUsers}</p>
                </div>
              </div>
              
              <div className="card flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <BarChart3 className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Toplam Cüz</h3>
                  <p className="text-2xl font-bold text-green-700">{adminStats.totalCompletedJuz}</p>
                </div>
              </div>
              
              <div className="card flex items-center">
                <div className="bg-orange-100 p-3 rounded-full mr-4">
                  <CheckCircle className="h-6 w-6 text-accent-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Toplam Hatim</h3>
                  <p className="text-2xl font-bold text-accent-700">{adminStats.totalHatims}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Kullanıcı İlerlemesi</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tamamlanan Cüz
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hatim Sayısı
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usersProgress.map((user) => (
                    <tr key={user.userId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.username || 'İsimsiz Kullanıcı'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.totalCompleted}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.completedHatims}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    };
    
    export default AdminPage;
