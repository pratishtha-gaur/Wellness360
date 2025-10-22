import React from 'react';
import { Sparkles } from 'lucide-react';
import { Progress } from './ui/progress';

interface XPBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
}

export function XPBar({ currentXP, maxXP, level }: XPBarProps) {
  const percentage = (currentXP / maxXP) * 100;

  return (
    <div className="w-full bg-white/5 backdrop-blur-sm rounded-full p-4 border border-white/10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-yellow-400" />
          <span className="text-white">Level {level}</span>
        </div>
        <div className="flex-1">
          <div className="relative">
            <Progress value={percentage} className="h-3" />
            <div className="absolute inset-0 flex items-center justify-center text-xs text-white/80">
              {currentXP} / {maxXP} XP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
