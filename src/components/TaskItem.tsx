import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Checkbox } from './ui/checkbox';
import { CheckCircle2 } from 'lucide-react';

interface TaskItemProps {
  label: string;
  completed: boolean;
  onToggle: () => void;
}

export function TaskItem({ label, completed, onToggle }: TaskItemProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleToggle = () => {
    if (!completed) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
    }
    onToggle();
  };

  return (
    <div className="relative">
      <motion.div
        className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
        onClick={handleToggle}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Checkbox checked={completed} onCheckedChange={handleToggle} />
        <span className={`flex-1 text-white ${completed ? 'line-through opacity-60' : ''}`}>
          {label}
        </span>
        {completed && <CheckCircle2 size={20} className="text-emerald-400" />}
      </motion.div>

      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2"
                initial={{ 
                  opacity: 1, 
                  scale: 0,
                  x: 0,
                  y: 0
                }}
                animate={{ 
                  opacity: 0, 
                  scale: 1,
                  x: Math.cos((i / 12) * Math.PI * 2) * 100,
                  y: Math.sin((i / 12) * Math.PI * 2) * 100
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#10b981', '#14b8a6', '#3b82f6', '#f59e0b'][i % 4]
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
