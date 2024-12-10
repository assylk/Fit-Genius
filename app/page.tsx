'use client';
import { useState, useEffect, useCallback } from 'react';
import WebcamFeed from '@/components/WebcamFeed';
import ThemeToggle from '@/components/ThemeToggle';
import WelcomeSection, { FormInputs } from '@/components/WelcomeSection';
import AIChatWidget from '@/components/AIChatWidget';
import WorkoutControls from '@/components/WorkoutControls';
import RestPeriodOverlay from '@/components/RestPeriodOverlay';
import { Exercise, exercises } from '@/app/data/exercises';
import useWindowSize from 'react-use/lib/useWindowSize';
import Confetti from 'react-confetti';

type WorkoutState = 'resting' | 'exercising' | 'completed';
type PreviewState = 'countdown' | 'preview' | 'hidden';

export default function Home() {
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState({
    height: '',
    weight: '',
    age: '',
    fitnessLevel: 'beginner',
    fitnessGoal: 'strength',
  });
  const [isExercising, setIsExercising] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [exerciseList] = useState<Exercise[]>(exercises);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentReps, setCurrentReps] = useState(0);
  const [workoutState, setWorkoutState] = useState<WorkoutState>('exercising');
  const [restTime, setRestTime] = useState(30);
  const [showMotivation, setShowMotivation] = useState(false);
  const [showPreview, setShowPreview] = useState<PreviewState>('hidden');
  const [previewCountdown, setPreviewCountdown] = useState(3);
  const [formIssues, setFormIssues] = useState<string[]>([]);
  const [currentPrediction, setCurrentPrediction] = useState<string>('');
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  


  const handleExerciseComplete = async () => {
    setIsExercising(false);
    
    const exerciseName = getCurrentExercise()?.name.trim().toLowerCase();
    console.log('Saving exercise data for:', exerciseName);
    
    await saveExerciseData(exerciseName);
    
    setTimeout(() => {
      if (currentExerciseIndex >= exerciseList.length - 1) {
        setWorkoutState('completed');
        setSessionActive(false);
        return;
      }

      setWorkoutState('resting');
      setShowMotivation(true);
      setRestTime(30);
      setCurrentReps(0);
      setCurrentPrediction('');
      setTimeout(() => setShowMotivation(false), 3000);
    }, 1000);
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (workoutState === 'resting' && restTime > 0 && !sessionPaused) {
      intervalId = setInterval(() => {
        setRestTime(prev => {
          if (prev <= 1) {
            startNextExercise();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [workoutState, restTime, sessionPaused]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isExercising && !sessionPaused) {
      intervalId = setInterval(() => {
        setWorkoutTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isExercising, sessionPaused]);

  useEffect(() => {
    if (workoutState === 'completed') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [workoutState]);

  const startNextExercise = async () => {
    const nextIndex = currentExerciseIndex + 1;
    if (nextIndex >= exerciseList.length) {
      setWorkoutState('completed');
      return;
    }
    
    try {
      await fetch('http://localhost:5000/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      setWorkoutState('exercising');
      setCurrentExerciseIndex(nextIndex);
      setIsExercising(true);
      setCurrentReps(0);
      setRestTime(30);
      setShowPreview('hidden');
      setCurrentPrediction('');
      setFormIssues([]);
    } catch (error) {
      console.error('Error resetting exercise:', error);
    }
  };

  const getCurrentExercise = () => exerciseList[currentExerciseIndex];
  const getNextExercise = () => {
    return currentExerciseIndex < exerciseList.length - 1 
      ? exerciseList[currentExerciseIndex + 1]
      : null;
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUserInfo(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const sendUserInfoToBackend = async (data: FormInputs) => {
    try {
      await fetch('http://localhost:5000/set_user_info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: data.age,
          gender: data.gender,
          height: data.height,
          weight: data.weight,
          fitnessLevel: data.fitnessLevel
        })
      });
    } catch (error) {
      console.error('Error sending user info:', error);
    }
  };

  const handleSubmit = async (data: FormInputs) => {
    await sendUserInfoToBackend(data);
    setStep(2);
  };

  const saveExerciseData = async (exerciseType: string) => {
    try {
      console.log('Sending exercise data for:', exerciseType);
      const response = await fetch('http://localhost:5000/save_exercise_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          exercise_type: exerciseType,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Exercise data saved:', data);
    } catch (error) {
      console.error('Error saving exercise data:', error);
    }
  };

  const startExerciseWithCountdown = useCallback(() => {
    setShowPreview('countdown');
    setPreviewCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setPreviewCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setTimeout(() => {
            setShowPreview('hidden');
            setIsExercising(true);
            setCurrentReps(0);
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);



  const PreviewExerciseOverlay = ({ exercise, onStart }: { exercise: Exercise, onStart: () => void }) => {
    const [showTips, setShowTips] = useState(false);
    const [previewTime, setPreviewTime] = useState(10);

    useEffect(() => {
      const timer = setInterval(() => {
        setPreviewTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setTimeout(() => onStart(), 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, [onStart]);

    return (
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-[var(--card-bg)] rounded-2xl max-w-2xl mx-4 overflow-hidden border border-[var(--card-border)]">
          {/* Preview Content */}
          <div className="relative">
            {/* Header with exercise name */}
            <div className="p-6 pb-4 border-b border-[var(--card-border)]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                    <span className="text-sm text-[var(--text-muted)]">Next Exercise</span>
                  </div>
                  <h2 className="text-2xl font-bold">{exercise.name}</h2>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-bold text-[var(--primary)]">{exercise.targetReps}</span>
                  <span className="text-sm text-[var(--text-muted)]">repetitions</span>
                </div>
              </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-2 gap-6 p-6">
              {/* Left column - Video/Image preview */}
              <div className="aspect-video bg-black/10 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl">🎥</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                  <span className="text-white text-sm">Exercise Preview</span>
                </div>
              </div>

              {/* Right column - Exercise details */}
              <div className="space-y-4">
                {/* Key points */}
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Key Points</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                        <span className="text-xs">1</span>
                      </div>
                      <span className="text-sm">Keep your back straight</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                        <span className="text-xs">2</span>
                      </div>
                      <span className="text-sm">Breathe steadily</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                        <span className="text-xs">3</span>
                      </div>
                      <span className="text-sm">Maintain proper form</span>
                    </li>
                  </ul>
                </div>

                {/* Muscles targeted */}
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Muscles Targeted</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Primary', 'Secondary', 'Stabilizers'].map((muscle) => (
                      <span
                        key={muscle}
                        className="px-3 py-1 rounded-full bg-[var(--primary)]/10 text-xs"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with controls */}
            <div className="p-6 pt-4 border-t border-[var(--card-border)] flex items-center justify-between">
              <button
                onClick={() => setShowTips(!showTips)}
                className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center">
                  ?
                </span>
                Show Tips
              </button>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                  <span className="text-sm text-[var(--text-muted)]">Starting in {previewTime}s</span>
                </div>
                <button
                  onClick={onStart}
                  className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <span>Start Now</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">Space</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tips panel (slides in from bottom) */}
          <div
            className={`absolute inset-x-0 bottom-0 bg-[var(--card-bg)] border-t border-[var(--card-border)] p-6 transition-transform duration-300 ${
              showTips ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Pro Tips</h3>
              <button
                onClick={() => setShowTips(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-[var(--text-muted)]">
                • Start with a lighter weight to perfect your form
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                • Focus on controlled movements rather than speed
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                • If you feel pain, stop and consult a professional
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CountdownOverlay = ({ count }: { count: number }) => (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="text-8xl font-bold text-white animate-pulse">
        {count}
      </div>
    </div>
  );

  const handleWebcamFeedback = (data: { 
    reps: number; 
    formIssues: string[]; 
    prediction?: string 
  }) => {
    setCurrentReps(data.reps);
    setFormIssues(data.formIssues);
    if (data.prediction) {
      setCurrentPrediction(data.prediction);
    }

    const targetReps = exerciseList[currentExerciseIndex]?.targetReps || 0;
    if (data.reps >= targetReps) {
      handleExerciseComplete();
    }
  };

  const handleStartSession = async () => {
    if (!sessionActive) {
      try {
        await fetch('http://localhost:5000/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        setSessionActive(true);
        setShowPreview(currentExerciseIndex === 0 ? 'preview' : 'hidden');
        setCurrentReps(0);
        setWorkoutTime(0);
        setCurrentExerciseIndex(0);
        setWorkoutState('exercising');
        setIsExercising(false);
        setCurrentPrediction('');
        setFormIssues([]);
      } catch (error) {
        console.error('Error resetting session:', error);
      }
    } else {
      setSessionPaused(!sessionPaused);
    }
  };

  return (
    <main className="relative h-screen p-4">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {step === 1 ? (
        <WelcomeSection
          userInfo={userInfo}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
        />
      ) : (
        <>
          <div className="flex gap-6 h-full">
            {/* Left Side - Dashboard */}
            <div className="flex-1 flex flex-col gap-6 max-h-screen">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 h-[80px]">
                {/* Exercise Progress */}
                <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] flex items-center p-3">
                  <div className="flex-1">
                    {workoutState === 'completed' ? (
                      <p className="text-lg font-bold text-[var(--primary)]">Finished!</p>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[var(--text-muted)]">Exercise Progress</span>
                          <span className="text-sm font-medium">{currentExerciseIndex + 1}/{exerciseList.length}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-[var(--secondary)]/20 rounded-full">
                            <div 
                              className="h-full bg-[var(--secondary)] rounded-full transition-all"
                              style={{ 
                                width: `${(currentReps / (getCurrentExercise()?.targetReps || 1)) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm font-bold text-[var(--primary)]">
                            {currentReps}/{getCurrentExercise()?.targetReps}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Movement Detection */}
                <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] flex items-center p-3 overflow-hidden relative">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--accent)]/10 rounded-full blur-3xl" />
                  <div className="flex items-center gap-3 flex-1">
                    {/* Vertical Progress Indicator */}
                    <div className="relative h-10 w-1.5 bg-[var(--card-border)] rounded-full overflow-hidden">
                      <div 
                        className={`absolute bottom-0 w-full rounded-full transition-all duration-300 ease-out ${
                          currentPrediction === 'up' 
                            ? 'bg-green-500' 
                            : currentPrediction === 'down' 
                              ? 'bg-blue-500' 
                              : 'bg-[var(--primary)]'
                        }`}
                        style={{ 
                          height: currentPrediction ? '100%' : '0%',
                          opacity: currentPrediction ? '1' : '0.5'
                        }}
                      />
                    </div>

                    {/* Movement Status */}
                    <div className="flex-1">
                      <span className="text-xs text-[var(--text-muted)]">Movement</span>
                      {currentPrediction ? (
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                          <span className={`text-sm font-bold tracking-wide ${
                            currentPrediction === 'up' 
                              ? 'text-green-500' 
                              : 'text-blue-500'
                          }`}>
                            {currentPrediction.toUpperCase()}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[var(--text-muted)]">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] opacity-50" />
                          <span className="text-xs">Waiting...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Time */}
                <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] flex items-center p-3">
                  <div className="space-y-1">
                    <span className="text-xs text-[var(--text-muted)]">Workout Time</span>
                    <p className="text-lg font-bold text-[var(--secondary)]">{formatTime(workoutTime)}</p>
                  </div>
                </div>
              </div>

              {/* Replace the old chat widget with the new component */}
              <AIChatWidget formIssues={formIssues} />
            </div>

            {/* Right Side - Webcam */}
            <div className="w-[600px] flex flex-col gap-4 max-h-screen">
              <div className="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--card-border)] flex-1 relative overflow-hidden">
                {isExercising && (
                  <WebcamFeed 
                    onFeedback={handleWebcamFeedback} 
                    exerciseName={getCurrentExercise()?.name || ''} 
                    isPaused={sessionPaused}
                    autoStart={sessionActive}
                  />
                )}
                {workoutState === 'resting' && (
                  <RestPeriodOverlay 
                    restTime={restTime}
                    nextExercise={getNextExercise()}
                  />
                )}
                {workoutState === 'completed' && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    {showConfetti && <Confetti width={width} height={height} recycle={false} />}
                    <div className="bg-[var(--card-bg)] p-8 rounded-2xl text-center max-w-md mx-4">
                      <div className="space-y-6">
                        {/* Trophy Icon */}
                        <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-4xl">🏆</span>
                        </div>
                        
                        {/* Title and Stats */}
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">Workout Complete!</h2>
                          <p className="text-[var(--text-muted)]">You've crushed it! Here's your workout summary:</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 py-4">
                          <div className="p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl">
                            <p className="text-[var(--text-muted)] text-sm">Duration</p>
                            <p className="text-xl font-bold">{formatTime(workoutTime)}</p>
                          </div>
                          <div className="p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl">
                            <p className="text-[var(--text-muted)] text-sm">Exercises</p>
                            <p className="text-xl font-bold">{exerciseList.length}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <button
                            onClick={() => {
                              setWorkoutState('exercising');
                              setCurrentExerciseIndex(0);
                              setCurrentReps(0);
                              setWorkoutTime(0);
                              setSessionActive(true);
                            }}
                            className="w-full px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition font-medium"
                          >
                            Start New Workout
                          </button>
                          <button
                            onClick={() => {
                              setStep(1);
                              setSessionActive(false);
                            }}
                            className="w-full px-6 py-3 bg-transparent border border-[var(--card-border)] rounded-xl hover:bg-[var(--card-bg)] transition text-[var(--text-muted)]"
                          >
                            Back to Welcome
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Rep Counter Overlay */}
                {getCurrentExercise() && (
                  <div className="absolute bottom-4 right-4 bg-[var(--primary)] text-white px-6 py-3 rounded-full font-bold">
                    {currentReps}/{getCurrentExercise().targetReps} reps
                  </div>
                )}
                
                {showPreview === 'preview' && (
                  <PreviewExerciseOverlay
                    exercise={getCurrentExercise()}
                    onStart={startExerciseWithCountdown}
                  />
                )}
                {showPreview === 'countdown' && (
                  <CountdownOverlay count={previewCountdown} />
                )}
                
              </div>

              {/* Controls */}
              <WorkoutControls
                sessionActive={sessionActive}
                sessionPaused={sessionPaused}
                currentExerciseIndex={currentExerciseIndex}
                totalExercises={exerciseList.length}
                onStartSession={handleStartSession}
              />
            </div>
          </div>
        </>
      )}
    </main>
  );
} 