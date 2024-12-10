import { ReactNode } from 'react';

export interface Exercise {
  id: string;
  name: string;
  targetReps: number;
  description: string;
  keyPoints: string[];
  musclesTargeted: string[];
  icon?: ReactNode;
}

export const exercises: Exercise[] = [
  {
    id: 'deadlift',
    name: 'Deadlift',
    targetReps: 3,
    description: 'A compound exercise that works multiple muscle groups',
    keyPoints: [
      'Keep your back straight',
      'Push through your heels',
      'Keep the bar close to your body'
    ],
    musclesTargeted: ['Lower Back', 'Hamstrings', 'Glutes']
  },
  {
    id: 'squat',
    name: 'Squat',
    targetReps: 3,
    description: 'A fundamental lower body exercise',
    keyPoints: [
      'Keep chest up',
      'Knees in line with toes',
      'Hip crease below parallel'
    ],
    musclesTargeted: ['Quadriceps', 'Glutes', 'Core']
  }
]; 