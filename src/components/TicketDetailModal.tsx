// src/components/TicketDetailModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, TouchableOpacity, Image, ScrollView,
  ActivityIndicator, Alert, StyleSheet, Linking
} from 'react-native';
import { ticketAPI } from '../services/api';

type Props = {
  visible: boolean;
  ticketId: number | null;
  onClose: () => void;
};

const TicketDetailModal: React.FC<Props> = ({ visible, ticketId, onClose }) => {
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && ticketId) {
      fetchTicketDetails();
    }
  }, [visible, ticketId]);

  const fetchTicketDetails = async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const data = await ticketAPI.getTicket(ticketId);
      setTicket(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (attachmentId: number) => {
    Alert.alert('Confirm Delete', 'Delete this attachment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          // Delete endpoint not yet implemented in backend
          Alert.alert('Not Implemented', 'Attachment deletion is not yet implemented.');
          // Future: await api.delete(`/attachments/${attachmentId}/`);
          // fetchTicketDetails();
        },
      },
    ]);
  };

  const openAttachment = (url: string) => {
    // If backend returns relative path, prepend base URL
    const fullUrl = url.startsWith('http') ? url : `http://10.251.50.66:8000${url}`;
    Linking.openURL(fullUrl).catch(() => Alert.alert('Error', 'Could not open file'));
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Ticket Details</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            {ticket && (
              <>
                <Text style={styles.ticketNumber}>#{ticket.ticket_number}</Text>
                <Text style={styles.ticketTitle}>{ticket.title}</Text>
                <Text style={styles.ticketDesc}>{ticket.description}</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status:</Text>
                  <Text style={styles.infoValue}>{ticket.status}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Priority:</Text>
                  <Text style={styles.infoValue}>{ticket.priority}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Category:</Text>
                  <Text style={styles.infoValue}>{ticket.category}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Client:</Text>
                  <Text style={styles.infoValue}>{ticket.client?.name || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{ticket.client?.email || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phone:</Text>
                  <Text style={styles.infoValue}>{ticket.client?.phone || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Created:</Text>
                  <Text style={styles.infoValue}>{new Date(ticket.created_at).toLocaleString()}</Text>
                </View>

                <Text style={styles.sectionTitle}>
                  Attachments ({ticket.attachments?.length || 0})
                </Text>
                {!ticket.attachments?.length && <Text>No attachments</Text>}
                <View style={styles.attachmentsGrid}>
                  {ticket.attachments?.map((att: any) => (
                    <View key={att.id} style={styles.attachmentCard}>
                      {att.file?.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                        <Image source={{ uri: att.file }} style={styles.thumbnail} />
                      ) : (
                        <View style={styles.fileIconContainer}>
                          <Text style={styles.fileIcon}>📄</Text>
                        </View>
                      )}
                      <Text style={styles.fileName} numberOfLines={1}>
                        {att.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => openAttachment(att.file)}
                        style={styles.openButton}
                      >
                        <Text style={styles.openText}>Open</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(att.id)}
                        style={styles.deleteButton}
                      >
                        <Text style={styles.deleteText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  closeButton: { fontSize: 24, color: '#666' },
  loader: { marginTop: 50 },
  content: { padding: 16 },
  ticketNumber: { fontSize: 14, color: '#666', marginBottom: 4 },
  ticketTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  ticketDesc: { fontSize: 16, color: '#333', marginBottom: 12 },
  infoRow: { flexDirection: 'row', marginBottom: 6 },
  infoLabel: { width: 80, fontWeight: '600', color: '#555' },
  infoValue: { flex: 1, color: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginVertical: 12 },
  attachmentsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  attachmentCard: {
    width: 100, margin: 5, alignItems: 'center', borderWidth: 1,
    borderColor: '#ddd', borderRadius: 8, padding: 5,
  },
  thumbnail: { width: 80, height: 80, borderRadius: 4 },
  fileIconContainer: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
  fileIcon: { fontSize: 40 },
  fileName: { fontSize: 10, textAlign: 'center', marginTop: 4 },
  deleteButton: { marginTop: 5 },
  deleteText: { color: 'red', fontSize: 12 },
  openButton: { marginTop: 2 },
  openText: { color: '#6200ee', fontSize: 12, marginTop: 2 },
});

export default TicketDetailModal;