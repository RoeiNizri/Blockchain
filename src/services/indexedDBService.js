import { openDB } from 'idb';

const DB_NAME = 'TradingDB';
const STORE_NAME = 'ordersStore';

const dbPromise = openDB(DB_NAME, 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
    },
});

export const saveOrder = async (order) => {
    const db = await dbPromise;
    return db.put(STORE_NAME, order);
};

export const getOrders = async () => {
    const db = await dbPromise;
    return db.getAll(STORE_NAME);
};

export const deleteAllOrders = async () => {
    const db = await dbPromise;
    return db.clear(STORE_NAME);
};
