import { Exercise } from '@/types/workout';

interface PreviewOverlayProps {
  exercise: Exercise;
  timeRemaining: number;
}

export default function PreviewOverlay({ exercise, timeRemaining }: PreviewOverlayProps) {
  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-[var(--card-bg)] p-8 rounded-2xl max-w-md text-center space-y-6">
        <div className="flex items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold">{exercise.name}</h2>
            <p className="text-[var(--text-muted)]">{exercise.targetReps} reps</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <p className="text-lg">Get ready! Starting in:</p>
          <div className="text-4xl font-bold text-[var(--primary)]">
            {timeRemaining}s
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Key Points:</h3>
          <ul className="text-sm text-[var(--text-muted)]">
            <li>• Keep your back straight</li>
            <li>• Breathe steadily</li>
            <li>• Maintain proper form</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 