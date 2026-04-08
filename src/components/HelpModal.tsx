// src/components/HelpModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📘 Help & Support</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>🔐 Getting Started</Text>
            <Text style={styles.paragraph}>
              • <Text style={styles.bold}>Login</Text>: Enter your username and password. If you don't have an account, tap "Register" to create one.
              {"\n\n"}• <Text style={styles.bold}>Registration</Text>: Fill in your details (username, password, name, email). A technician profile will be created automatically.
            </Text>

            <Text style={styles.sectionTitle}>🎫 Creating a Ticket</Text>
            <Text style={styles.paragraph}>
              • Tap the <Text style={styles.bold}>+</Text> button at the bottom right.
              {"\n"}• Fill in the ticket title, description, category, priority, and client information.
              {"\n"}• You can add attachments (images or PDFs) using the camera or file picker.
              {"\n"}• After submission, the ticket appears in your list with a unique ticket number.
            </Text>

            <Text style={styles.sectionTitle}>📋 Managing Tickets</Text>
            <Text style={styles.paragraph}>
              • <Text style={styles.bold}>View details</Text>: Tap any ticket to see full information.
              {"\n"}• <Text style={styles.bold}>Update status</Text>: Use the status dropdown on each ticket to change its state (Reported → Assigned → In Progress → Resolved → Closed).
              {"\n"}• <Text style={styles.bold}>Delete</Text>: Press the delete icon (trash can) to remove a ticket (cannot be undone).
              {"\n"}• <Text style={styles.bold}>Filter & Search</Text>: Use the status tabs at the top to filter by status, or type in the search bar to find tickets by title, number, or client.
            </Text>

            <Text style={styles.sectionTitle}>📎 Attachments</Text>
            <Text style={styles.paragraph}>
              When creating a ticket, you can attach images or PDFs. The app will upload them to the server, and they will be linked to the ticket.
            </Text>

            <Text style={styles.sectionTitle}>🔔 Notifications</Text>
            <Text style={styles.paragraph}>
              You can test push notifications using the "Test Notification" button. In a production environment, notifications will alert you about ticket updates.
            </Text>

            <Text style={styles.sectionTitle}>🌐 Connection Test</Text>
            <Text style={styles.paragraph}>
              Use the "Test Connection" button to verify that the app can reach the backend server. If it fails, check your network settings and ensure the server is running.
            </Text>

            <Text style={styles.sectionTitle}>🚪 Logout</Text>
            <Text style={styles.paragraph}>
              Tap the "Logout" button in the header to sign out. Your session will end, and you will return to the login screen.
            </Text>

            <Text style={styles.footer}>
              For further assistance, contact your IT support team.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6200ee',
    marginTop: 15,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  footer: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
});

export default HelpModal;