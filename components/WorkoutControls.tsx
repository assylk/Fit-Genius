interface WorkoutControlsProps {
  sessionActive: boolean;
  sessionPaused: boolean;
  currentExerciseIndex: number;
  totalExercises: number;
  onStartSession: () => void;
}

export default function WorkoutControls({
  sessionActive,
  sessionPaused,
  currentExerciseIndex,
  totalExercises,
  onStartSession,
}: WorkoutControlsProps) {
  return (
    <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--card-border)] flex justify-between">
      <button 
        onClick={onStartSession}
        className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition"
      >
        {!sessionActive ? 'Start Session' : 
         sessionPaused ? 'Resume Session' : 'Pause Session'}
      </button>
      <div className="flex items-center gap-2">
        <span className="text-[var(--text-muted)]">Exercise</span>
        <span className="text-xs bg-[var(--primary)]/10 px-2 py-1 rounded">
          {currentExerciseIndex + 1}/{totalExercises}
        </span>
      </div>
    </div>
  );
} 