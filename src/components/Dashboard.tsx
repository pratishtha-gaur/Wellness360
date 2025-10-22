import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, TrendingUp } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { StreakCounter } from './StreakCounter';
import { XPBar } from './XPBar';
import { MotivationCard } from './MotivationCard';
import { HabitTracker } from './HabitTracker';
import { TaskItem } from './TaskItem';
import { ProgressRing } from './ProgressRing';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DashboardProps {
  userName: string;
}

const weeklyData = [
  { day: 'Mon', water: 6, sleep: 7 },
  { day: 'Tue', water: 8, sleep: 8 },
  { day: 'Wed', water: 7, sleep: 6 },
  { day: 'Thu', water: 9, sleep: 8 },
  { day: 'Fri', water: 8, sleep: 7 },
  { day: 'Sat', water: 10, sleep: 9 },
  { day: 'Sun', water: 8, sleep: 8 },
];

export function Dashboard({ userName }: DashboardProps) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [waterIntake, setWaterIntake] = useState(8);
  const [sleepHours, setSleepHours] = useState(7);
  const [tasks, setTasks] = useState([
    { id: 1, label: 'Morning meditation (10 min)', completed: false },
    { id: 2, label: 'Drink 2L of water', completed: false },
    { id: 3, label: 'Complete workout routine', completed: false },
    { id: 4, label: 'Log meals', completed: false },
    { id: 5, label: 'Sleep by 10 PM', completed: false },
  ]);

  const habits = [
    { icon: 'water' as const, label: 'Water Intake', current: waterIntake, target: 10, unit: 'glasses', color: '#3b82f6' },
    { icon: 'sleep' as const, label: 'Sleep', current: sleepHours, target: 8, unit: 'hours', color: '#8b5cf6' },
  ];

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const dailyProgress = Math.round((completedTasks / tasks.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* XP Bar */}
        <XPBar currentXP={750} maxXP={1000} level={5} />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl text-white mb-2">
              Hey {userName}, ready to level up today? 🚀
            </h1>
            <p className="text-white/60">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <StreakCounter count={12} size="lg" />
        </motion.div>

        {/* Check-in Button and Motivation */}
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-gradient-to-br from-emerald-600 to-teal-600 border-0 h-full flex flex-col items-center justify-center text-center">
              <CheckCircle2 size={48} className="text-white mb-4" />
              <h3 className="text-white text-xl mb-2">Daily Check-in</h3>
              <p className="text-white/80 text-sm mb-4">Mark today's progress</p>
              <Button
                onClick={() => setCheckedIn(!checkedIn)}
                className={`w-full ${checkedIn ? 'bg-white text-emerald-600' : 'bg-white/20 text-white'} hover:bg-white hover:text-emerald-600`}
              >
                {checkedIn ? '✓ Checked In' : 'Check In Now'}
              </Button>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <MotivationCard 
              quote="Small daily improvements over time lead to stunning results. Keep going!"
              author="Robin Sharma"
            />
          </motion.div>
        </div>

        {/* Progress Rings and Habit Tracker */}
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
              <h3 className="text-white mb-4">Daily Progress</h3>
              <div className="flex justify-center">
                <ProgressRing 
                  progress={dailyProgress} 
                  size={160}
                  strokeWidth={12}
                  color="#10b981"
                  value={`${dailyProgress}%`}
                  label="Complete"
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-white/60 text-sm">
                  {completedTasks} of {tasks.length} tasks completed
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2"
          >
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
              <h3 className="text-white mb-4">Today's Habits</h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-white/80 mb-2 block">Water Intake (glasses)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={waterIntake}
                      onChange={(e) => setWaterIntake(Number(e.target.value))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80 mb-2 block">Sleep (hours)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(Number(e.target.value))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
                <HabitTracker habits={habits} />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Tasks and Achievements */}
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="md:col-span-3"
          >
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
              <h3 className="text-white mb-4">Today's Tasks</h3>
              <div className="space-y-3">
                {tasks.map(task => (
                  <TaskItem
                    key={task.id}
                    label={task.label}
                    completed={task.completed}
                    onToggle={() => toggleTask(task.id)}
                  />
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Weekly Summary Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp size={24} className="text-emerald-400" />
              <h3 className="text-white">Weekly Summary</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="water" stroke="#3b82f6" fillOpacity={1} fill="url(#colorWater)" name="Water (glasses)" />
                <Area type="monotone" dataKey="sleep" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSleep)" name="Sleep (hours)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}