import { SQLiteDatabase } from 'expo-sqlite';

//nombre del archivo de la bd que se crea dentro del telefono
export const DATABASE_NAME='gastos.db';

//se ejecuta una vez cada que se abre la base
//se creand las tablas si aun no existen
export async function initDatabase(db:SQLiteDatabase):Promise<void> {
    //execAsync permite ejecutar varias sentencias SQL seguidas
    //WAL es un mdodo de escritura recomendado para lectura y Escritura
    //pueden ocurrir al mismo tiempo

    await db.execAsync(`
        PRAGMA journal_mode=WAL;
        
        CREATE TABLE IF NOT EXISTS expenses(
            id TEXT PRIMARY KEY NOT NULL,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            date TEXT NOT NULL, --formato ISO 8601
            description TEXT,
            photo_uri TEXT
        );
    `)

    const columns = await db.getAllAsync<{ name: string }>(
        'PRAGMA table_info(expenses)'
    );
    if (!columns.some((column) => column.name === 'photo_uri')) {
        await db.execAsync('ALTER TABLE expenses ADD COLUMN photo_uri TEXT');
    }
}