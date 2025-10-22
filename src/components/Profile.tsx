import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Target, Moon, Palette, Bell } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback } from './ui/avatar';

export function Profile() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [name, setName] = useState('Lucky');
  const [email, setEmail] = useState('lucky@healthbuddy.com');
  const [age, setAge] = useState('25');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');
  const [gender, setGender] = useState('male');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl text-white mb-2">
            Profile & Settings ⚙️
          </h1>
          <p className="text-white/60">Customize your Health Buddy experience</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-6 mb-6">
              <Avatar className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-400">
                <AvatarFallback className="text-white text-2xl bg-transparent">
                  {name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-white text-2xl mb-1">{name}</h2>
                <p className="text-white/60">Level 5 • 12 day streak 🔥</p>
                <Button className="mt-2 bg-emerald-500 hover:bg-emerald-600" size="sm">
                  Change Avatar
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white/80 mb-2 block">Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white/80 mb-2 block">Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white/80 mb-2 block">Age</Label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white/80 mb-2 block">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/80 mb-2 block">Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white/80 mb-2 block">Height (cm)</Label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-emerald-400" size={24} />
              <h3 className="text-white">Daily Goals</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white/80 mb-2 block">Water Intake (glasses)</Label>
                <Input
                  type="number"
                  defaultValue="10"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white/80 mb-2 block">Sleep Hours</Label>
                <Input
                  type="number"
                  defaultValue="8"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white/80 mb-2 block">Diet Type</Label>
                <Select defaultValue="balanced">
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="keto">Keto</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="paleo">Paleo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/80 mb-2 block">Daily Calorie Target</Label>
                <Input
                  type="number"
                  defaultValue="2000"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="text-purple-400" size={24} />
              <h3 className="text-white">Preferences</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <Moon className="text-blue-400" size={20} />
                  <div>
                    <p className="text-white">Dark Mode</p>
                    <p className="text-white/60 text-sm">Use dark theme</p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bell className="text-amber-400" size={20} />
                  <div>
                    <p className="text-white">Notifications</p>
                    <p className="text-white/60 text-sm">Daily reminders and tips</p>
                  </div>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <div className="p-4 bg-white/5 rounded-xl">
                <Label className="text-white/80 mb-2 block">Motivation Tone</Label>
                <Select defaultValue="encouraging">
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="encouraging">Encouraging</SelectItem>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="gentle">Gentle</SelectItem>
                    <SelectItem value="tough">Tough Love</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end"
        >
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8">
            Save Changes
          </Button>
        </motion.div>
      </div>
    </div>
  );
}