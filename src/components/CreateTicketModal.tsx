// src/components/CreateTicketModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ProblemCategory, Priority, Attachment } from '../types';
import CameraAttachment from './CameraAttachment';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreateTicket: (ticketData: any) => Promise<void>;
};

const CreateTicketModal: React.FC<Props> = ({ visible, onClose, onCreateTicket }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProblemCategory>('Computer Support');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [operatingSystem, setOperatingSystem] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: ProblemCategory[] = [
    'Network Issue',
    'Computer Support',
    'Database Issue',
    'General Repair',
    'Systems Issue',
    'Other',
  ];

  const priorities: Priority[] = ['Critical', 'High', 'Medium', 'Low'];

  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case 'Critical': return '#d32f2f';
      case 'High': return '#f57c00';
      case 'Medium': return '#1976d2';
      case 'Low': return '#388e3c';
      default: return '#757575';
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a ticket title');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please describe the problem');
      return;
    }
    if (!clientName.trim()) {
      Alert.alert('Error', 'Please enter client name');
      return;
    }
    if (!clientEmail.trim()) {
      Alert.alert('Error', 'Please enter client email');
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketData = {
        title: title.trim(),
        description: description.trim(),
        status: 'Reported',
        category,
        priority,
        client_data: {
          name: clientName.trim(),
          email: clientEmail.trim(),
          phone: clientPhone.trim() || '',
          department: '',
        },
        device_type: deviceType,
        operating_system: operatingSystem,
        error_message: errorMessage,
        attachments, // pass attachments so parent can upload them
      };

      await onCreateTicket(ticketData);

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('Computer Support');
      setPriority('Medium');
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setDeviceType('');
      setOperatingSystem('');
      setErrorMessage('');
      setAttachments([]);

      onClose();
    } catch (error) {
      console.error('Creation error:', error);
      Alert.alert('Error', 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create New Ticket</Text>
            <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Basic Information</Text>
              <TextInput
                style={styles.input}
                placeholder="Ticket Title *"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#999"
                editable={!isSubmitting}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Problem Description *"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                placeholderTextColor="#999"
                editable={!isSubmitting}
              />
            </View>

            {/* Category & Priority */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚙️ Category & Priority</Text>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={category}
                  onValueChange={(value) => setCategory(value as ProblemCategory)}
                  style={styles.picker}
                  enabled={!isSubmitting}>
                  {categories.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityButtons}>
                {priorities.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityButton,
                      priority === p && styles.selectedPriority,
                      { backgroundColor: priority === p ? getPriorityColor(p) : '#f0f0f0' }
                    ]}
                    onPress={() => setPriority(p)}
                    disabled={isSubmitting}>
                    <Text style={[
                      styles.priorityButtonText,
                      priority === p && styles.selectedPriorityText
                    ]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Client Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👤 Client Information</Text>
              <TextInput
                style={styles.input}
                placeholder="Client Name *"
                value={clientName}
                onChangeText={setClientName}
                placeholderTextColor="#999"
                editable={!isSubmitting}
              />
              <TextInput
                style={styles.input}
                placeholder="Client Email *"
                value={clientEmail}
                onChangeText={setClientEmail}
                keyboardType="email-address"
                placeholderTextColor="#999"
                editable={!isSubmitting}
              />
              <TextInput
                style={styles.input}
                placeholder="Client Phone"
                value={clientPhone}
                onChangeText={setClientPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
                editable={!isSubmitting}
              />
            </View>

            {/* Technical Details (optional) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💻 Technical Details</Text>
              <Text style={styles.helpText}>Optional – will be added in future updates</Text>
              <TextInput
                style={styles.input}
                placeholder="Device Type (e.g., Dell XPS 15)"
                value={deviceType}
                onChangeText={setDeviceType}
                placeholderTextColor="#999"
                editable={!isSubmitting}
              />
              <TextInput
                style={styles.input}
                placeholder="Operating System"
                value={operatingSystem}
                onChangeText={setOperatingSystem}
                placeholderTextColor="#999"
                editable={!isSubmitting}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Error Message (if any)"
                value={errorMessage}
                onChangeText={setErrorMessage}
                multiline
                numberOfLines={2}
                placeholderTextColor="#999"
                editable={!isSubmitting}
              />
            </View>

            {/* Attachments */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📎 Attachments</Text>
              <CameraAttachment
                onAttachmentsChange={setAttachments}
                existingAttachments={attachments}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={isSubmitting}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Create Ticket</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: Platform.OS === 'ios' ? 40 : 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    marginTop: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    marginBottom: 10,
  },
  picker: {
    height: 50,
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  priorityButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 3,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectedPriority: {
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  priorityButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  selectedPriorityText: {
    color: 'white',
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#6200ee',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CreateTicketModal;