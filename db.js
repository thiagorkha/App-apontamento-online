const DB_NAME = "producao-db";
const STORE_NAME = "queue";

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
            }
        };

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

async function saveToQueue(data) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add(data);
    return tx.complete;
}

async function getAllQueue() {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    return tx.objectStore(STORE_NAME).getAll();
}

async function removeFromQueue(id) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    return tx.complete;
}
