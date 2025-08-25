
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  className?: string;
  gradient?: 'coral' | 'emerald' | 'blue' | 'purple';
}

export const KpiCard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  className,
  gradient = 'coral'
}) => {
  const gradientClasses = {
    coral: 'from-coral-500 to-coral-600',
    emerald: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600'
  };

  const changeColors = {
    positive: 'text-emerald-600 bg-emerald-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                changeColors[changeType]
              )}>
                {change}
              </div>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-xl bg-gradient-to-br text-white shadow-lg",
            gradientClasses[gradient]
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
