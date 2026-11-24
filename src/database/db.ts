import * as SQLite from 'expo-sqlite';
import { CATEGORIES } from '@/constants/theme';

let database: Promise<SQLite.SQLiteDatabase> | null = null;
let initialization: Promise<void> | null = null;

export function getDatabase() {
  if (!database) database = SQLite.openDatabaseAsync('spendly.db');
  return database;
}

export function initializeDatabase(): Promise<void> {
  if (!initialization) {
    initialization = (async () => {
      const db = await getDatabase();
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE
        );
        CREATE TABLE IF NOT EXISTS bills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          vendor TEXT NOT NULL,
          invoice_number TEXT NOT NULL DEFAULT '',
          bill_date TEXT NOT NULL,
          bill_time TEXT NOT NULL DEFAULT '',
          category TEXT NOT NULL,
          currency TEXT NOT NULL DEFAULT 'USD',
          subtotal REAL NOT NULL DEFAULT 0,
          tax REAL NOT NULL DEFAULT 0,
          discount REAL NOT NULL DEFAULT 0,
          total REAL NOT NULL,
          payment_method TEXT NOT NULL DEFAULT '',
          receipt_uri TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS bill_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bill_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          quantity REAL NOT NULL DEFAULT 1,
          unit_price REAL NOT NULL DEFAULT 0,
          FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
        );
      `);
      for (const category of CATEGORIES) {
        await db.runAsync('INSERT OR IGNORE INTO categories(name) VALUES (?)', category);
      }
    })().catch((error: unknown) => {
      initialization = null;
      throw error;
    });
  }
  return initialization;
}
