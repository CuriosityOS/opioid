import React from 'react';
import { AlertCircle, ShieldCheck, Lightbulb, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

type FactorType = 'risk' | 'protective' | 'recommendation';

interface FactorCardProps {
  title: string;
  items: string[];
  type: FactorType;
}

const CARD_CONFIGS: Record<FactorType, {
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  bgColor: string;
}> = {
  risk: {
    icon: AlertCircle,
    gradient: 'from-red-500 to-pink-500',
    iconColor: 'text-red-500',
    bgColor: 'bg-red-50',
  },
  protective: {
    icon: ShieldCheck,
    gradient: 'from-green-500 to-emerald-500',
    iconColor: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  recommendation: {
    icon: Lightbulb,
    gradient: 'from-blue-500 to-indigo-500',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
};

export const FactorCard = ({ title, items, type }: FactorCardProps) => {
  const config = CARD_CONFIGS[type];
  const Icon = config.icon;

  if (items.length === 0) {
    return (
      <Card className={`p-6 ${config.bgColor} border-0`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg bg-white shadow-sm`}>
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        <p className="text-gray-500 text-sm italic">No {title.toLowerCase()} identified</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient} shadow-md`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className="ml-auto text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start group">
            <ChevronRight className={`w-4 h-4 mt-0.5 mr-2 ${config.iconColor} opacity-60 group-hover:opacity-100 transition-opacity`} />
            <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};