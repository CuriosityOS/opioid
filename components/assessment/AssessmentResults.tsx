'use client';

import React from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Brain, FileText, AlertTriangle, AlertCircle } from 'lucide-react';
import { AssessmentResult } from '@/types/assessment';
import { RiskScoreIndicator } from './RiskScoreIndicator';
import { FactorCard } from './FactorCard';

interface AssessmentResultsProps {
  data: AssessmentResult;
}

export const AssessmentResults = ({ data }: AssessmentResultsProps) => {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High': return 'bg-green-100 text-green-800 border-green-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-800">AI Assessment Complete</h2>
              </div>
              <p className="text-gray-600 max-w-2xl">{data.summary}</p>
            </div>
            <Badge className={`${getConfidenceColor(data.confidence)} border`}>
              {data.confidence} Confidence
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Risk Score */}
      <RiskScoreIndicator score={data.riskScore} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-red-50 to-pink-50 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Risk Factors</p>
              <p className="text-2xl font-bold text-red-600">{data.riskFactors.length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400 opacity-50" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Protective Factors</p>
              <p className="text-2xl font-bold text-green-600">{data.protectiveFactors.length}</p>
            </div>
            <Activity className="w-8 h-8 text-green-400 opacity-50" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recommendations</p>
              <p className="text-2xl font-bold text-blue-600">{data.recommendations.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-400 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Detailed Factors */}
      <div className="space-y-4">
        {data.riskFactors.length > 0 && (
          <FactorCard 
            title="Risk Factors Identified" 
            items={data.riskFactors} 
            type="risk" 
          />
        )}
        
        {data.protectiveFactors.length > 0 && (
          <FactorCard 
            title="Protective Factors" 
            items={data.protectiveFactors} 
            type="protective" 
          />
        )}
        
        {data.recommendations.length > 0 && (
          <FactorCard 
            title="Recommendations" 
            items={data.recommendations} 
            type="recommendation" 
          />
        )}
      </div>

      {/* Warning if present */}
      {data.warning && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-amber-900">Important Note</p>
              <p className="text-sm text-amber-800">{data.warning}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Timestamp */}
      <div className="text-center text-xs text-gray-500">
        Assessment generated on {new Date().toLocaleString()}
      </div>
    </div>
  );
};