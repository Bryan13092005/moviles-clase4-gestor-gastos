import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from './GlassCard';
import { MonthPickerModal } from './MonthPickerModal';
import { LiquidGlassColors, Spacing } from '@/constants/theme';
import { useExpenses } from '@/context/ExpenseContext';

// Muestra el mes seleccionado, navegación entre meses y el total gastado
export const MonthlyHeader: React.FC = () => {
  const {
    getMonthlyTotal,
    selectedDate,
    goToPreviousMonth,
    goToNextMonth,
    resetToCurrentMonth,
    isCurrentMonth,
  } = useExpenses();

  const [pickerVisible, setPickerVisible] = useState(false);
  const total = getMonthlyTotal();
  const scale = useSharedValue(1);

  // Cada vez que cambia el total o la fecha seleccionada, el número "late" un poco
  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.05),
      withSpring(1)
    );
  }, [total, selectedDate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Formato del mes seleccionado en español: e.g. "octubre de 2026"
  const formattedMonth = selectedDate.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(total);

  return (
    <View style={styles.container}>
      <GlassCard style={styles.card}>
        <LinearGradient
          // Con algo de transparencia para que se vea el blur de la tarjeta
          colors={['rgba(255, 107, 157, 0.75)', 'rgba(196, 69, 105, 0.75)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {/* Controles de navegación y selección de mes */}
            <View style={styles.navigationRow}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={goToPreviousMonth}
                accessibilityRole="button"
                accessibilityLabel="Mes anterior"
                activeOpacity={0.7}
              >
                <Text style={styles.navButtonText}>‹</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.monthSelectorButton}
                onPress={() => setPickerVisible(true)}
                accessibilityRole="button"
                accessibilityLabel={`Mes seleccionado: ${formattedMonth}. Toca para abrir selector`}
                activeOpacity={0.7}
              >
                <Text style={styles.monthText}>{formattedMonth}</Text>
                <Text style={styles.chevronIcon}>▾</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navButton}
                onPress={goToNextMonth}
                accessibilityRole="button"
                accessibilityLabel="Mes siguiente"
                activeOpacity={0.7}
              >
                <Text style={styles.navButtonText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Acceso rápido para volver al mes actual cuando se visualiza otro mes */}
            {!isCurrentMonth && (
              <TouchableOpacity
                style={styles.resetBadge}
                onPress={resetToCurrentMonth}
                accessibilityRole="button"
                accessibilityLabel="Volver al mes actual"
                activeOpacity={0.7}
              >
                <Text style={styles.resetBadgeText}>↩ Volver al mes actual</Text>
              </TouchableOpacity>
            )}

            <Animated.View style={[styles.totalContainer, animatedStyle]}>
              <Text style={styles.totalLabel}>Total gastado</Text>
              <Text style={styles.totalAmount}>{formattedTotal}</Text>
            </Animated.View>
          </View>
        </LinearGradient>
      </GlassCard>

      {/* Modal para elegir directamente cualquier mes y año */}
      <MonthPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.four,
  },
  card: {
    overflow: 'hidden',
  },
  gradient: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
  },
  content: {
    alignItems: 'center',
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Spacing.two,
  },
  navButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 26,
    color: LiquidGlassColors.glassTextLight,
    fontWeight: '600',
    marginTop: -3,
  },
  monthSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: 20,
    gap: 6,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: LiquidGlassColors.glassTextLight,
    textTransform: 'capitalize',
  },
  chevronIcon: {
    fontSize: 14,
    color: LiquidGlassColors.glassTextLight,
    marginTop: -2,
    opacity: 0.9,
  },
  resetBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    paddingVertical: 3,
    paddingHorizontal: Spacing.two,
    borderRadius: 12,
    marginBottom: Spacing.two,
  },
  resetBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: LiquidGlassColors.glassTextLight,
  },
  totalContainer: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: LiquidGlassColors.glassTextLight,
    marginBottom: Spacing.one,
    textAlign: 'center',
    opacity: 0.85,
  },
  totalAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassTextLight,
    textAlign: 'center',
    letterSpacing: -1,
  },
});
