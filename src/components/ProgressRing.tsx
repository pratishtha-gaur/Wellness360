import React from 'react';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  value?: string;
}

export function ProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8, 
  color = '#10b981',
  label,
  value
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {value && <div className="text-white" style={{ fontSize: size / 5 }}>{value}</div>}
        {label && <div className="text-white/60 text-xs mt-1">{label}</div>}
      </div>
    </div>
  );
}
