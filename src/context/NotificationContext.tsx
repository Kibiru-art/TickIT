import React, { createContext, useContext } from 'react';
import { sendTestNotification } from '../services/notificationService';

interface NotificationContextType {
  sendTestNotification: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sendTest = async () => {
    await sendTestNotification();
  };

  return (
    <NotificationContext.Provider value={{ sendTestNotification: sendTest }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};