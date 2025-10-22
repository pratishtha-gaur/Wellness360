import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Award, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export function Analytics() {
  const weeklyData = [
    { day: 'Mon', habits: 85, tasks: 4, calories: 1950 },
    { day: 'Tue', habits: 90, tasks: 5, calories: 2100 },
    { day: 'Wed', habits: 75, tasks: 3, calories: 1800 },
    { day: 'Thu', habits: 95, tasks: 5, calories: 2050 },
    { day: 'Fri', habits: 88, tasks: 4, calories: 1980 },
    { day: 'Sat', habits: 92, tasks: 5, calories: 2200 },
    { day: 'Sun', habits: 87, tasks: 4, calories: 2000 },
  ];

  const monthlyData = [
    { week: 'Week 1', score: 78 },
    { week: 'Week 2', score: 82 },
    { week: 'Week 3', score: 88 },
    { week: 'Week 4', score: 91 },
  ];

  const radarData = [
    { category: 'Hydration', value: 90 },
    { category: 'Sleep', value: 85 },
    { category: 'Exercise', value: 75 },
    { category: 'Nutrition', value: 88 },
    { category: 'Mindfulness', value: 70 },
    { category: 'Consistency', value: 92 },
  ];

  const insights = [
    {
      type: 'positive',
      title: 'Strongest Habit',
      description: 'Your consistency streak is at an all-time high! Keep it up.',
      icon: Award,
      color: 'emerald'
    },
    {
      type: 'warning',
      title: 'Needs Attention',
      description: 'Your exercise routine has been irregular this week. Try scheduling workouts in advance.',
      icon: AlertCircle,
      color: 'amber'
    },
    {
      type: 'positive',
      title: 'Great Progress',
      description: 'Water intake improved by 25% compared to last month!',
      icon: TrendingUp,
      color: 'blue'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl text-white mb-2">
            Analytics & Insights 📊
          </h1>
          <p className="text-white/60">Track your progress and optimize your wellness journey</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: 'Avg Daily Score', value: '87%', change: '+5%', icon: TrendingUp, color: 'emerald' },
            { label: 'Current Streak', value: '12 days', change: 'Record!', icon: Award, color: 'orange' },
            { label: 'Tasks Completed', value: '156', change: '+12', icon: TrendingUp, color: 'blue' },
            { label: 'Wellness Score', value: '8.7/10', change: '+0.3', icon: TrendingUp, color: 'purple' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 bg-white/5 border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/60 text-sm">{stat.label}</p>
                  <stat.icon size={16} className={`text-${stat.color}-400`} />
                </div>
                <p className="text-white text-2xl mb-1">{stat.value}</p>
                <p className={`text-${stat.color}-400 text-sm`}>{stat.change}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <Tabs defaultValue="weekly" className="w-full">
              <TabsList className="bg-white/10 mb-6">
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>

              <TabsContent value="weekly" className="space-y-6">
                <div>
                  <h3 className="text-white mb-4">Daily Habit Completion</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
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
                      <Bar dataKey="habits" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-white mb-4">Tasks & Calories Tracking</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyData}>
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
                      <Line type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} name="Tasks Completed" />
                      <Line type="monotone" dataKey="calories" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5 }} name="Calories" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="monthly">
                <div>
                  <h3 className="text-white mb-4">Monthly Wellness Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.8)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#10b981" 
                        strokeWidth={4} 
                        dot={{ r: 6, fill: '#10b981' }}
                        name="Wellness Score"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>

        {/* Radar Chart and Insights */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
              <h3 className="text-white mb-4">Wellness Balance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.2)" />
                  <PolarAngleAxis dataKey="category" stroke="rgba(255,255,255,0.5)" />
                  <PolarRadiusAxis stroke="rgba(255,255,255,0.3)" />
                  <Radar 
                    name="Your Score" 
                    dataKey="value" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
              <h3 className="text-white mb-4">AI-Generated Insights</h3>
              <div className="space-y-3">
                {insights.map((insight, index) => {
                  const Icon = insight.icon;
                  const colorMap: Record<string, string> = {
                    emerald: '#10b981',
                    amber: '#f59e0b',
                    blue: '#3b82f6'
                  };
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="p-4 bg-white/5 rounded-xl border border-white/10"
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${colorMap[insight.color]}20` }}
                        >
                          <Icon size={20} style={{ color: colorMap[insight.color] }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white mb-1">{insight.title}</p>
                          <p className="text-white/60 text-sm">{insight.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
