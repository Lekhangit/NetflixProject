const { MONGO_CLIENT_EVENTS } = require('mongodb');

const MongoClient = require('mongodb').MongoClient;
const mongodbUrl = 'mongodb://localhost:27017';
const dbName = 'movies';
const collectionName = 'database';

//global variable
let dbCollection;
let client;

async function connectToMongoDB(){
    try {
        client = await MongoClient.connect(mongodbUrl);
        dbCollection = client.db(dbName).collection(collectionName);
    } catch(err) {
        throw err;
    }
}

async function closeMongoDBConnection(){
    if (client) {
        await client.close()
            .then(() => {
                console.log('Disconnected from MongoDB');
                process.exit(0);
            })
            .catch(error => {
                console.error('Failed to disconnect from MongoDB', error);
                process.exit(1); //Exit with error
            });
    } else {
        process.exit(0);
    }
}

async function findDocuments(){
    const documents = await dbCollection.find().toArray();
    return documents;
}

async function findDocumentsByTitle(title) {
    const documents = await dbCollection.find({"title": {$regex: title}}).toArray();
    return documents;
}

async function findDocumentsByID(movieID) {
    const documents = await dbCollection.find({"id": {$regex: movieID}}).toArray();
    return documents;
}

async function updateDocumentsByID(movieID, updatedData) {
    const result = await dbCollection.updateOne({id: {$regex: movieID}}, {$set: updatedData})
    return result.modifiedCount;
}

async function getNextIdNumber(client, dbName, collectionName) {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const lastMovie = await collection.find().sort({ id: -1 }).limit(1).toArray();
    let nextIdNumber;
    
    if (lastMovie.length === 0) {
        nextIdNumber = 1;
    } else {
        const lastId = lastMovie[0].id;
        const lastNumber = parseInt(lastId.replace("MOV", ""));
        nextIdNumber = lastNumber + 1;
    }
    
    return nextIdNumber;
}

module.exports = {
    connectToMongoDB,
    closeMongoDBConnection,
    findDocuments,
    findDocumentsByID,
    findDocumentsByTitle,
    updateDocumentsByID,
    getNextIdNumber
}
