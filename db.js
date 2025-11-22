const DB_NAME = "producao-db"
const STORE_NAME = "queue"
const STATE_STORE = "state"

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true })
      }
      if (!db.objectStoreNames.contains(STATE_STORE)) {
        db.createObjectStore(STATE_STORE, { keyPath: "key" })
      }
    }

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

async function saveToQueue(data) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, "readwrite")
  tx.objectStore(STORE_NAME).add(data)
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function getAllQueue() {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, "readonly")
  const store = tx.objectStore(STORE_NAME)
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function removeFromQueue(id) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, "readwrite")
  tx.objectStore(STORE_NAME).delete(id)
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function saveCurrentState(state) {
  try {
    const db = await openDB()
    const tx = db.transaction(STATE_STORE, "readwrite")
    const store = tx.objectStore(STATE_STORE)
    store.put({ key: "current", data: state, timestamp: Date.now() })

    await new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })

    // Also save to localStorage as backup
    localStorage.setItem("producao-state", JSON.stringify(state))
    localStorage.setItem("producao-state-time", Date.now().toString())

    console.log("[v0] State saved successfully")
  } catch (error) {
    console.error("[v0] Error saving state to IndexedDB:", error)
    // Fallback to localStorage only
    try {
      localStorage.setItem("producao-state", JSON.stringify(state))
      localStorage.setItem("producao-state-time", Date.now().toString())
      console.log("[v0] State saved to localStorage (fallback)")
    } catch (e) {
      console.error("[v0] Failed to save to localStorage:", e)
    }
  }
}

async function getCurrentState() {
  try {
    const db = await openDB()
    const tx = db.transaction(STATE_STORE, "readonly")
    const store = tx.objectStore(STATE_STORE)

    const result = await new Promise((resolve, reject) => {
      const request = store.get("current")
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    if (result && result.data) {
      console.log("[v0] State loaded from IndexedDB")
      return result.data
    }

    // Fallback to localStorage if IndexedDB is empty
    const stored = localStorage.getItem("producao-state")
    if (stored) {
      console.log("[v0] State loaded from localStorage (fallback)")
      return JSON.parse(stored)
    }

    return null
  } catch (error) {
    console.error("[v0] Error loading state from IndexedDB:", error)
    // Fallback to localStorage
    try {
      const stored = localStorage.getItem("producao-state")
      if (stored) {
        console.log("[v0] State loaded from localStorage (error fallback)")
        return JSON.parse(stored)
      }
    } catch (e) {
      console.error("[v0] Failed to load from localStorage:", e)
    }
    return null
  }
}

async function clearCurrentState() {
  try {
    const db = await openDB()
    const tx = db.transaction(STATE_STORE, "readwrite")
    const store = tx.objectStore(STATE_STORE)
    store.delete("current")

    await new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })

    localStorage.removeItem("producao-state")
    localStorage.removeItem("producao-state-time")

    console.log("[v0] State cleared successfully")
  } catch (error) {
    console.error("[v0] Error clearing state:", error)
    localStorage.removeItem("producao-state")
    localStorage.removeItem("producao-state-time")
  }
}
