import { openDB } from 'idb';

const DB_NAME = 'TradingDB';
const STORE_NAME_ORDERS = 'ordersStore';
const STORE_NAME_WALLET = 'walletStore';
const STORE_NAME_TRANSACTIONS = 'transactionsStore';

const dbPromise = openDB(DB_NAME, 2, { // Increment version to trigger upgrade
    upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME_ORDERS)) {
            db.createObjectStore(STORE_NAME_ORDERS, { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(STORE_NAME_WALLET)) {
            db.createObjectStore(STORE_NAME_WALLET, { keyPath: 'currency' });
        }
        if (!db.objectStoreNames.contains(STORE_NAME_TRANSACTIONS)) {
            db.createObjectStore(STORE_NAME_TRANSACTIONS, { keyPath: 'id', autoIncrement: true });
        }
    },
});

export const saveOrder = async (order) => {
    const db = await dbPromise;
    return db.put(STORE_NAME_ORDERS, order);
};

export const getOrders = async () => {
    const db = await dbPromise;
    return db.getAll(STORE_NAME_ORDERS);
};

export const deleteAllOrders = async () => {
    const db = await dbPromise;
    return db.clear(STORE_NAME_ORDERS);
};

export const saveWallet = async (wallet) => {
    const db = await dbPromise;
    const tx = db.transaction(STORE_NAME_WALLET, 'readwrite');
    const store = tx.objectStore(STORE_NAME_WALLET);
    await store.put({ currency: 'USDT', amount: wallet.USDT });
    await store.put({ currency: 'BTC', amount: wallet.BTC });
    await store.put({ currency: 'ETH', amount: wallet.ETH });
    await tx.done;
};

export const getWallet = async () => {
    const db = await dbPromise;
    const tx = db.transaction(STORE_NAME_WALLET, 'readonly');
    const store = tx.objectStore(STORE_NAME_WALLET);
    const wallet = {
        USDT: (await store.get('USDT'))?.amount || 0,
        BTC: (await store.get('BTC'))?.amount || 0,
        ETH: (await store.get('ETH'))?.amount || 0,
    };
    await tx.done;
    return wallet;
};

export const deleteWallet = async () => {
    const db = await dbPromise;
    const tx = db.transaction(STORE_NAME_WALLET, 'readwrite');
    const store = tx.objectStore(STORE_NAME_WALLET);
    await store.clear();
    await tx.done;
};
