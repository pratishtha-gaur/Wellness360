import React from 'react';
import { Sparkles } from 'lucide-react';
import { Card } from './ui/card';
import { motion } from 'motion/react';

interface MotivationCardProps {
  quote: string;
  author?: string;
}

export function MotivationCard({ quote, author }: MotivationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-400/30 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-400/20 rounded-full">
            <Sparkles className="text-emerald-300" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-emerald-300 mb-2">Daily Motivation</h3>
            <p className="text-white/90 italic leading-relaxed">"{quote}"</p>
            {author && <p className="text-white/60 mt-2">— {author}</p>}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
