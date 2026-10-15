import { useState } from 'react';
import { FlatList, ActivityIndicator,StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MonthlyHeader } from '@/components/MonthlyHeader';
import { ExpenseItem } from '@/components/ExpenseItem';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { useExpenses } from '@/context/ExpenseContext';
import { LiquidGlassColors, Spacing } from '@/constants/theme';
import { Expense } from '@/types/expense';

// Pantalla principal: total del mes, lista de gastos y el boton + para agregar
export default function HomeScreen() {
  const { getCurrentMonthExpenses, isLoading, deleteExpense, selectedDate } = useExpenses();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [sortByHighest, setSortByHighest] = useState(false);
  // La lista cambia entre ordenar por monto descendente y fecha más reciente.
  const expenses = getCurrentMonthExpenses().sort((first, second) =>
    sortByHighest
      ? second.amount - first.amount || second.date.getTime() - first.date.getTime()
      : second.date.getTime() - first.date.getTime()
  );

  const formattedSelectedMonth = selectedDate.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });
//crear nuevo gasto
  const openNewExpense = () => {
    setEditingExpense(null);
    setModalVisible(true);
  };
//editar gasto
  const openEditExpense = (expense: Expense) => {
    // El mismo formulario sirve para crear y editar, precargado con este gasto.
    setEditingExpense(expense);
    setModalVisible(true);
  };
//cerrar modal de gasto
  const closeExpenseModal = () => {
    setModalVisible(false);
    setEditingExpense(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FFF5F9', '#FFE8F0', '#FFF9FC']}
        style={styles.gradient}
      >
        {/* Circulos de color detras: dan algo que desenfocar a las tarjetas */}
        <View pointerEvents="none" style={[styles.orb, styles.orbPink]} />
        <View pointerEvents="none" style={[styles.orb, styles.orbOrange]} />
        <View pointerEvents="none" style={[styles.orb, styles.orbPurple]} />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <Text style={styles.appTitle}>Gastos Poliestudiante</Text>

            <MonthlyHeader />

            <TouchableOpacity
              accessibilityRole="button"
              // El control alterna entre el orden habitual y el monto más alto.
              onPress={() => setSortByHighest((current) => !current)}
              style={styles.sortButton}
            >
              <Text style={styles.sortButtonText}>
                {sortByHighest ? 'Orden: gastos más altos' : 'Orden: más recientes'}
              </Text>
            </TouchableOpacity>

            {/* Mientras se leen los datos guardados se muestra un indicador;
                sin esto se veria un instante el mensaje de "no hay gastos" */}
            {isLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={LiquidGlassColors.primary} />
              </View>
            ) : expenses.length === 0 ? (
              /* Si no hay gastos en este mes mostramos un mensaje personalizado */
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💸</Text>
                <Text style={styles.emptyTitle}>
                  No hay gastos en {formattedSelectedMonth}
                </Text>
                <Text style={styles.emptyText}>
                  Presiona el botón + para registrar un gasto o selecciona otro mes
                </Text>
              </View>
            ) : (
              <FlatList
                data={expenses}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <ExpenseItem
                    expense={item}
                    index={index}
                    onEdit={openEditExpense}
                    onDelete={deleteExpense}
                  />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          {/* Boton + de la esquina */}
          <TouchableOpacity
            style={styles.fab}
            onPress={openNewExpense}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabGradient}
            >
              <Text style={styles.fabIcon}>+</Text>
            </LinearGradient>
          </TouchableOpacity>

          <AddExpenseModal
            visible={modalVisible}
            expense={editingExpense ?? undefined}
            onClose={closeExpenseModal}
          />
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbPink: {
    width: 220,
    height: 220,
    top: 60,
    left: -60,
    backgroundColor: 'rgba(255, 107, 157, 0.55)',
  },
  orbOrange: {
    width: 180,
    height: 180,
    top: 260,
    right: -50,
    backgroundColor: 'rgba(255, 159, 94, 0.5)',
  },
  orbPurple: {
    width: 200,
    height: 200,
    bottom: 120,
    left: 20,
    backgroundColor: 'rgba(168, 120, 220, 0.4)',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.three,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  sortButton: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  sortButtonText: {
    color: LiquidGlassColors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.three,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.two,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: LiquidGlassColors.glassTextSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.four,
    right: Spacing.four,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: LiquidGlassColors.shadowDark,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fabGradient: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 32,
    color: LiquidGlassColors.glassTextLight,
    fontWeight: '300',
  },
});
