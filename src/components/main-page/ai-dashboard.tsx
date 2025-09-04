'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, RefreshCw, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

import type { Server, Tunnel, LogEntry } from '@/lib/types';

type AIDashboardProps = {
  servers: Server[];
  tunnels: Tunnel[];
  logs: LogEntry[];
};

type Analysis = {
  healthScore: number;
  issues: string[];
  recommendations: string[];
  summary: string;
};

export function AIDashboard({ servers, tunnels, logs }: AIDashboardProps) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servers: servers.map(s => ({
            id: s.id,
            name: s.name,
            ipAddress: s.ipAddress,
            status: 'active'
          })),
          tunnels: tunnels.map(t => ({
            id: t.id,
            type: t.type,
            status: t.status || 'unknown',
            server1Name: t.server1Name,
            server2Name: t.server2Name
          })),
          logs: logs.slice(-20).map(l => ({
            type: l.type,
            message: l.message
          }))
        })
      });
      
      const result = await response.json();
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (servers.length > 0) {
      runAnalysis();
    }
  }, [servers.length, tunnels.length]);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI System Analysis
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={runAnalysis}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            تحلیل مجدد
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 animate-pulse" />
              <span>در حال تحلیل سیستم...</span>
            </div>
          </div>
        ) : analysis ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">امتیاز سلامت سیستم</span>
                <span className={`text-2xl font-bold ${getHealthColor(analysis.healthScore)}`}>
                  {analysis.healthScore}%
                </span>
              </div>
              <Progress 
                value={analysis.healthScore} 
                className="h-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-sm font-medium">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  مشکلات شناسایی شده
                </h4>
                {analysis.issues.length > 0 ? (
                  <div className="space-y-1">
                    {analysis.issues.map((issue, idx) => (
                      <Badge key={idx} variant="destructive" className="text-xs">
                        {issue}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    مشکلی شناسایی نشد
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  پیشنهادات بهبود
                </h4>
                <div className="space-y-1">
                  {analysis.recommendations.map((rec, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {rec}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">خلاصه تحلیل</h4>
              <p className="text-sm text-muted-foreground">{analysis.summary}</p>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>برای شروع تحلیل، روی دکمه تحلیل مجدد کلیک کنید</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}