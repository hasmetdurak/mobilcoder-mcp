import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface MobileCoderDB extends DBSchema {
  commandQueue: {
    key: string;
    value: {
      id: string;
      text: string;
      timestamp: number;
      status: 'pending' | 'sending' | 'failed';
    };
  };
}

const DB_NAME = 'mobile-coder-db';
const STORE_NAME = 'commandQueue';

class QueueManager {
  private dbPromise: Promise<IDBPDatabase<MobileCoderDB>>;

  constructor() {
    this.dbPromise = openDB<MobileCoderDB>(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      },
    });
  }

  async addToQueue(text: string) {
    const db = await this.dbPromise;
    const id = crypto.randomUUID();
    await db.add(STORE_NAME, {
      id,
      text,
      timestamp: Date.now(),
      status: 'pending',
    });
    return id;
  }

  async getQueue() {
    const db = await this.dbPromise;
    return db.getAll(STORE_NAME);
  }

  async removeFromQueue(id: string) {
    const db = await this.dbPromise;
    await db.delete(STORE_NAME, id);
  }

  async clearQueue() {
    const db = await this.dbPromise;
    await db.clear(STORE_NAME);
  }
}

export const queueManager = new QueueManager();
