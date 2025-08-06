import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface RiskScoreIndicatorProps {
  score: number;
}

export const RiskScoreIndicator = ({ score }: RiskScoreIndicatorProps) => {
  const getGradientColor = (score: number) => {
    if (score < 30) return 'from-green-400 to-green-600';
    if (score < 60) return 'from-yellow-400 to-orange-500';
    return 'from-orange-500 to-red-600';
  };

  const getRiskLevel = (score: number) => {
    if (score < 30) return { text: 'Low Risk', icon: TrendingDown, color: 'text-green-600' };
    if (score < 60) return { text: 'Moderate Risk', icon: AlertTriangle, color: 'text-yellow-600' };
    return { text: 'High Risk', icon: TrendingUp, color: 'text-red-600' };
  };

  const risk = getRiskLevel(score);
  const Icon = risk.icon;

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r opacity-10 rounded-3xl blur-xl" 
           style={{background: `linear-gradient(135deg, ${score < 30 ? '#10b981' : score < 60 ? '#f59e0b' : '#ef4444'} 0%, ${score < 30 ? '#059669' : score < 60 ? '#ea580c' : '#dc2626'} 100%)`}} />
      
      <div className="relative bg-white/90 backdrop-blur rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(score / 100) * 553} 553`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={score < 30 ? '#10b981' : score < 60 ? '#f59e0b' : '#ef4444'} />
                  <stop offset="100%" stopColor={score < 30 ? '#059669' : score < 60 ? '#ea580c' : '#dc2626'} />
                </linearGradient>
              </defs>
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-6xl font-bold bg-gradient-to-br ${getGradientColor(score)} bg-clip-text text-transparent`}>
                {score}
              </span>
              <span className="text-sm text-gray-500 font-medium">out of 100</span>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getGradientColor(score)} bg-opacity-10`}>
            <Icon className={`w-5 h-5 ${risk.color}`} />
            <span className={`font-semibold ${risk.color}`}>{risk.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
};