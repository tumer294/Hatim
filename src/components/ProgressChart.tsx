import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { JuzProgress } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ProgressChartProps {
  juzProgress: JuzProgress[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ juzProgress }) => {
  const completedCount = juzProgress.filter(juz => juz.completed).length;
  const remainingCount = juzProgress.length - completedCount;
  const completionPercentage = Math.round((completedCount / juzProgress.length) * 100);
  
  const data = {
    labels: ['Tamamlanan', 'Kalan'],
    datasets: [
      {
        data: [completedCount, remainingCount],
        backgroundColor: ['#1e3a8a', '#e5e7eb'],
        borderColor: ['#1e3a8a', '#e5e7eb'],
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };
  
  return (
    <div className="card relative">
      <div className="text-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Okuma İlerlemesi</h3>
      </div>
      
      <div className="relative h-64">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="block text-3xl font-bold text-primary-900">{completionPercentage}%</span>
            <span className="text-sm text-gray-500">Tamamlandı</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-gray-700">
          <span className="font-semibold">{completedCount}</span> cüz tamamlandı, 
          <span className="font-semibold"> {remainingCount}</span> cüz kaldı
        </p>
      </div>
    </div>
  );
};

export default ProgressChart;