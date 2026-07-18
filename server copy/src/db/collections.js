const { connectToDatabase } = require('./mongoClient');

async function getCollection(collectionName) {
  const database = await connectToDatabase();
  return database.collection(collectionName);
}

module.exports = { getCollection };
