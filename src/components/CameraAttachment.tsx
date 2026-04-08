// src/components/CameraAttachment.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Attachment } from '../types';

type Props = {
  onAttachmentsChange: (attachments: Attachment[]) => void;
  existingAttachments?: Attachment[];
};

const CameraAttachment: React.FC<Props> = ({ onAttachmentsChange, existingAttachments = [] }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [attachments, setAttachments] = useState<Attachment[]>(existingAttachments);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
          skipProcessing: false,
        });

        if (photo) {
          console.log('📸 Photo URI:', photo.uri); // ✅ Log the URI

          const newAttachment: Attachment = {
            id: Date.now().toString(),
            uri: photo.uri,
            type: 'image',
            name: `camera-${Date.now()}.jpg`,
            uploadedAt: new Date(),
          };

          console.log('✅ New attachment created:', newAttachment);

          const updatedAttachments = [...attachments, newAttachment];
          setAttachments(updatedAttachments);
          onAttachmentsChange(updatedAttachments);
          setCameraVisible(false);
        }
      } catch (error) {
        console.error('Camera error:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newAttachments: Attachment[] = result.assets.map((asset) => {
          console.log('🖼️ Asset URI:', asset.uri); // ✅ Log each asset URI
          console.log('   Type:', asset.type);
          console.log('   Name:', asset.fileName);

          return {
            id: asset.assetId || Date.now().toString() + Math.random(),
            uri: asset.uri,
            type: asset.type === 'image' ? 'image' : 'file',
            name: asset.fileName || `file-${Date.now()}`,
            size: asset.fileSize,
            uploadedAt: new Date(),
          };
        });

        console.log('✅ New attachments from gallery:', newAttachments);

        const updatedAttachments = [...attachments, ...newAttachments];
        setAttachments(updatedAttachments);
        onAttachmentsChange(updatedAttachments);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeAttachment = (id: string) => {
    const updatedAttachments = attachments.filter((att) => att.id !== id);
    setAttachments(updatedAttachments);
    onAttachmentsChange(updatedAttachments);
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need camera permission to take photos of computer issues</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setCameraVisible(true)}>
          <Text style={styles.actionButtonText}>📸 Take Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
          <Text style={styles.actionButtonText}>🖼️ Choose from Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Camera Modal */}
      <Modal visible={cameraVisible} animationType="slide">
  <View style={styles.cameraContainer}>
    <CameraView
      style={styles.camera}
      ref={cameraRef}
      facing="back"
    />
    {/* Controls are now separate, absolutely positioned */}
    <View style={styles.cameraControls}>
      <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
        <View style={styles.captureInner} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeButton} onPress={() => setCameraVisible(false)}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <View style={styles.attachmentsContainer}>
          <Text style={styles.attachmentsTitle}>Attachments ({attachments.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {attachments.map((att) => (
              <View key={att.id} style={styles.attachmentPreview}>
                {att.type === 'image' ? (
                  <Image source={{ uri: att.uri }} style={styles.previewImage} />
                ) : (
                  <View style={styles.filePreview}>
                    <Text style={styles.fileIcon}>📄</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeAttachment(att.id)}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {att.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 30,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  attachmentsContainer: {
    marginTop: 15,
  },
  attachmentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  attachmentPreview: {
    width: 100,
    height: 120,
    marginRight: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 80,
    resizeMode: 'cover',
  },
  filePreview: {
    width: '100%',
    height: 80,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileIcon: {
    fontSize: 40,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  attachmentName: {
    fontSize: 10,
    color: '#333',
    padding: 5,
    textAlign: 'center',
  },
});

export default CameraAttachment;