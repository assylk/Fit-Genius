'use client';
import { useState, useEffect } from 'react';

type Exercise = {
  name: string;
  targetReps: number;
  description?: string;
};

type RestPeriodOverlayProps = {
  restTime: number;
  nextExercise: Exercise | null;
};

export default function RestPeriodOverlay({ restTime, nextExercise }: RestPeriodOverlayProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [currentMotivation, setCurrentMotivation] = useState('');
  const progressPercentage = (restTime / 30) * 100;
  
  const motivationalMessages = [
    "Great work! Take a breather! 💪",
    "Rest up, next exercise coming soon! 🎯",
    "You're crushing it! Get ready for the next round! 🔥",
    "Fantastic effort! Catch your breath! ⭐",
    "Recovery is key to performance! ",
    "Prepare for the next challenge! 💫",
  ];

  const tips = [
    { label: 'Form', icon: '⭐️', tip: 'Keep your form steady' },
    { label: 'Breathing', icon: '🫁', tip: 'Breathe rhythmically' },
    { label: 'Pace', icon: '⚡️', tip: 'Maintain consistent pace' }
  ];

  // Replace the random motivation with useEffect
  useEffect(() => {
    setCurrentMotivation(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
    const interval = setInterval(() => {
      setCurrentMotivation(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
    }, 4000); // Slightly longer than the animation duration

    return () => clearInterval(interval);
  }, []);

  // Auto-rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-[var(--card-bg)] rounded-2xl max-w-3xl mx-4 relative overflow-hidden border border-[var(--card-border)]">
        {/* Animated background gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[var(--primary)]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--secondary)]/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="relative p-5">
          {/* Header with timer and status */}
          <div className="flex items-center gap-4 mb-4">
            {/* Circular timer */}
            <div className="relative w-16 h-16">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  strokeWidth="3"
                  className="stroke-[var(--primary)]/10"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  strokeWidth="3"
                  className="stroke-[var(--primary)] transition-all duration-1000"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercentage / 100)}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-2xl font-bold text-[var(--primary)]">{restTime}</span>
                  <span className="text-[10px] block text-[var(--text-muted)]">sec</span>
                </div>
              </div>
            </div>

            {/* Status and motivation */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                <span className="text-sm font-medium">Rest Period</span>
              </div>
              <p 
                key={currentMotivation}
                className="text-sm text-[var(--text-muted)] animate-fade-in-out"
              >
                {currentMotivation}
              </p>
            </div>
          </div>

          {/* Preview section */}
          {nextExercise && (
            <div className="flex gap-4">
              {/* Video preview */}
              <div className="w-48 aspect-video bg-black/10 rounded-lg overflow-hidden relative group">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/40 to-transparent group-hover:from-black/60 transition-all">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                    <span className="text-lg">▶️</span>
                  </div>
                </div>
                {/* Mini stats overlay */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs">
                  <span className="px-1.5 py-0.5 rounded bg-black/30 backdrop-blur-sm">
                    {nextExercise.targetReps} reps
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[var(--primary)]/30 backdrop-blur-sm">
                    Next Up
                  </span>
                </div>
              </div>

              {/* Exercise info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">{nextExercise.name}</h3>
                  <p className="text-sm text-[var(--text-muted)] line-clamp-2">{nextExercise.description}</p>
                </div>
                
                {/* Animated Quick tips */}
                <div className="mt-2 relative h-16"> {/* Fixed height container */}
                  {tips.map((tip, i) => (
                    <div
                      key={i}
                      className={`absolute inset-0 flex gap-2 transition-all duration-500 ${
                        currentTipIndex === i
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-4 pointer-events-none'
                      }`}
                    >
                      <div className="flex-1 p-2 rounded bg-[var(--primary)]/5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{tip.icon}</span>
                          <div>
                            <div className="text-[10px] text-[var(--text-muted)]">{tip.label}</div>
                            <div className="text-xs font-medium">{tip.tip}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Indicator dots */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {tips.map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-1 rounded-full transition-all duration-300 ${
                          currentTipIndex === i
                            ? 'bg-[var(--primary)] scale-125'
                            : 'bg-[var(--primary)]/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom progress bar */}
          <div className="mt-4 w-full h-0.5 bg-[var(--card-border)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--primary)] transition-all duration-1000"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 