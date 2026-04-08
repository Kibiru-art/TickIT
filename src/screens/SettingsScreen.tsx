// src/screens/SettingsScreen.tsx
import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useSettings, ThemeMode } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { theme, notificationsEnabled, updateTheme, updateNotifications } = useSettings();
  const { user, logout } = useAuth();

  const handleThemeChange = (newTheme: ThemeMode) => {
    updateTheme(newTheme);
    // For now just show a message; later you can actually change the theme
    Alert.alert('Theme changed', `Theme set to ${newTheme}. Restart app to see full effect.`);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Theme</Text>
            <View style={styles.themeButtons}>
              <TouchableOpacity
                style={[styles.themeButton, theme === 'light' && styles.activeThemeButton]}
                onPress={() => handleThemeChange('light')}
              >
                <Text style={[styles.themeButtonText, theme === 'light' && styles.activeThemeText]}>Light</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.themeButton, theme === 'dark' && styles.activeThemeButton]}
                onPress={() => handleThemeChange('dark')}
              >
                <Text style={[styles.themeButtonText, theme === 'dark' && styles.activeThemeText]}>Dark</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.themeButton, theme === 'system' && styles.activeThemeButton]}
                onPress={() => handleThemeChange('system')}
              >
                <Text style={[styles.themeButtonText, theme === 'system' && styles.activeThemeText]}>System</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={updateNotifications}
              trackColor={{ false: '#767577', true: '#6200ee' }}
              thumbColor={notificationsEnabled ? '#f4f3f4' : '#f4f3f4'}
            />
          </View>
          <Text style={styles.settingHint}>
            {notificationsEnabled
              ? 'You will receive updates about your tickets.'
              : 'You will not receive any push notifications.'}
          </Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Logged in as</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.versionText}>1.0.0</Text>
          </View>
          <Text style={styles.settingHint}>TickIT – IT Support Ticket System</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200ee',
    padding: 20,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 28,
    color: 'white',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeThemeButton: {
    backgroundColor: '#6200ee',
  },
  themeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeThemeText: {
    color: 'white',
  },
  settingHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 12,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionText: {
    fontSize: 14,
    color: '#666',
  },
});

export default SettingsScreen;