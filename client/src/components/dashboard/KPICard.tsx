import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    text?: string;
  };
}

export default function KPICard({ 
  title, 
  value, 
  icon, 
  iconBgColor,
  change 
}: KPICardProps) {
  const getChangeColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return 'text-green-600 dark:text-green-500';
      case 'decrease':
        return 'text-red-600 dark:text-red-500';
      case 'neutral':
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getChangeIcon = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 mr-1" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 mr-1" />;
      case 'neutral':
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 dark:text-gray-400 font-medium">{title}</h3>
        <span className={cn("p-2 rounded-lg", iconBgColor)}>
          {icon}
        </span>
      </div>
      <p className="text-2xl font-medium mb-2">{value}</p>
      {change && (
        <div className="flex items-center text-sm">
          <span className={cn("flex items-center mr-2", getChangeColor(change.type))}>
            {getChangeIcon(change.type)}
            {change.value > 0 && '+'}{change.value}%
          </span>
          <span className="text-gray-500 dark:text-gray-400">{change.text || 'vs last period'}</span>
        </div>
      )}
    </div>
  );
}
