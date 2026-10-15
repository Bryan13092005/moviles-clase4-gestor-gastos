import React from 'react';
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Expense, CATEGORY_ICONS } from '@/types/expense';
import { GlassCard } from './GlassCard';
import { LiquidGlassColors, Spacing } from '@/constants/theme';

interface ExpenseItemProps {
  expense: Expense;
  index: number; // sirve para que cada fila entre un poquito despues de la anterior
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => Promise<void>;
}

// Una fila de la lista de gastos
export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  index,
  onEdit,
  onDelete,
}) => {
  const [photoViewerVisible, setPhotoViewerVisible] = React.useState(false);
  const { height: windowHeight } = useWindowDimensions();

  // Queda algo como "15 oct"
  const formattedDate = new Date(expense.date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  });

  // Queda algo como "$15.50"
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(expense.amount);

  const confirmDelete = () => {
    // Solicita confirmación antes de borrar de forma permanente el gasto.
    Alert.alert(
      'Eliminar gasto',
      '¿Seguro que deseas eliminar este gasto? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            // Informa explícitamente si la eliminación no pudo persistirse.
            void onDelete(expense.id).catch((error: unknown) => {
              console.error('Error al eliminar el gasto', error);
              Alert.alert('Error', 'No se pudo eliminar el gasto. Intenta de nuevo.');
            });
          },
        },
      ]
    );
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.container}
    >
      <GlassCard>
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}
              >
                <Text style={styles.icon}>{CATEGORY_ICONS[expense.category]}</Text>
              </LinearGradient>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.category}>{expense.category}</Text>
              {expense.description && (
                <Text style={styles.description} numberOfLines={1}>
                  {expense.description}
                </Text>
              )}
              {expense.photoUri && (
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => setPhotoViewerVisible(true)}
                  style={styles.viewPhotoButton}
                >
                  <Text style={styles.viewPhotoText}>Ver foto</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.rightSection}>
            <Text style={styles.amount}>{formattedAmount}</Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => onEdit(expense)}
            style={styles.actionButton}
          >
            <Text style={styles.editText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={confirmDelete}
            style={styles.actionButton}
          >
            <Text style={styles.deleteText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
      {expense.photoUri && (
        <Modal
          visible={photoViewerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPhotoViewerVisible(false)}
        >
          <View style={styles.photoViewer}>
            <LinearGradient
              colors={['#FFF5F9', '#FFE8F0', '#FFF9FC']}
              style={StyleSheet.absoluteFill}
            />
            <BlurView intensity={24} tint="light" style={StyleSheet.absoluteFill} />
            <View pointerEvents="none" style={[styles.photoOrb, styles.photoOrbPink]} />
            <View pointerEvents="none" style={[styles.photoOrb, styles.photoOrbPurple]} />
            <SafeAreaView style={styles.photoViewerContent}>
              <View style={styles.photoViewerHeader}>
                <View style={styles.photoViewerTitleContainer}>
                  <Text style={styles.photoViewerTitle}>Foto del gasto</Text>
                  <Text style={styles.photoViewerSubtitle}>
                    {CATEGORY_ICONS[expense.category]} {expense.category}
                  </Text>
                </View>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar foto"
                  onPress={() => setPhotoViewerVisible(false)}
                  style={styles.closePhotoButton}
                >
                  <Text style={styles.closePhotoText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
              <GlassCard intensity={35} style={styles.photoCard}>
                <Image
                  accessibilityLabel="Foto adjunta al gasto"
                  source={{ uri: expense.photoUri }}
                  resizeMode="contain"
                  style={[styles.fullPhoto, { height: Math.min(windowHeight * 0.58, 640) }]}
                />
              </GlassCard>
              {expense.description ? (
                <Text style={styles.photoDescription} numberOfLines={2}>
                  {expense.description}
                </Text>
              ) : (
                <Text style={styles.photoAmount}>{formattedAmount}</Text>
              )}
            </SafeAreaView>
          </View>
        </Modal>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.two,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: Spacing.two,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: LiquidGlassColors.glassTextSecondary,
  },
  viewPhotoButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
    paddingVertical: Spacing.one,
  },
  viewPhotoText: {
    color: LiquidGlassColors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: LiquidGlassColors.primary,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: LiquidGlassColors.glassTextSecondary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: LiquidGlassColors.glassBorder,
    paddingTop: Spacing.two,
  },
  actionButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  editText: {
    color: LiquidGlassColors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  deleteText: {
    color: LiquidGlassColors.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  photoViewer: {
    flex: 1,
    backgroundColor: 'rgba(255, 245, 249, 0.45)',
  },
  photoViewerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  photoOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  photoOrbPink: {
    width: 220,
    height: 220,
    top: '12%',
    left: '-18%',
    backgroundColor: 'rgba(255, 107, 157, 0.2)',
  },
  photoOrbPurple: {
    width: 260,
    height: 260,
    right: '-22%',
    bottom: '8%',
    backgroundColor: 'rgba(196, 69, 105, 0.14)',
  },
  photoViewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  photoViewerTitleContainer: {
    flex: 1,
    marginRight: Spacing.two,
  },
  photoViewerTitle: {
    color: LiquidGlassColors.glassText,
    fontSize: 22,
    fontWeight: '700',
  },
  photoViewerSubtitle: {
    color: LiquidGlassColors.glassTextSecondary,
    fontSize: 14,
    marginTop: Spacing.one,
  },
  photoCard: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 640,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  photoDescription: {
    color: LiquidGlassColors.glassText,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: Spacing.three,
  },
  photoAmount: {
    color: LiquidGlassColors.glassTextSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.three,
  },
  fullPhoto: {
    width: '100%',
  },
  closePhotoButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  closePhotoText: {
    color: LiquidGlassColors.glassText,
    fontSize: 14,
    fontWeight: '600',
  },
});
