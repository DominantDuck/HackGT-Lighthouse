import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTheme } from '@/providers/ThemeProvider';

interface UploadTileProps {
  onImageSelected: (uri: string) => void;
  onImageProcessed?: (uri: string) => void;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  compress?: boolean;
  style?: any;
}

export function UploadTile({
  onImageSelected,
  onImageProcessed,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.8,
  compress = true,
  style,
}: UploadTileProps) {
  const { colors, spacing, typography } = useTheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photo library to upload prescription images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        onImageSelected(imageUri);
        
        if (compress) {
          await processImage(imageUri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your camera to take prescription photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        onImageSelected(imageUri);
        
        if (compress) {
          await processImage(imageUri);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const processImage = async (uri: string) => {
    setIsProcessing(true);
    try {
      const processedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: {
              width: maxWidth,
              height: maxHeight,
            },
          },
        ],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      onImageProcessed?.(processedImage.uri);
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to add a prescription image',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
      onPress={showImageOptions}
      disabled={isProcessing}
    >
      {selectedImage ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.image} />
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.processingText, { color: colors.text }]}>
                Processing...
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
            📷
          </Text>
          <Text style={[styles.placeholderLabel, { color: colors.text }]}>
            Tap to add prescription image
          </Text>
          <Text style={[styles.placeholderSubtext, { color: colors.textSecondary }]}>
            Camera or Photo Library
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 12,
  },
  placeholderLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
