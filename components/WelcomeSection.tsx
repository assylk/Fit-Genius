import { useForm } from 'react-hook-form';
import { Crown, Trophy, Target } from 'lucide-react';
import { BsGenderMale, BsGenderFemale } from 'react-icons/bs';
import { useUserStore } from '@/store/useUserStore';

export interface FormInputs {
  gender: 'male' | 'female';
  height: string;
  weight: string;
  age: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
}

interface WelcomeSectionProps {
  handleSubmit: (data: FormInputs) => void;
  userInfo: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

type UserInfoField = 'height' | 'weight' | 'age' | 'gender' | 'fitnessLevel' | 'fitnessGoal';

export default function WelcomeSection({ 
  handleSubmit: parentHandleSubmit,
  userInfo,
  handleInputChange 
}: WelcomeSectionProps) {
  const { register, handleSubmit, watch, formState: { isValid, errors } } = useForm<FormInputs>({
    mode: 'onChange',
    defaultValues: {
      gender: userInfo.gender as FormInputs['gender'],
      height: userInfo.height,
      weight: userInfo.weight,
      age: userInfo.age,
      fitnessLevel: userInfo.fitnessLevel as FormInputs['fitnessLevel'],
    }
  });

  const onSubmit = (data: FormInputs) => {
    parentHandleSubmit(data);
  };

  // Watch form values for progress calculation
  const watchedValues = watch();

  // Calculate progress based on filled fields
  const getProgress = () => {
    const steps = [
      {
        name: 'Basic Info',
        isComplete: Boolean(
          watchedValues.gender && 
          watchedValues.height && 
          watchedValues.weight && 
          watchedValues.age
        )
      },
      {
        name: 'Fitness Profile',
        isComplete: Boolean(watchedValues.fitnessLevel)
      },
      {
        name: 'Ready!',
        isComplete: false
      }
    ];

    const currentStepIndex = steps.findIndex(step => !step.isComplete);
    return {
      steps,
      currentStepIndex: currentStepIndex === -1 ? steps.length - 1 : currentStepIndex
    };
  };

  const { steps, currentStepIndex } = getProgress();

  return (
    <div className="h-[100dvh] max-w-5xl mx-auto relative flex items-center py-6">
      {/* Background Elements - Adjusted size */}
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-gradient-to-br from-[var(--primary)]/5 via-[var(--primary)]/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-gradient-to-tr from-[var(--accent)]/5 via-[var(--accent)]/10 to-transparent rounded-full blur-3xl" />
      
      {/* Main Container */}
      <div className="grid grid-cols-3 gap-6 relative z-10 max-h-[calc(100dvh-3rem)] overflow-y-auto">
        {/* Left Panel */}
        <div className="col-span-1 space-y-3">
          <div className="bg-gradient-to-br from-[var(--card-bg)]/95 to-[var(--card-bg)]/90 backdrop-blur-xl p-6 rounded-2xl border border-[var(--card-border)] shadow-xl relative overflow-hidden">
            {/* Coach Card - Adjusted size */}
            <div className="relative mb-6">
              <div className="relative flex items-end justify-center">
                <div className="w-full h-36 rounded-2xl overflow-hidden ring-1 ring-[var(--card-border)] shadow-lg">
                  <img 
                    src="coach.jpg" 
                    alt="AI Coach" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white text-sm font-medium text-center text-shadow">Your Personal AI Coach</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-2 -top-2 w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                AI
              </div>
            </div>

            {/* Title Section - Adjusted text size */}
            <div className="text-center space-y-2 mb-6">
              <h1 className="text-2xl font-bold">
                <span className="text-[var(--text)] drop-shadow-sm">AI</span>
                <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-transparent bg-clip-text"> Fitness</span>
              </h1>
              <p className="text-sm text-[var(--text-muted)] max-w-[90%] mx-auto leading-relaxed">
                Your personalized journey to a healthier lifestyle begins here
              </p>
            </div>

            {/* Progress Steps */}
            <div className="relative space-y-2">
              <div className="absolute inset-x-0 -top-4 h-px bg-gradient-to-r from-transparent via-[var(--card-border)] to-transparent opacity-50" />
              {steps.map((step, index) => (
                <div key={step.name} 
                     className={`flex items-center p-3 rounded-xl ${
                       index === currentStepIndex 
                         ? 'bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5' 
                         : index < currentStepIndex 
                           ? 'bg-[var(--primary)]/5'
                           : 'opacity-50'
                     }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    index < currentStepIndex
                      ? 'bg-[var(--primary)] text-white'
                      : index === currentStepIndex
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--card-border)] text-[var(--text-muted)]'
                  }`}>
                    {index < currentStepIndex ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="ml-3 text-sm font-medium">
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-2 bg-gradient-to-br from-[var(--card-bg)]/95 to-[var(--card-bg)]/90 backdrop-blur-xl p-7 rounded-2xl border border-[var(--card-border)] shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Gender Selection */}
            <div className="flex gap-5">
              {[
                { value: 'male', icon: BsGenderMale, label: 'Male' },
                { value: 'female', icon: BsGenderFemale, label: 'Female' }
              ].map(({ value, icon: Icon, label }) => (
                <label key={value} className="flex-1">
                  <input
                    type="radio"
                    value={value}
                    {...register('gender', { required: true })}
                    className="hidden"
                  />
                  <div className={`p-5 rounded-xl border-2 shadow-sm ${
                    watchedValues.gender === value 
                      ? 'border-[var(--primary)] bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5' 
                      : 'border-[var(--card-border)] bg-[var(--card-bg)]'
                  }`}>
                    <div className="flex flex-col items-center gap-2">
                      <Icon className="w-7 h-7" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Measurements Grid */}
            <div className="grid grid-cols-3 gap-5">
              {[
                { name: 'height', min: '140', max: '220', unit: 'cm', icon: '📏' },
                { name: 'weight', min: '40', max: '150', unit: 'kg', icon: '⚖️' },
                { name: 'age', min: '16', max: '80', unit: 'years', icon: '🎂' }
              ].map((field) => (
                <div key={field.name} className="group relative bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--card-border)] hover:border-[var(--primary)]/50 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{field.icon}</span>
                      <span className="text-sm font-medium">{field.name.charAt(0).toUpperCase() + field.name.slice(1)}</span>
                    </div>
                    <span className="text-sm font-bold text-[var(--primary)]">
                      {watchedValues[field.name as keyof FormInputs]}{field.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    {...register(field.name as keyof FormInputs, { 
                      required: true,
                      min: field.min,
                      max: field.max 
                    })}
                    min={field.min}
                    max={field.max}
                    className="w-full h-1.5 bg-[var(--input-border)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                  />
                </div>
              ))}
              <style jsx>{`
                input[type="range"]::-webkit-slider-thumb {
                  transition: transform 0.2s;
                }
                input[type="range"]::-webkit-slider-thumb:hover {
                  transform: scale(1.2);
                }
              `}</style>
            </div>

            {/* Fitness Level */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { level: 'beginner', icon: Target, label: 'Beginner' },
                { level: 'intermediate', icon: Trophy, label: 'Intermediate' },
                { level: 'advanced', icon: Crown, label: 'Advanced' }
              ].map(({ level, icon: Icon, label }) => (
                <label key={level} className="cursor-pointer">
                  <input
                    type="radio"
                    value={level}
                    {...register('fitnessLevel', { required: true })}
                    className="hidden"
                  />
                  <div className={`p-4 rounded-xl border-2 transition-all hover:bg-[var(--primary)]/5 ${
                    watchedValues.fitnessLevel === level 
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10' 
                      : 'border-[var(--card-border)]'
                  }`}>
                    <div className="flex flex-col items-center gap-2">
                      <Icon className={`w-6 h-6 ${
                        watchedValues.fitnessLevel === level 
                          ? 'text-[var(--primary)]' 
                          : 'text-[var(--text-muted)]'
                      }`} />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Submit Section */}
            <div className="flex items-center gap-5 pt-5">
              <button
                type="submit"
                disabled={!isValid}
                className={`flex-1 py-3 px-6 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white rounded-xl 
                  shadow-lg relative overflow-hidden ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="relative flex items-center justify-center text-sm font-medium tracking-wide">
                  Begin Your Journey
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              <div className="px-5 py-3 bg-gradient-to-br from-[var(--card-bg)] to-[var(--card-bg)]/90 rounded-xl border border-[var(--card-border)] shadow-md">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--text-muted)] font-medium">Estimated Time:</span>
                  <span className="text-base text-[var(--primary)] font-semibold">5 min</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 