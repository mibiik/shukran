
import { useContext } from 'react';
import { GratitudeContext } from '../contexts/GratitudeContext';

export const useGratitude = () => {
  const context = useContext(GratitudeContext);
  if (context === undefined) {
    throw new Error('useGratitude must be used within a GratitudeProvider');
  }
  return context;
};
