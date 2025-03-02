import React from 'react';
import { Check, X } from 'lucide-react';
import { JuzProgress } from '../types';

interface JuzGridProps {
  juzProgress: JuzProgress[];
  onJuzClick: (juzId: number) => void;
  readOnly?: boolean;
}

const JuzGrid: React.FC<JuzGridProps> = ({ juzProgress, onJuzClick, readOnly = false }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
      {juzProgress.map((juz) => (
        <div
          key={juz.juzId}
          onClick={() => !readOnly && onJuzClick(juz.juzId)}
          className={`
            card flex flex-col items-center justify-center p-4 text-center
            ${!readOnly ? 'cursor-pointer transform transition-transform hover:scale-105' : ''}
            ${juz.completed ? 'bg-green-50 border-green-200' : 'bg-white'}
          `}
        >
          <div className="text-lg font-bold mb-2">{juz.juzId}. Cüz</div>
          
          <div className="mb-2">
            {juz.completed ? (
              <div className="bg-green-100 text-green-800 rounded-full p-2 inline-flex items-center justify-center">
                <Check className="h-5 w-5" />
              </div>
            ) : (
              <div className="bg-gray-100 text-gray-400 rounded-full p-2 inline-flex items-center justify-center">
                <X className="h-5 w-5" />
              </div>
            )}
          </div>
          
          {juz.completed && juz.completedAt && (
            <div className="text-xs text-gray-500 mt-1">
              {formatDate(juz.completedAt)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default JuzGrid;