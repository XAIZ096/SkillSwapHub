const { MongoClient } = require('mongodb');

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGO_DB_NAME || 'skillswap_hub';

let client;
let database;

async function connectToDatabase() {
  if (database) {
    return database;
  }

  client = new MongoClient(mongoUri);
  await client.connect();
  database = client.db(dbName);

  await database.collection('users').createIndex({ username: 1 }, { unique: true });
  await database.collection('skills').createIndex({ ownerId: 1 });
  await database.collection('skills').createIndex({ name: 'text', description: 'text' });
  await database.collection('swapRequests').createIndex({ requesterId: 1 });
  await database.collection('swapRequests').createIndex({ receiverId: 1 });
  await database.collection('sessions').createIndex({ participantIds: 1 });

  return database;
}

async function closeDatabaseConnection() {
  if (client) {
    await client.close();
    client = undefined;
    database = undefined;
  }
}

module.exports = {
  connectToDatabase,
  closeDatabaseConnection,
};
