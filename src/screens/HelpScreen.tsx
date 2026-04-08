// src/screens/HelpScreen.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // optional, for icons; if not installed, use emojis or remove

interface HelpScreenProps {
  onBack: () => void;
}

const HelpScreen: React.FC<HelpScreenProps> = ({ onBack }) => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: 'How do I create a new ticket?',
      answer: 'Tap the "+" button on the main screen, fill in the ticket details, and submit.',
    },
    {
      id: 2,
      question: 'How can I track the status of my ticket?',
      answer: 'Tickets are listed on the main screen. Tap on any ticket to see its details and current status.',
    },
    {
      id: 3,
      question: 'Can I upload attachments?',
      answer: 'Yes, when creating a ticket you can add images or PDFs as attachments.',
    },
    {
      id: 4,
      question: 'How do I update my profile?',
      answer: 'Open the sidebar (☰) and select Profile. There you can change your name, phone, and specialty.',
    },
    {
      id: 5,
      question: 'How do I change my password?',
      answer: 'Go to Settings from the sidebar, then tap "Change Password" in the Account section.',
    },
  ];

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleEmailSupport = () => {
    const email = 'support@tickit.com';
    const subject = 'TickIT Support Request';
    const body = 'Please describe your issue...';
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  const handleCallSupport = () => {
    const phone = '+1234567890';
    Linking.openURL(`tel:${phone}`);
  };

  const handleShareFeedback = () => {
    Share.share({
      message: 'I\'m using TickIT – the IT support ticket system. Check it out!',
    });
  };

  const appVersion = '1.0.0';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <TouchableOpacity style={styles.contactItem} onPress={handleEmailSupport}>
            <Text style={styles.contactIcon}>📧</Text>
            <Text style={styles.contactText}>support@tickit.com</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactItem} onPress={handleCallSupport}>
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={styles.contactText}>+254 (115) 782-440</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleFAQ(faq.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <Text style={styles.faqIcon}>
                  {expandedFAQ === faq.id ? '▼' : '▶'}
                </Text>
              </TouchableOpacity>
              {expandedFAQ === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About TickIT</Text>
          <Text style={styles.appVersion}>Version {appVersion}</Text>
          <Text style={styles.appDescription}>
            TickIT is an IT support ticket management system designed to streamline issue tracking and resolution.
          </Text>
          <TouchableOpacity style={styles.feedbackButton} onPress={handleShareFeedback}>
            <Text style={styles.feedbackButtonText}>📢 Share Feedback</Text>
          </TouchableOpacity>
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
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
  },
  contactText: {
    fontSize: 16,
    color: '#6200ee',
  },
  faqItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  faqQuestionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    paddingRight: 10,
  },
  faqIcon: {
    fontSize: 14,
    color: '#999',
  },
  faqAnswer: {
    paddingBottom: 12,
    paddingLeft: 8,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  appVersion: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  feedbackButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  feedbackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HelpScreen;