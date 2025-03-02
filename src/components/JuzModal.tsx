import React from 'react';
import { X, Check } from 'lucide-react';
import { JuzProgress } from '../types';

interface JuzModalProps {
  juz: JuzProgress;
  onClose: () => void;
  onComplete: (juzId: number, completed: boolean) => void;
}

const JuzModal: React.FC<JuzModalProps> = ({ juz, onClose, onComplete }) => {
  const handleComplete = () => {
    onComplete(juz.juzId, !juz.completed);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">{juz.juzId}. Cüz</h3>
          <p className="text-gray-600 mt-2">
            {juz.completed ? 'Bu cüzü tamamladınız.' : 'Bu cüzü henüz tamamlamadınız.'}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-center mb-4">
            {juz.completed ? (
              <div className="bg-green-100 text-green-800 rounded-full p-3 inline-flex items-center justify-center">
                <Check className="h-6 w-6" />
              </div>
            ) : (
              <div className="bg-gray-100 text-gray-400 rounded-full p-3 inline-flex items-center justify-center">
                <X className="h-6 w-6" />
              </div>
            )}
          </div>
          
          {juz.completed && juz.completedAt && (
            <p className="text-sm text-center text-gray-600">
              Tamamlanma tarihi: {new Date(juz.completedAt).toLocaleString('tr-TR')}
            </p>
          )}
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={handleComplete}
            className={`btn-primary flex items-center justify-center ${
              juz.completed ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {juz.completed ? (
              <>
                <X className="h-5 w-5 mr-2" />
                Tamamlanmadı Olarak İşaretle
              </>
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Tamamlandı Olarak İşaretle
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JuzModal;