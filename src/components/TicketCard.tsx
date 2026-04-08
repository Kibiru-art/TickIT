// src/components/TicketCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ticket } from '../types';

type Props = {
  ticket: Ticket;
  onPress: (ticket: Ticket) => void;
  onDelete: (ticketId: string) => void;
  onStatusChange: (ticketId: string, newStatus: Ticket['status']) => void;
};

const TicketCard: React.FC<Props> = ({ ticket, onPress, onDelete, onStatusChange }) => {
  const handleDelete = () => {
    Alert.alert(
      'Delete Ticket',
      'Are you sure you want to delete this ticket?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => onDelete(String(ticket.id)), // ✅ Convert to string
          style: 'destructive',
        },
      ]
    );
  };

  // Helper: format date safely (handles string, Date, or undefined)
  const formatDate = (dateValue: string | Date | undefined) => {
    if (!dateValue) return 'No date';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleString(); // e.g., "3/25/2026, 2:30:15 PM"
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return '#d32f2f';
      case 'High': return '#f57c00';
      case 'Medium': return '#1976d2';
      case 'Low': return '#388e3c';
      default: return '#757575';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Reported': return '#f57c00';
      case 'Assigned': return '#1976d2';
      case 'In Progress': return '#7b1fa2';
      case 'Resolved': return '#388e3c';
      case 'Closed': return '#757575';
      default: return '#757575';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(ticket)}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
          <Text style={styles.title}>{ticket.title}</Text>
        </View>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.deleteButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.clientName}>Client: {ticket.clientName}</Text>
      <Text style={styles.description} numberOfLines={2}>{ticket.description}</Text>

      <View style={styles.badgeContainer}>
        <View style={[styles.badge, { backgroundColor: getPriorityColor(ticket.priority) }]}>
          <Text style={styles.badgeText}>{ticket.priority}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: getStatusColor(ticket.status) }]}>
          <Text style={styles.badgeText}>{ticket.status}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.dateText}>
          Created: {formatDate(ticket.createdAt)}
        </Text>
        {ticket.assignedTo && (
          <Text style={styles.assignedText}>Assigned to: {ticket.assignedTo.name}</Text>
        )}
      </View>

      {/* Quick status update buttons */}
      <View style={styles.statusButtons}>
        {['Reported', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              ticket.status === status && styles.activeStatusButton,
            ]}
            onPress={() => onStatusChange(String(ticket.id), status as Ticket['status'])}
          >
            <Text style={[
              styles.statusButtonText,
              ticket.status === status && styles.activeStatusButtonText
            ]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  ticketNumber: {
    fontSize: 12,
    color: '#6200ee',
    fontWeight: '600',
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deleteButton: {
    fontSize: 18,
    color: '#d32f2f',
    paddingHorizontal: 8,
  },
  clientName: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    marginBottom: 12,
  },
  dateText: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  assignedText: {
    fontSize: 11,
    color: '#6200ee',
    fontWeight: '500',
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    gap: 4,
  },
  statusButton: {
    flex: 1,
    minWidth: '18%',
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 4,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  activeStatusButton: {
    backgroundColor: '#6200ee',
  },
  statusButtonText: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
  },
  activeStatusButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default TicketCard;