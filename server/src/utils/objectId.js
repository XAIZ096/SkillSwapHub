const { ObjectId } = require('mongodb');

function toObjectId(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  return new ObjectId(id);
}

function serializeDocument(document) {
  if (!document) {
    return null;
  }

  const serialized = { ...document };
  if (serialized._id) {
    serialized._id = serialized._id.toString();
  }
  return serialized;
}

function serializeDocuments(documents) {
  return documents.map((document) => serializeDocument(document));
}

module.exports = {
  toObjectId,
  serializeDocument,
  serializeDocuments,
};
