'use client';

import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TrendStatCardProps {
  title: string;
  value: string | number;
  changePercent: number;
  icon?: LucideIcon;
}

export function TrendStatCard({ title, value, changePercent, icon: Icon }: TrendStatCardProps) {
  const isPositive = changePercent > 0;
  const isNeutral = changePercent === 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div
          className={cn(
            'mt-1 flex items-center gap-1 text-xs',
            isPositive && 'text-green-600',
            !isPositive && !isNeutral && 'text-red-600',
            isNeutral && 'text-muted-foreground'
          )}
        >
          {isNeutral ? (
            <Minus className="h-3 w-3" />
          ) : isPositive ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )}
          <span>{Math.abs(changePercent)}% vs last week</span>
        </div>
      </CardContent>
    </Card>
  );
}
