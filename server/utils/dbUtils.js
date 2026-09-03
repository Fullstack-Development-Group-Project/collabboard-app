const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const db = require('../data/memoryStore');

/**
 * Checks if the MongoDB connection is currently active.
 * @returns {boolean} true if connected, false otherwise
 */
const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Persists the current state of the memory store to a JSON file on disk.
 * This ensures that updates in memory mode are not lost on restart until they sync.
 */
const persistMemoryStore = () => {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'memoryStoreData.json');
    fs.writeFileSync(dataPath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist memory store to disk:', err.message);
  }
};

module.exports = { isDbConnected, persistMemoryStore };
