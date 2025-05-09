const sqlite3 = require('sqlite3');
const tables = require('./tables');

const openDb = () => {
  const DB_NAME = `${process.env.DATABASE_NAME || 'dev'}.db`;
  const db = new sqlite3.Database(DB_NAME, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log(`Connected to ${DB_NAME} database.`);
    }
  });
  return db;
};

const columnExists = (db, tableName, columnName, callback) => {
  db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
    if (err) {
      console.error(`Error retrieving table info for ${tableName}:`, err.message);
      callback(false);
    } else {
      const exists = columns.some(col => col.name === columnName);
      callback(exists);
    }
  });
};

const addColumnIfNotExists = (db, tableName, columnName, columnDefinition) => {
  columnExists(db, tableName, columnName, (exists) => {
    if (!exists) {
      db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`, (err) => {
        if (err) {
          console.error(`Error adding column ${columnName} to ${tableName}:`, err.message);
        } else {
          console.log(`Added column ${columnName} to ${tableName}.`);
        }
      });
    } else {
      console.log(`Column ${columnName} already exists in ${tableName}.`);
    }
  });
};

const setupDb = async (db) => {
  try {
    for (const createTable of tables) {
      await createTable(db);
    }

    // Ensure 'is_featured' and 'is_sale' columns exist in 'products' table
    addColumnIfNotExists(db, 'products', 'is_featured', 'BOOLEAN DEFAULT 0');
    addColumnIfNotExists(db, 'products', 'is_sale', 'BOOLEAN DEFAULT 0');

  } catch (error) {
    console.error('Error setting up database:', error.message);
  }
};

module.exports = {
  openDb,
  setupDb,
};
