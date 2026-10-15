import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { ExpenseProvider } from '@/context/ExpenseContext';
import { DATABASE_NAME, initDatabase } from '@/database/database';

// SQLiteProvider abre la base de datos y la comparte con toda la app.
// Va por FUERA de ExpenseProvider, porque ExpenseProvider necesita la base.
// onInit corre antes de mostrar los hijos, asi la tabla ya existe cuando se usa.
export default function RootLayout() {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase}>
      <ExpenseProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </ExpenseProvider>
    </SQLiteProvider>
  );
}