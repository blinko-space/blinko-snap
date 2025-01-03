import Database, { QueryResult } from '@tauri-apps/plugin-sql';

let db: Database | null = null;

export async function initDatabase() {
  if (db) return db;

  db = await Database.load('sqlite:blinko.db');
  return db;
}

export async function executeQuery(query: string, bindValues: any[] = []): Promise<QueryResult> {
  const database = await initDatabase();
  return database.execute(query, bindValues);
}

export async function select<T extends Record<string, any>>(query: string, bindValues: any[] = []): Promise<T[]> {
  const database = await initDatabase();
  const result = await database.select<T[]>(query, bindValues);
  return result;
}

export async function createTables() {
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export type Settings = {
  autoStart: boolean;
  isFirstLoaded: boolean;
}

export async function getSettings(): Promise<Settings | null> {
  try {
    const results = await select<{ value: string, key: string }>('SELECT * FROM settings');
    console.log(results, 'results');
    const settings = results.reduce<{ [key: string]: any }>((acc, curr) => {
      if (curr.value === 'true' || curr.value === 'false') {
        acc[curr.key] = curr.value === 'true';
      }
      return acc;
    }, {});
    console.log(settings, 'settings');
    return {
      autoStart: settings.autoStart || false,
      isFirstLoaded: settings.isFirstLoaded || false
    };
  } catch (err) {
    console.error(err);
    return null
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  await executeQuery(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`,
    [key, value, value]
  );
}

export async function initialize() {
  try {
    await createTables();
  } catch (error) {
    console.error(error)
  }
} 