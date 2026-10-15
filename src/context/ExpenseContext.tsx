import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Expense } from '@/types/expense';
import { useSQLiteContext } from 'expo-sqlite';
import {
  deleteExpense as deleteExpenseFromDatabase,
  getAllExpenses,
  insertExpense,
  updateExpense as updateExpenseInDatabase,
} from '@/database/expenseRepository';
 
interface ExpenseContextType {
  expenses: Expense[];
  // true mientras se leen los gastos guardados al abrir la app
  isLoading: boolean;
  // Ahora devuelve una Promise porque guardar en el telefono es asincrono
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getMonthlyTotal: () => number;
  getCurrentMonthExpenses: () => Expense[];
  // Funcionalidad para seleccionar y navegar entre meses
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  resetToCurrentMonth: () => void;
  isCurrentMonth: boolean;
  getSelectedMonthExpenses: () => Expense[];
  hasExpensesInMonth: (month: number, year: number) => boolean;
}
 
// Arranca en undefined para poder avisar si alguien usa el hook sin Provider
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);
 
// Fase 3: los gastos se guardan en una base de datos SQLite dentro del telefono.
// La interfaz del contexto es la misma de la fase 2, por eso las pantallas no cambian.
export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Conexion a la base que abrio SQLiteProvider en _layout.tsx
  const db = useSQLiteContext();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  // Se ejecuta al montar el Provider (al abrir la app).
  // db va en las dependencias porque se usa adentro; no cambia mientras la app esta abierta.
  useEffect(() => {
    const cargarGastos = async () => {
      try {
        const guardados = await getAllExpenses(db);
        setExpenses(guardados);
      } catch (error) {
        // Si falla la consulta, la app arranca vacia
        console.error('No se pudieron cargar los gastos', error);
      } finally {
        // Haya funcionado o no, ya terminamos de cargar
        setIsLoading(false);
      }
    };

    cargarGastos();
  }, [db]);

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    // Timestamp + algo aleatorio para que dos gastos seguidos no repitan id
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
    };

    // Primero se inserta en la base y DESPUES se actualiza la pantalla.
    // Si el INSERT falla, lanza el error y el estado no cambia.
    // Solo se escribe una fila: ya no hace falta reescribir toda la lista.
    await insertExpense(db, newExpense);

    // Va al principio para que el ultimo gasto salga arriba
    setExpenses((prev) => [newExpense, ...prev]);

    // Si el nuevo gasto es de otro mes, actualizamos selectedDate a ese mes para mostrarlo
    const expenseDate = new Date(newExpense.date);
    if (
      expenseDate.getMonth() !== selectedDate.getMonth() ||
      expenseDate.getFullYear() !== selectedDate.getFullYear()
    ) {
      setSelectedDate(expenseDate);
    }
  };

  const updateExpense = async (expense: Expense) => {
    // Persistir primero evita mostrar cambios que la base de datos no guardó.
    await updateExpenseInDatabase(db, expense);
    setExpenses((prev) =>
      prev.map((current) => (current.id === expense.id ? expense : current))
    );
  };

  const deleteExpense = async (id: string) => {
    // La lista se actualiza solo después de eliminar el registro de SQLite.
    await deleteExpenseFromDatabase(db, id);
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  };

  const isCurrentMonth = (() => {
    const now = new Date();
    return (
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear()
    );
  })();

  const goToPreviousMonth = () => {
    setSelectedDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setSelectedDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const resetToCurrentMonth = () => {
    setSelectedDate(new Date());
  };

  const getSelectedMonthExpenses = () => {
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === selectedMonth &&
        expenseDate.getFullYear() === selectedYear
      );
    });
  };

  // Mantenemos getCurrentMonthExpenses para compatibilidad; ahora responde al mes seleccionado
  const getCurrentMonthExpenses = () => {
    return getSelectedMonthExpenses();
  };

  const getMonthlyTotal = () => {
    return getSelectedMonthExpenses().reduce(
      (total, expense) => total + expense.amount,
      0
    );
  };

  const hasExpensesInMonth = (month: number, year: number) => {
    return expenses.some((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === month &&
        expenseDate.getFullYear() === year
      );
    });
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        isLoading,
        addExpense,
        updateExpense,
        deleteExpense,
        getMonthlyTotal,
        getCurrentMonthExpenses,
        selectedDate,
        setSelectedDate,
        goToPreviousMonth,
        goToNextMonth,
        resetToCurrentMonth,
        isCurrentMonth,
        getSelectedMonthExpenses,
        hasExpensesInMonth,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
 
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
