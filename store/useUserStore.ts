import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  userInfo: {
    height: string;
    weight: string;
    age: string;
    gender: string;
    fitnessLevel: string;
    fitnessGoal: string;
  };
  setUserInfo: (info: Partial<UserState['userInfo']>) => void;
  resetUserInfo: () => void;
}

const initialState = {
  height: '',
  weight: '',
  age: '',
  gender: '',
  fitnessLevel: '',
  fitnessGoal: '',
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userInfo: initialState,
      setUserInfo: (info) => 
        set((state) => ({
          userInfo: { ...state.userInfo, ...info }
        })),
      resetUserInfo: () => 
        set({ userInfo: initialState }),
    }),
    {
      name: 'user-storage', // name of the item in localStorage
    }
  )
); 