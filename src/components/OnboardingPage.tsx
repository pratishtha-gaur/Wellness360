import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface OnboardingPageProps {
  onComplete: (name: string) => void;
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Image */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden md:block"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-3xl blur-3xl"></div>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1499728603263-13726abce5fd?w=800&q=80"
              alt="Wellness journey"
              className="relative rounded-3xl shadow-2xl w-full"
            />
          </div>
        </motion.div>

        {/* Right side - Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block"
            >
              <Sparkles size={48} className="text-emerald-400" />
            </motion.div>
            
            <h1 className="text-white text-5xl md:text-6xl">
              Welcome to <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Health Buddy
              </span>
            </h1>
            
            <p className="text-xl text-white/70 max-w-md">
              Discipline meets growth. Your personal fitness companion for building healthy habits and achieving wellness goals.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-white/80">What should we call you?</label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 text-lg backdrop-blur-sm"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/50"
              disabled={!name.trim()}
            >
              Start Your Journey
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </form>

          <div className="flex items-center gap-8 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              Track habits
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
              Build streaks
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              Level up
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
