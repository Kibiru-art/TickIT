import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import axios from 'axios';
import CreateTicketModal from '../components/CreateTicketModal';   // fixed path
import TicketDetailModal from '../components/TicketDetailModal';   // fixed path

const API_BASE_URL = 'http://10.251.50.66:8000/api';

type Ticket = {
  id: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
};

const TicketListScreen: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets/`);
      setTickets(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const openTicketDetail = (ticketId: number) => {
    setSelectedTicketId(ticketId);
    setDetailModalVisible(true);
  };

  const handleTicketCreated = async (newTicket: any) => {
    setTickets(prev => [newTicket, ...prev]);
  };

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ New Ticket</Text>
      </TouchableOpacity>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.ticketItem} onPress={() => openTicketDetail(item.id)}>
            <Text style={styles.ticketTitle}>{item.title}</Text>
            <Text style={styles.ticketStatus}>{item.status}</Text>
          </TouchableOpacity>
        )}
      />

      <CreateTicketModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreateTicket={handleTicketCreated}
      />

      {selectedTicketId && (
        <TicketDetailModal
          visible={detailModalVisible}
          ticketId={selectedTicketId}
          onClose={() => setDetailModalVisible(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  addButton: {
    backgroundColor: '#6200ee', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20,
  },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  ticketItem: {
    padding: 15, marginVertical: 5, backgroundColor: '#f5f5f5', borderRadius: 8,
  },
  ticketTitle: { fontSize: 16, fontWeight: '600' },
  ticketStatus: { fontSize: 12, color: '#666', marginTop: 5 },
});

export default TicketListScreen;