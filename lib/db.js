import fs from 'fs'
import path from 'path'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

const DATA_DIR = path.join(process.cwd(), 'data')
const FILE_PATH = path.join(DATA_DIR, 'guest_notes.json')

// Ensure local data directory exists for persistent JSON storage fallback
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  } catch (err) {
    console.error('Failed to create data directory:', err)
  }
}

let mongoClient = null
let mongoDb = null

async function getMongoDb() {
  const mongoUrl = process.env.MONGO_URL
  const dbName = process.env.DB_NAME || 'dahlia_garden'
  if (!mongoUrl) return null

  if (mongoDb) return mongoDb

  try {
    if (!mongoClient) {
      mongoClient = new MongoClient(mongoUrl, {
        serverSelectionTimeoutMS: 2000,
      })
      await mongoClient.connect()
    }
    mongoDb = mongoClient.db(dbName)
    return mongoDb
  } catch (err) {
    console.warn('MongoDB connection unavailable, using persistent JSON fallback:', err.message)
    return null
  }
}

let memoryStore = null

// File-based & in-memory persistent JSON storage helpers
function readJsonFile() {
  if (memoryStore !== null) return memoryStore
  if (!fs.existsSync(FILE_PATH)) return []
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to read guest_notes.json:', e)
    return []
  }
}

function writeJsonFile(data) {
  memoryStore = data
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.warn('Filesystem write unavailable (read-only environment), keeping in-memory store:', e.message)
  }
}

/**
 * Creates a new guest note submission.
 * Default status is always 'pending'.
 */
export async function createSubmission({ name, message, month, year, photoUrl = null }) {
  const now = new Date().toISOString()
  const doc = {
    id: uuidv4(),
    name: String(name).trim(),
    message: String(message).trim(),
    month: isNaN(Number(month)) ? month : Number(month),
    year: Number(year),
    photoUrl: photoUrl || null,
    createdAt: now,
    status: 'pending',
  }

  const db = await getMongoDb()
  if (db) {
    try {
      await db.collection('guest_notes').insertOne({
        ...doc,
        _id: doc.id,
      })
      return doc
    } catch (e) {
      console.warn('MongoDB insert failed, saving to file fallback:', e)
    }
  }

  // Fallback to JSON file
  const items = readJsonFile()
  items.unshift(doc)
  writeJsonFile(items)
  return doc
}

/**
 * Get public approved guest notes.
 */
export async function getApprovedNotes() {
  const db = await getMongoDb()
  if (db) {
    try {
      const docs = await db
        .collection('guest_notes')
        .find({ status: 'approved' })
        .sort({ createdAt: -1 })
        .toArray()
      return docs.map(d => ({
        id: d.id || String(d._id),
        _id: d.id || String(d._id),
        name: d.name,
        message: d.message,
        month: d.month,
        year: d.year,
        photoUrl: d.photoUrl,
        createdAt: d.createdAt,
        status: d.status,
      }))
    } catch (e) {
      console.warn('MongoDB fetch failed, reading file fallback:', e)
    }
  }

  const items = readJsonFile()
  return items
    .filter(x => x.status === 'approved')
    .map(x => ({ ...x, _id: x._id || x.id, id: x.id || x._id }))
}

/**
 * Admin: Get all submissions with filtering & search.
 */
export async function getAllSubmissions({ status = 'all', search = '' } = {}) {
  const db = await getMongoDb()
  if (db) {
    try {
      const query = {}
      if (status && status !== 'all') {
        query.status = status
      }
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i')
        query.$or = [{ name: regex }, { message: regex }]
      }
      const docs = await db
        .collection('guest_notes')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray()

      return docs.map(d => ({
        id: d.id || String(d._id),
        _id: d.id || String(d._id),
        name: d.name,
        message: d.message,
        month: d.month,
        year: d.year,
        photoUrl: d.photoUrl,
        createdAt: d.createdAt,
        status: d.status,
      }))
    } catch (e) {
      console.warn('MongoDB admin search failed, reading file fallback:', e)
    }
  }

  let items = readJsonFile()
  if (status && status !== 'all') {
    items = items.filter(x => x.status === status)
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase()
    items = items.filter(
      x =>
        x.name.toLowerCase().includes(q) ||
        x.message.toLowerCase().includes(q)
    )
  }
  return items.map(x => ({ ...x, _id: x._id || x.id, id: x.id || x._id }))
}

/**
 * Admin: Update submission status ('approved' | 'rejected' | 'pending').
 */
export async function updateSubmissionStatus(id, newStatus) {
  if (!['approved', 'rejected', 'pending'].includes(newStatus)) {
    throw new Error('Invalid status value')
  }

  const db = await getMongoDb()
  if (db) {
    try {
      await db
        .collection('guest_notes')
        .updateOne({ $or: [{ id }, { _id: id }] }, { $set: { status: newStatus } })
    } catch (e) {
      console.warn('MongoDB update failed, updating file fallback:', e)
    }
  }

  const items = readJsonFile()
  const idx = items.findIndex(x => x.id === id || x._id === id || String(x.id) === String(id))
  if (idx !== -1) {
    items[idx].status = newStatus
    writeJsonFile(items)
    return { ...items[idx], _id: items[idx]._id || items[idx].id }
  }
  return null
}

/**
 * Admin: Delete submission permanently and return deleted doc for photo cleanup.
 */
export async function deleteSubmission(id) {
  let deletedDoc = null
  const db = await getMongoDb()
  if (db) {
    try {
      deletedDoc = await db.collection('guest_notes').findOne({ $or: [{ id }, { _id: id }] })
      await db.collection('guest_notes').deleteOne({ $or: [{ id }, { _id: id }] })
    } catch (e) {
      console.warn('MongoDB delete failed, deleting from file fallback:', e)
    }
  }

  const items = readJsonFile()
  const idx = items.findIndex(x => x.id === id || x._id === id || String(x.id) === String(id))
  if (idx !== -1) {
    if (!deletedDoc) deletedDoc = items[idx]
    items.splice(idx, 1)
    writeJsonFile(items)
  }

  return deletedDoc
}
