'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Activity, Mic, Volume2, Heart, Flame, Timer } from 'lucide-react'; // Import Lucide icons

type FormIssue = {
  id: string;
  severity: 'high' | 'medium' | 'low';
  content: string;
  suggestion: string;
  bodyPart: 'back' | 'knees' | 'hips' | 'shoulders' | 'general';
  impact: number;
};

type AIChatWidgetProps = {
  formIssues?: string[];
  heartRate?: number;
  caloriesBurned?: number;
  timeElapsed?: number;
};

export default function AIChatWidget({ 
  formIssues = [], 
}: AIChatWidgetProps) {
  const [activeIssues, setActiveIssues] = useState<FormIssue[]>([]);
  const [performanceScore, setPerformanceScore] = useState(85);

  // Add refs to track speech state
  const speechQueue = useRef<string[]>([]);
  const isSpeaking = useRef(false);
  const lastSpokenText = useRef<string>('');

  const calculatePerformanceScore = (issues: FormIssue[]) => {
    if (!issues.length) return 85; // default score
    const totalImpact = issues.reduce((total, issue) => total + issue.impact, 0);
    const averageImpact = totalImpact / issues.length;
    return Math.round(100 - (averageImpact * 0.3)); // Scale the impact to make smaller adjustments
  };

  // Transform form issues into more detailed format
  useEffect(() => {
    if (formIssues.length > 0) {
      const transformedIssues: FormIssue[] = formIssues.map(issue => ({
        id: crypto.randomUUID(),
        severity: getSeverity(),
        content: issue,
        suggestion: getFormCorrectionMessage(issue),
        bodyPart: getBodyPart(issue),
        impact: calculateIssueImpact(issue)
      }));

      setActiveIssues(transformedIssues);
      setPerformanceScore(calculatePerformanceScore(transformedIssues));
    }
  }, [formIssues]);

  const processSpeechQueue = useCallback(() => {
    if (speechQueue.current.length === 0 || isSpeaking.current) {
      return;
    }

    isSpeaking.current = true;
    const textToSpeak = speechQueue.current[0];

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.9;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    // Try to find an English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      voice.lang.includes('en') && !voice.lang.includes('en-IN')
    );
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    // Handle speech completion
    utterance.onend = () => {
      isSpeaking.current = false;
      speechQueue.current.shift(); // Remove the spoken text
      lastSpokenText.current = textToSpeak;
      // Process next item in queue if any
      processSpeechQueue();
    };

    // Handle speech errors
    utterance.onerror = () => {
      isSpeaking.current = false;
      speechQueue.current.shift();
      processSpeechQueue();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback((text: string) => {
    // Don't add duplicate messages in sequence
    if (lastSpokenText.current === text) {
      return;
    }

    // If the new message is critical, clear the queue
    const isCriticalMessage = text.toLowerCase().includes('immediately') || 
                            text.toLowerCase().includes('stop');
    
    if (isCriticalMessage) {
      window.speechSynthesis.cancel();
      speechQueue.current = [text];
      isSpeaking.current = false;
    } else {
      // Limit queue size to prevent backup
      if (speechQueue.current.length < 3) {
        speechQueue.current.push(text);
      }
    }

    processSpeechQueue();
  }, [processSpeechQueue]);

  // Speak new form issues
  useEffect(() => {
    if (formIssues.length > 0) {
      const lastIssue = formIssues[formIssues.length - 1];
      const suggestion = getFormCorrectionMessage(lastIssue);
      // Clean the text before speaking (remove emojis)
      const cleanText = suggestion.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
      speak(cleanText);
    }
  }, [formIssues, speak]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      speechQueue.current = [];
      isSpeaking.current = false;
    };
  }, []);

  // Replace the existing trainingMetrics with this new version
  



  return (
    <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--card-border)] flex-1 flex flex-col min-h-0">
      {/* Header with Performance Score */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <svg className="w-20 h-20 transform -rotate-90">
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'var(--primary)', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: 'var(--accent)', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <circle
                className="text-[var(--primary)]/5"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="32"
                cx="40"
                cy="40"
              />
              <circle
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                fill="transparent"
                r="32"
                cx="40"
                cy="40"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - performanceScore / 100)}`}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-transparent bg-clip-text">
                {performanceScore}
              </span>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-transparent bg-clip-text">
              Form Analysis
            </h2>
            <p className="text-sm text-[var(--text-muted)]">Real-time feedback</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary)]/5 text-sm">
            <Volume2 className="w-4 h-4 text-[var(--primary)]" />
            <div className="flex h-2 gap-1">
              {[0, 75, 150].map((delay) => (
                <div
                  key={delay}
                  className="animate-pulse w-1 h-1 rounded-full bg-[var(--primary)]"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/5 text-sm">
            <Mic className="w-4 h-4 text-green-500" />
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
      </div>


      {/* Active Issues Stack - Enhanced Version */}
      <div className="space-y-3 mb-6">
        {activeIssues.map(issue => (
          <div
            key={issue.id}
            className={`p-4 rounded-xl border backdrop-blur-sm ${getSeverityColor(issue.severity)} 
              bg-gradient-to-r from-[var(--input-bg)] to-[var(--input-bg)]/80
              hover:shadow-lg hover:shadow-[var(--primary)]/5 
              hover:-translate-y-0.5
              transition-all duration-300 group relative
              before:absolute before:inset-0 before:rounded-xl
              before:bg-gradient-to-r before:from-[var(--primary)]/5 before:to-transparent
              before:opacity-0 before:transition-opacity before:duration-300
              hover:before:opacity-100`}
          >
            {/* Decorative Elements */}
            <div className="absolute -right-1 -top-1 w-20 h-20 bg-gradient-to-br from-[var(--primary)]/10 to-transparent rounded-full blur-2xl group-hover:opacity-100 opacity-0 transition-opacity" />
            
            <div className="relative">
              {/* Header Row */}
              <div className="flex items-center justify-between mb-3">
                {/* Left side: Body Part and Severity */}
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-medium bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 
                    px-3 py-1.5 rounded-full border border-[var(--primary)]/10 
                    group-hover:border-[var(--primary)]/20 transition-colors">
                    {issue.bodyPart}
                  </span>
                  <div className={`px-3 py-1.5 rounded-full text-sm font-medium
                    ${getSeverityBadgeColor(issue.severity)} 
                    shadow-sm shadow-[var(--card-border)]
                    group-hover:shadow-md transition-shadow`}>
                    {issue.severity}
                  </div>
                </div>

                {/* Right side: Impact Score */}
                <div className="flex items-center gap-3">
                  <div className="relative w-28 h-2 bg-[var(--primary)]/5 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]
                        transition-all duration-700 ease-out"
                      style={{ width: `${Math.round(issue.impact)}%` }}
                    />
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent to-white/10 rounded-full" />
                  </div>
                  <span className="text-sm font-semibold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] 
                    text-transparent bg-clip-text">
                    {Math.round(issue.impact)}%
                  </span>
                </div>
              </div>

              {/* Suggestion Text */}
              <p className="text-sm font-medium leading-relaxed
                group-hover:text-[var(--primary)] transition-colors
                relative before:absolute before:-left-2 before:top-1/2 before:-translate-y-1/2
                before:w-0.5 before:h-0 before:bg-[var(--primary)]
                group-hover:before:h-full before:transition-all before:duration-300">
                {issue.suggestion}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper functions
const getSeverity = () => {
  const random = Math.random();
  if (random > 0.7) return 'high';
  if (random > 0.4) return 'medium';
  return 'low';
};

const getSeverityColor = (severity: string) => {
  const colors = {
    high: 'border-red-500',
    medium: 'border-yellow-500',
    low: 'border-green-500'
  };
  return colors[severity as keyof typeof colors];
};

const getSeverityBadgeColor = (severity: string) => {
  const colors = {
    high: 'bg-red-500/10 text-red-500',
    medium: 'bg-yellow-500/10 text-yellow-500',
    low: 'bg-green-500/10 text-green-500'
  };
  return colors[severity as keyof typeof colors];
};

const getBodyPart = (issue: string): FormIssue['bodyPart'] => {
  if (issue.toLowerCase().includes('back')) return 'back';
  if (issue.toLowerCase().includes('knee')) return 'knees';
  if (issue.toLowerCase().includes('hip')) return 'hips';
  if (issue.toLowerCase().includes('shoulder')) return 'shoulders';
  return 'general';
};

const getFormCorrectionMessage = (issue: string): string => {
  const corrections = {
    'back_straight': "🎯 Imagine a golden thread pulling your spine towards the sky! Keep that royal posture.",
    'knees_aligned': "🚂 Your knees are like train wheels - they should roll smoothly along invisible tracks aligned with your toes.",
    'depth': "🪑 Picture yourself gracefully lowering onto a throne - maintain that regal control!",
    'balance': "🌳 Root yourself like a mighty oak tree - power flows from your heels to the ground.",
    'Uneven shoulders': "📚 Balance like a master librarian carrying precious books - keep those shoulders level and steady.",
    'Uneven hips': "🍹 You're a skilled waiter carrying a tray of expensive drinks through a crowded room - keep those hips steady!",
    'Left knee tracking incorrectly': "🎯 Your left knee is a precise arrow - let it fly straight over your toes!",
    'Right knee tracking incorrectly': "🎮 Guide your right knee like a pro gamer - precise and controlled over those toes!",
    'core_engagement': "🛡️ Activate your core like a warrior's armor - strong and protective!",
    'breathing_rhythm': " Flow like ocean waves - breathe deep and rhythmic through your movement.",
    'tempo_control': "🎵 Move like a dancer - smooth, controlled, and with perfect timing.",
    'foot_placement': "🎯 Plant those feet like you're setting anchors - stable and purposeful!"
  };

  // If no exact match, generate a dynamic message
  return corrections[issue as keyof typeof corrections] || 
    `💫 ${issue} - Focus on this movement pattern with mindful attention!`;
};

// Add this new helper function for more varied impact calculations
const calculateIssueImpact = (issue: string): number => {
  const baseImpact = Math.random() * 20 + 60; // Base impact between 60-80
  const severityMultiplier = {
    back: 1.2,    // Back issues are more critical
    knees: 1.15,  // Knee alignment is important
    hips: 1.1,    // Hip issues affect overall form
    shoulders: 1.05,
    general: 1.0
  };
  
  const bodyPart = getBodyPart(issue);
  return Math.min(100, baseImpact * severityMultiplier[bodyPart]);
};