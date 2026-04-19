// App.tsx - with Profile, Settings, and Help screens – FULLY INTEGRATED (test buttons removed)
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Ticket } from './src/types';
import { ticketAPI } from './src/services/api';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NotificationProvider, useNotifications } from './src/context/NotificationContext';
import { SettingsProvider } from './src/context/SettingsContext';
import LoginScreen from './src/screens/LoginScreen';
import TicketCard from './src/components/TicketCard';
import CreateTicketModal from './src/components/CreateTicketModal';
import HelpModal from './src/components/HelpModal';
import TicketDetailModal from './src/components/TicketDetailModal';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import HelpScreen from './src/screens/HelpScreen';

// ======================= IMPROVED SIDEBAR COMPONENT =======================
interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
  userName: string;
  userEmail: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  visible,
  onClose,
  onNavigate,
  userName,
  userEmail,
}) => {
  const translateX = useSharedValue(-300);

  useEffect(() => {
    translateX.value = withTiming(visible ? 0 : -300, { duration: 300 });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX < -50) {
        runOnJS(onClose)();
      }
    });

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'help', label: 'Help & Support', icon: '❓' },
  ];

  const handlePress = (itemId: string) => {
    onClose();
    onNavigate(itemId);
  };

  const getInitial = () => {
    if (!userName) return '?';
    return userName.charAt(0).toUpperCase();
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.sidebarOverlay}>
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.sidebarContainer, animatedStyle]}>
              <TouchableWithoutFeedback>
                <View style={styles.sidebarContent}>
                  <View style={styles.sidebarHeader}>
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>{getInitial()}</Text>
                    </View>
                    <Text style={styles.sidebarUserName}>{userName || 'User'}</Text>
                    <Text style={styles.sidebarUserEmail}>{userEmail || 'user@example.com'}</Text>
                  </View>
                  <View style={styles.menuItems}>
                    {menuItems.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.menuItem}
                        onPress={() => handlePress(item.id)}
                      >
                        <Text style={styles.menuItemIcon}>{item.icon}</Text>
                        <Text style={styles.menuItemLabel}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </GestureDetector>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// ======================= MAIN APP (logged in) – test buttons removed =======================
const MainApp = ({ onOpenSidebar }: { onOpenSidebar: () => void }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [ticketDetailModalVisible, setTicketDetailModalVisible] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) {
      loadTicketsFromDjango();
    } else {
      setTickets([]);
      setLoading(false);
    }
  }, [user]);

  const loadTicketsFromDjango = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await ticketAPI.getMyTickets();
      console.log(`✅ Loaded tickets: ${data.length}`);

      const mappedTickets: Ticket[] = data.map((ticket: any) => ({
        id: ticket.id,
        ticketNumber: ticket.ticket_number || '',
        title: ticket.title || '',
        description: ticket.description || '',
        status: ticket.status || '',
        priority: ticket.priority || '',
        category: ticket.category || '',
        clientName: ticket.client?.name || '',
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
      })).sort((a: { createdAt: string | number | Date; }, b: { createdAt: string | number | Date; }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setTickets(mappedTickets);
    } catch (error: any) {
      console.error('❌ Failed to load tickets:', error);
      Alert.alert('Error', 'Failed to load your tickets from server');
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  const onRefresh = () => loadTicketsFromDjango(true);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = filterStatus === 'All' || ticket.status === filterStatus;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (ticket.title?.toLowerCase().includes(searchLower) ?? false) ||
      (ticket.ticketNumber?.toLowerCase().includes(searchLower) ?? false) ||
      (ticket.clientName?.toLowerCase().includes(searchLower) ?? false) ||
      (ticket.description?.toLowerCase().includes(searchLower) ?? false);
    return matchesStatus && matchesSearch;
  });

  const handleDeleteTicket = async (ticketId: string) => {
    const numericId = parseInt(ticketId, 10);
    try {
      await ticketAPI.deleteTicket(numericId);
      setTickets(tickets.filter((t) => t.id !== numericId));
      Alert.alert('Success', 'Ticket deleted successfully');
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      Alert.alert('Error', 'Failed to delete ticket');
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: Ticket['status']) => {
    const numericId = parseInt(ticketId, 10);
    try {
      await ticketAPI.updateTicketStatus(numericId, newStatus);
      setTickets(
        tickets.map((t) =>
          t.id === numericId ? { ...t, status: newStatus, updatedAt: new Date() } : t
        )
      );
      Alert.alert('Success', `Ticket status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      Alert.alert('Error', 'Failed to update ticket status');
    }
  };

  const handleTicketPress = (ticket: Ticket) => {
    setSelectedTicketId(typeof ticket.id === 'number' ? ticket.id : parseInt(ticket.id as string, 10));
    setTicketDetailModalVisible(true);
  };

  const handleCreateTicket = async (newTicketData: any) => {
    if (isCreating) return;

    try {
      setIsCreating(true);
      console.log('📝 New ticket data:', newTicketData);

      const { attachments, ...ticketPayload } = newTicketData;
      const savedTicket = await ticketAPI.createTicket(ticketPayload);
      console.log('✅ Ticket saved to Django:', savedTicket);

      if (attachments && attachments.length > 0) {
        console.log(`📎 Uploading ${attachments.length} attachments...`);
        const formData = new FormData();
        attachments.forEach((att: any) => {
          let mimeType = 'image/jpeg';
          if (att.type === 'image') {
            if (att.name?.endsWith('.png')) mimeType = 'image/png';
            else mimeType = 'image/jpeg';
          } else if (att.name?.endsWith('.pdf')) {
            mimeType = 'application/pdf';
          }

          formData.append('files', {
            uri: att.uri,
            name: att.name || 'file.jpg',
            type: mimeType,
          } as any);
        });

        await ticketAPI.uploadAttachments(savedTicket.id, formData);
        console.log('✅ Attachments uploaded');
      }

      await loadTicketsFromDjango();
      setModalVisible(false);
      Alert.alert('Success', `Ticket ${savedTicket.ticket_number} created!`);
    } catch (error: any) {
      console.error('❌ Failed to create ticket:', error);
      const errorMsg = error.response?.data || error.message;
      Alert.alert('Error', `Failed to create ticket: ${JSON.stringify(errorMsg)}`);
    } finally {
      setIsCreating(false);
    }
  };

  const statusCounts: Record<string, number> = {
    All: tickets.length,
    Reported: tickets.filter((t) => t.status === 'Reported').length,
    Assigned: tickets.filter((t) => t.status === 'Assigned').length,
    'In Progress': tickets.filter((t) => t.status === 'In Progress').length,
    Resolved: tickets.filter((t) => t.status === 'Resolved').length,
    Closed: tickets.filter((t) => t.status === 'Closed').length,
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading your tickets...</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#6200ee" />

        <View style={styles.header}>
          <TouchableOpacity onPress={onOpenSidebar} style={styles.menuButton}>
            <Text style={styles.menuButtonText}>☰</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>🎫 TickIT</Text>
            <Text style={styles.headerSubtitle}>IT Support Ticket System</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.userName}>{user?.name}</Text>
            <View style={styles.statsBadge}>
              <Text style={styles.statsText}>{tickets.length} Total</Text>
            </View>
          </View>
        </View>

        {/* Test buttons removed */}

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tickets..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
            {['All', 'Reported', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterTab,
                  filterStatus === status && styles.activeFilterTab,
                ]}
                onPress={() => setFilterStatus(status)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    filterStatus === status && styles.activeFilterTabText,
                  ]}
                >
                  {status} {status !== 'All' && `(${statusCounts[status] || 0})`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={filteredTickets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TicketCard
              ticket={item}
              onPress={handleTicketPress}
              onDelete={handleDeleteTicket}
              onStatusChange={handleStatusChange}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tickets found</Text>
              <Text style={styles.emptySubText}>Tap + to create your first ticket</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6200ee']}
              tintColor="#6200ee"
            />
          }
        />

        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

        <CreateTicketModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onCreateTicket={handleCreateTicket}
        />

        <HelpModal visible={helpModalVisible} onClose={() => setHelpModalVisible(false)} />

        <TicketDetailModal
          visible={ticketDetailModalVisible}
          ticketId={selectedTicketId}
          onClose={() => {
            setTicketDetailModalVisible(false);
            setSelectedTicketId(null);
          }}
        />
      </SafeAreaView>
    </>
  );
};

// ======================= AUTHENTICATED ROOT WITH SCREEN SWITCHING =======================
const AuthenticatedApp = () => {
  const { user, logout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'main' | 'profile' | 'settings' | 'help'>('main');
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const handleSidebarNavigate = (screen: string) => {
    switch (screen) {
      case 'profile':
        setCurrentScreen('profile');
        break;
      case 'settings':
        setCurrentScreen('settings');
        break;
      case 'help':
        setCurrentScreen('help');
        break;
      default:
        break;
    }
  };

  const goBackToMain = () => setCurrentScreen('main');

  if (currentScreen === 'profile') {
    return (
      <>
        <ProfileScreen onBack={goBackToMain} />
        <Sidebar
          visible={false}
          onClose={() => {}}
          onNavigate={handleSidebarNavigate}
          userName={user?.name || ''}
          userEmail={user?.email || ''}
        />
      </>
    );
  }

  if (currentScreen === 'settings') {
    return (
      <>
        <SettingsScreen onBack={goBackToMain} />
        <Sidebar
          visible={false}
          onClose={() => {}}
          onNavigate={handleSidebarNavigate}
          userName={user?.name || ''}
          userEmail={user?.email || ''}
        />
      </>
    );
  }

  if (currentScreen === 'help') {
    return (
      <>
        <HelpScreen onBack={goBackToMain} />
        <Sidebar
          visible={false}
          onClose={() => {}}
          onNavigate={handleSidebarNavigate}
          userName={user?.name || ''}
          userEmail={user?.email || ''}
        />
      </>
    );
  }

  // Main screen
  return (
    <>
      <MainApp onOpenSidebar={() => setIsSidebarVisible(true)} />
      <Sidebar
        visible={isSidebarVisible}
        onClose={() => setIsSidebarVisible(false)}
        onNavigate={handleSidebarNavigate}
        userName={user?.name || ''}
        userEmail={user?.email || ''}
      />
    </>
  );
};

// ======================= ROUTER =======================
const AppRouter = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <AuthenticatedApp />;
};

// ======================= ROOT APP =======================
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NotificationProvider>
            <SettingsProvider>
              <AppRouter />
            </SettingsProvider>
          </NotificationProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// ======================= COMPLETE STYLES =======================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6200ee',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: 'white',
  },
  header: {
    backgroundColor: '#6200ee',
    padding: 20,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  statsBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statsText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  testButton: {
    backgroundColor: '#4caf50',
    marginHorizontal: 15,
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  notificationButton: {
    backgroundColor: '#ff9800',
    marginHorizontal: 15,
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
  },
  searchInput: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterSection: {
    marginBottom: 10,
  },
  filterTabs: {
    paddingHorizontal: 15,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilterTab: {
    backgroundColor: '#6200ee',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: 'white',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 8,
    marginRight: 8,
  },
  menuButtonText: {
    fontSize: 28,
    color: 'white',
    fontWeight: '600',
  },
  sidebarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '80%',
    maxWidth: 300,
    backgroundColor: '#fff',
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  sidebarContent: {
    flex: 1,
  },
  sidebarHeader: {
    backgroundColor: '#6200ee',
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  sidebarUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  sidebarUserEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  menuItems: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    marginBottom: 8,
  },
  menuItemIcon: {
    fontSize: 22,
    marginRight: 16,
    width: 30,
  },
  menuItemLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});