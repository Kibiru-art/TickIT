// src/context/SettingsContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsContextData {
  theme: ThemeMode;
  notificationsEnabled: boolean;
  updateTheme: (theme: ThemeMode) => Promise<void>;
  updateNotifications: (enabled: boolean) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextData>({} as SettingsContextData);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('app_theme');
        if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
          setTheme(storedTheme as ThemeMode);
        }
        const storedNotifications = await AsyncStorage.getItem('notifications_enabled');
        if (storedNotifications !== null) {
          setNotificationsEnabled(storedNotifications === 'true');
        }
      } catch (error) {
        console.error('Failed to load settings', error);
      }
    };
    loadSettings();
  }, []);

  const updateTheme = async (newTheme: ThemeMode) => {
    setTheme(newTheme);
    await AsyncStorage.setItem('app_theme', newTheme);
    // You could also apply theme globally here (if you implement dynamic theming)
  };

  const updateNotifications = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    await AsyncStorage.setItem('notifications_enabled', String(enabled));
    // Optionally register/unregister for push notifications
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        notificationsEnabled,
        updateTheme,
        updateNotifications,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);