import seed from '../db.json';

// Mimics the json-server API on top of localStorage, so the app can run
// without a backend (e.g. on GitHub Pages). Seeded from src/db.json.

type Item = { id: string; [key: string]: unknown };
type Db = Record<string, Item[]>;
type Method = 'GET' | 'DELETE' | 'POST' | 'PATCH';

const STORAGE_KEY = 'football-app-db';

const loadDb = (): Db => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    return structuredClone(seed) as Db;
};

const saveDb = (db: Db) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

const createId = () => Math.random().toString(36).slice(2, 9);

export const localApiCall = async <R, P = void>(
    url: string,
    method: Method,
    payload?: P
): Promise<R> => {
    const [collection, id] = url.split('/');
    const db = loadDb();
    const items = db[collection];

    if (!items) throw new Error(`Unknown collection: ${collection}`);

    const index = id ? items.findIndex((item) => item.id === id) : -1;
    if (id && index === -1) throw new Error(`Not found: ${url}`);

    switch (method) {
        case 'GET':
            return (id ? items[index] : items) as R;
        case 'POST': {
            const created = { ...payload, id: createId() } as Item;
            items.push(created);
            saveDb(db);
            return created as R;
        }
        case 'PATCH': {
            items[index] = { ...items[index], ...payload, id: items[index].id };
            saveDb(db);
            return items[index] as R;
        }
        case 'DELETE':
            items.splice(index, 1);
            saveDb(db);
            return {} as R;
    }
};
