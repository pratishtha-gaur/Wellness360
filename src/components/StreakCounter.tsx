import React from 'react';
import { Flame } from 'lucide-react';
import { motion } from 'motion/react';

interface StreakCounterProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakCounter({ count, size = 'md' }: StreakCounterProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl'
  };

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 48
  };

  return (
    <motion.div 
      className="flex items-center gap-2"
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <motion.div
        animate={{
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Flame 
          size={iconSizes[size]} 
          className="text-orange-500" 
          fill="currentColor"
          style={{
            filter: 'drop-shadow(0 0 12px rgba(249, 115, 22, 0.6))'
          }}
        />
      </motion.div>
      <span className={`${sizeClasses[size]} bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent`}>
        {count}
      </span>
    </motion.div>
  );
}
