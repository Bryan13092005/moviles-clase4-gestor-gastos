import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { LiquidGlassColors, Spacing } from '@/constants/theme';
import { useExpenses } from '@/context/ExpenseContext';

interface MonthPickerModalProps {
  visible: boolean;
  onClose: () => void;
}

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const MonthPickerModal: React.FC<MonthPickerModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    selectedDate,
    setSelectedDate,
    resetToCurrentMonth,
    hasExpensesInMonth,
  } = useExpenses();

  const now = new Date();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  // Año visible en el selector (puede navegarse independientemente antes de elegir un mes)
  const [pickerYear, setPickerYear] = useState<number>(selectedDate.getFullYear());

  useEffect(() => {
    if (visible) {
      setPickerYear(selectedDate.getFullYear());
    }
  }, [visible, selectedDate]);

  const handleSelectMonth = (monthIndex: number) => {
    // Establece el mes y año seleccionados manteniendo el día en 1 para evitar desbordes
    const newDate = new Date(pickerYear, monthIndex, 1);
    setSelectedDate(newDate);
    onClose();
  };

  const handleResetToCurrent = () => {
    resetToCurrentMonth();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View entering={FadeIn} style={styles.backdropBlur}>
            <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View
          entering={SlideInDown.springify()}
          style={styles.modalContent}
        >
          <View style={styles.modalBackground}>
            <BlurView intensity={90} tint="light" style={styles.modalBlur}>
              <View style={styles.handleBar} />

              <Text style={styles.title}>Seleccionar Mes</Text>

              {/* Selector de Año */}
              <View style={styles.yearSelector}>
                <TouchableOpacity
                  style={styles.yearArrowButton}
                  onPress={() => setPickerYear((y) => y - 1)}
                  accessibilityLabel="Año anterior"
                  activeOpacity={0.7}
                >
                  <Text style={styles.yearArrowText}>‹</Text>
                </TouchableOpacity>

                <Text style={styles.yearText}>{pickerYear}</Text>

                <TouchableOpacity
                  style={styles.yearArrowButton}
                  onPress={() => setPickerYear((y) => y + 1)}
                  accessibilityLabel="Año siguiente"
                  activeOpacity={0.7}
                >
                  <Text style={styles.yearArrowText}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Cuadrícula de 12 Meses */}
              <View style={styles.monthsGrid}>
                {MONTH_NAMES.map((monthName, index) => {
                  const isSelected =
                    selectedDate.getFullYear() === pickerYear &&
                    selectedDate.getMonth() === index;

                  const isTodayMonth =
                    pickerYear === todayYear && index === todayMonth;

                  const hasExpenses = hasExpensesInMonth(index, pickerYear);

                  return (
                    <TouchableOpacity
                      key={monthName}
                      style={[
                        styles.monthCell,
                        isTodayMonth && !isSelected && styles.todayCell,
                      ]}
                      onPress={() => handleSelectMonth(index)}
                      activeOpacity={0.8}
                    >
                      {isSelected ? (
                        <LinearGradient
                          colors={[
                            LiquidGlassColors.primary,
                            LiquidGlassColors.secondary,
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.selectedGradient}
                        >
                          <Text style={styles.monthTextSelected}>
                            {monthName.slice(0, 3)}
                          </Text>
                          {hasExpenses && (
                            <View style={styles.expenseDotOnSelected} />
                          )}
                        </LinearGradient>
                      ) : (
                        <View style={styles.monthCellInner}>
                          <Text
                            style={[
                              styles.monthText,
                              isTodayMonth && styles.todayMonthText,
                            ]}
                          >
                            {monthName.slice(0, 3)}
                          </Text>
                          {hasExpenses && (
                            <View style={styles.expenseDot} />
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Leyenda y Acciones */}
              <View style={styles.footer}>
                <View style={styles.legendContainer}>
                  <View style={styles.legendDot} />
                  <Text style={styles.legendText}>Tiene gastos registrados</Text>
                </View>

                <View style={styles.buttonsRow}>
                  <TouchableOpacity
                    style={styles.todayButton}
                    onPress={handleResetToCurrent}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.todayButtonText}>Ir a mes actual</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.closeButtonText}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  backdropBlur: {
    flex: 1,
    backgroundColor: 'rgba(44, 27, 71, 0.4)',
  },
  modalContent: {
    maxHeight: '85%',
  },
  modalBackground: {
    borderTopLeftRadius: Spacing.five,
    borderTopRightRadius: Spacing.five,
    overflow: 'hidden',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: LiquidGlassColors.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    shadowColor: LiquidGlassColors.shadowDark,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 20,
  },
  modalBlur: {
    padding: Spacing.four,
    paddingBottom: Spacing.five,
  },
  handleBar: {
    width: 44,
    height: 5,
    backgroundColor: LiquidGlassColors.glassBorder,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
    gap: Spacing.four,
  },
  yearArrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearArrowText: {
    fontSize: 24,
    fontWeight: '600',
    color: LiquidGlassColors.primary,
    marginTop: -2,
  },
  yearText: {
    fontSize: 24,
    fontWeight: '700',
    color: LiquidGlassColors.glassText,
    minWidth: 90,
    textAlign: 'center',
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  monthCell: {
    width: '30%',
    height: 52,
    borderRadius: Spacing.two,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthCellInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  todayCell: {
    borderColor: LiquidGlassColors.primary,
    borderWidth: 1.5,
  },
  selectedGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  monthText: {
    fontSize: 15,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    textTransform: 'capitalize',
  },
  todayMonthText: {
    color: LiquidGlassColors.primary,
    fontWeight: '700',
  },
  monthTextSelected: {
    fontSize: 15,
    fontWeight: '700',
    color: LiquidGlassColors.glassTextLight,
    textTransform: 'capitalize',
  },
  expenseDot: {
    position: 'absolute',
    bottom: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: LiquidGlassColors.secondary,
  },
  expenseDotOnSelected: {
    position: 'absolute',
    bottom: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: LiquidGlassColors.glassTextLight,
  },
  footer: {
    marginTop: Spacing.two,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
    gap: 6,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: LiquidGlassColors.secondary,
  },
  legendText: {
    fontSize: 12,
    color: LiquidGlassColors.glassTextSecondary,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  todayButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(255, 107, 157, 0.12)',
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    alignItems: 'center',
  },
  todayButtonText: {
    color: LiquidGlassColors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    alignItems: 'center',
  },
  closeButtonText: {
    color: LiquidGlassColors.glassText,
    fontSize: 14,
    fontWeight: '600',
  },
});
