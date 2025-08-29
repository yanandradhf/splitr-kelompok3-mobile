import React from 'react';
import { View } from 'react-native';
import { useAutoLogout } from '../../hooks/useAutoLogout';

interface ActivityTrackerProps {
  children: React.ReactNode;
}

export const ActivityTracker: React.FC<ActivityTrackerProps> = ({ children }) => {
  const { resetTimer } = useAutoLogout();

  const handleUserActivity = () => {
    resetTimer();
  };

  return (
    <View 
      style={{ flex: 1 }}
      onTouchStart={handleUserActivity}
      onResponderGrant={handleUserActivity}
    >
      {children}
    </View>
  );
};