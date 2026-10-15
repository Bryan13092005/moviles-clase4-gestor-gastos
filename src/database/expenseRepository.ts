import { SQLiteDatabase } from "expo-sqlite";
import { Category, Expense } from "@/types/expense";

//forma en que una fila de SQLite
//no es igual a expense
interface ExpenseRow {
    id: string;
    amount: number;
    category: string;
    date: string;
    description: string | null;
}

//convierte una felia de la tbla a objeto
function rowToExpense(row:ExpenseRow):Expense {
    return{
        id:row.id,
        amount:row.amount,
        category:row.category as Category,
        date: new Date(row.date),
        description: row.description ?? undefined,
    }
}

//devulve todos los gatos
export async function getAllExpenses(db: SQLiteDatabase): Promise<Expense[]> {
// getAllAsync ejecuta un SELECT y devuelve un arreglo con todas las filas
const rows = await db.getAllAsync<ExpenseRow>(
    'SELECT id, amount, category, date, description FROM expenses ORDER BY date DESC'
    );
    return rows.map(rowToExpense);
}

//inserta UN gasto
export async function insertExpense(db:SQLiteDatabase, expense:Expense):Promise<void>{
    await db.runAsync(
        'INSERT INTO expenses (id,amount,category,date,description) VALUES(?,?,?,?,?)',
        expense.id,
        expense.amount,
        expense.category,
        expense.date.toISOString(),
        expense.description??null
    );
}