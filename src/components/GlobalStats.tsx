import React from 'react';
import { Users, BookOpen, Award } from 'lucide-react';
import { GlobalStats as GlobalStatsType } from '../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface GlobalStatsProps {
  stats: GlobalStatsType;
}

const GlobalStats: React.FC<GlobalStatsProps> = ({ stats }) => {
  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Genel İstatistikler</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <Users className="h-6 w-6 text-primary-900" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Toplam Kullanıcı</p>
            <p className="text-xl font-bold text-primary-900">{stats.totalUsers}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <BookOpen className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tamamlanan Cüz</p>
            <p className="text-xl font-bold text-green-700">{stats.totalCompletedJuz}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-orange-100 p-3 rounded-full mr-4">
            <Award className="h-6 w-6 text-accent-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Toplam Hatim</p>
            <p className="text-xl font-bold text-accent-700">{stats.totalHatims}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Son Tamamlanan Hatimler</h4>
        
        {stats.recentHatims.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Henüz tamamlanan hatim bulunmamaktadır.</p>
        ) : (
          <div className="space-y-3">
            {stats.recentHatims.map((hatim) => (
              <div key={hatim.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {hatim.username || 'İsimsiz Kullanıcı'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(hatim.completedAt), 'PPP', { locale: tr })}
                  </p>
                </div>
                <div className="bg-accent-100 p-2 rounded-full">
                  <Award className="h-5 w-5 text-accent-700" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalStats;