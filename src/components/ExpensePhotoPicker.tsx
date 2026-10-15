import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { LiquidGlassColors, Spacing } from '@/constants/theme';

interface ExpensePhotoPickerProps {
  photoUri?: string;
  onPhotoChange: (photoUri: string | undefined) => void;
}

export const ExpensePhotoPicker: React.FC<ExpensePhotoPickerProps> = ({
  photoUri,
  onPhotoChange,
}) => {
  const [isPicking, setIsPicking] = useState(false);

  const selectPhoto = async () => {
    setIsPicking(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permiso requerido',
          'Permite el acceso a tus fotos para adjuntar una imagen al gasto.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (result.canceled) return;

      const sourceUri = result.assets[0]?.uri;
      if (!sourceUri) {
        throw new Error('El selector no devolvió una ruta de imagen.');
      }

      const directory = FileSystem.documentDirectory;
      if (!directory) {
        throw new Error('No se encontró el directorio de almacenamiento de la aplicación.');
      }

      const photoDirectory = `${directory}expense-photos/`;
      const directoryInfo = await FileSystem.getInfoAsync(photoDirectory);
      if (!directoryInfo.exists) {
        await FileSystem.makeDirectoryAsync(photoDirectory, { intermediates: true });
      }

      const extension = sourceUri.match(/\.(\w+)(?:[?#].*)?$/)?.[1] ?? 'jpg';
      const savedUri = `${photoDirectory}${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${extension}`;
      await FileSystem.copyAsync({ from: sourceUri, to: savedUri });
      onPhotoChange(savedUri);
    } catch (error) {
      console.error('No se pudo seleccionar o guardar la foto del gasto', error);
      Alert.alert('Error', 'No se pudo guardar la foto. Intenta de nuevo.');
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <View style={styles.container}>
      {photoUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => onPhotoChange(undefined)}
            style={styles.removeButton}
          >
            <Text style={styles.removeText}>Quitar foto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={selectPhoto}
          disabled={isPicking}
          style={styles.selectButton}
        >
          <Text style={styles.selectText}>
            {isPicking ? 'Cargando foto...' : 'Seleccionar foto'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  preview: {
    width: 88,
    height: 66,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  selectButton: {
    alignItems: 'center',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: Spacing.three,
  },
  selectText: {
    color: LiquidGlassColors.primary,
    fontWeight: '600',
  },
  removeButton: {
    paddingVertical: Spacing.two,
  },
  removeText: {
    color: LiquidGlassColors.secondary,
    fontWeight: '600',
  },
});
