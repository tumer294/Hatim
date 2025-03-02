import React, { useState } from 'react';
import { User } from 'lucide-react';
import { User as UserType } from '../types';
import { updateUsername } from '../utils/storage';
import toast from 'react-hot-toast';

interface UserProfileProps {
  user: UserType;
  onUpdate: (user: UserType) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user.username || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Lütfen bir kullanıcı adı girin');
      return;
    }
    
    setIsLoading(true);
    try {
      const updatedUser = await updateUsername(user.id, username);
      onUpdate(updatedUser);
      setIsEditing(false);
      toast.success('Kullanıcı adı güncellendi');
    } catch (error) {
      toast.error('Kullanıcı adı güncellenirken bir hata oluştu');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Profil</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-primary-700 hover:text-primary-900 text-sm font-medium"
          >
            Düzenle
          </button>
        )}
      </div>
      
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="Kullanıcı adınızı girin"
              required
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setUsername(user.username || '');
              }}
              className="btn-secondary bg-gray-500 hover:bg-gray-600"
              disabled={isLoading}
            >
              İptal
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center">
          <div className="bg-primary-100 p-3 rounded-full mr-4">
            <User className="h-6 w-6 text-primary-900" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Kullanıcı Adı</p>
            <p className="text-lg font-medium text-gray-900">
              {user.username || 'İsimsiz Kullanıcı'}
            </p>
          </div>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Cihaz ID: {user.id.substring(0, 8)}...
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Kayıt Tarihi: {new Date(user.createdAt).toLocaleDateString('tr-TR')}
        </p>
      </div>
    </div>
  );
};

export default UserProfile;