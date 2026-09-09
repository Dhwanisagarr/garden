// Client-side persistence helper using IndexedDB for DAISY memory photos
const DB_NAME = 'daisy-memories'
const STORE = 'images'
const VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB unavailable'))
    }
    try {
      const req = indexedDB.open(DB_NAME, VERSION)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE)
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error || new Error('Failed to open database'))
    } catch (err) {
      reject(err)
    }
  })
}

export async function putImage(key, dataUrl) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(dataUrl, key)
      tx.oncomplete = () => resolve(true)
      tx.onerror = () => reject(tx.error)
    })
  } catch (err) {
    console.error('Error storing memory image:', err)
    return false
  }
}

export async function getImage(key) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(key)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    console.error('Error fetching memory image:', err)
    return null
  }
}

export async function deleteImage(key) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).delete(key)
      tx.oncomplete = () => resolve(true)
      tx.onerror = () => reject(tx.error)
    })
  } catch (err) {
    console.error('Error deleting memory image:', err)
    return false
  }
}

export async function getAllKeysForMonth(year, month) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).getAllKeys()
      req.onsuccess = () => {
        const prefix = `${year}-${String(month).padStart(2, '0')}-`
        resolve((req.result || []).filter((k) => String(k).startsWith(prefix)))
      }
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    console.error('Error getting monthly keys:', err)
    return []
  }
}

export async function listAllMemoryKeys() {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).getAllKeys()
      req.onsuccess = () => resolve((req.result || []).map(String))
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    console.error('Error listing memory keys:', err)
    return []
  }
}

export async function getMonthImages(year, month) {
  try {
    const keys = await getAllKeysForMonth(year, month)
    const out = {}
    for (const k of keys) {
      const img = await getImage(k)
      if (img) out[k] = img
    }
    return out
  } catch (err) {
    console.error('Error loading month images:', err)
    return {}
  }
}

export function dateKey(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
