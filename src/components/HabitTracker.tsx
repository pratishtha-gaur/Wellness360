import React from 'react';
import { Droplet, Moon, Zap, Target } from 'lucide-react';
import { Progress } from './ui/progress';
import { Card } from './ui/card';

interface HabitData {
  icon: 'water' | 'sleep' | 'energy' | 'goals';
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

interface HabitTrackerProps {
  habits: HabitData[];
}

const iconMap = {
  water: Droplet,
  sleep: Moon,
  energy: Zap,
  goals: Target
};

export function HabitTracker({ habits }: HabitTrackerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {habits.map((habit, index) => {
        const Icon = iconMap[habit.icon];
        const percentage = Math.min((habit.current / habit.target) * 100, 100);
        
        return (
          <Card 
            key={index} 
            className="p-4 bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${habit.color}20` }}
              >
                <Icon size={20} style={{ color: habit.color }} />
              </div>
              <span className="text-white/90">{habit.label}</span>
            </div>
            <Progress 
              value={percentage} 
              className="h-2 mb-2"
              style={{
                // @ts-ignore
                '--progress-background': habit.color
              }}
            />
            <div className="flex justify-between text-sm">
              <span className="text-white/60">
                {habit.current} / {habit.target} {habit.unit}
              </span>
              <span style={{ color: habit.color }}>
                {Math.round(percentage)}%
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
