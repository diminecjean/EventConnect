import { MongoClient, MongoClientOptions, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB_NAME || "eventconnect"; // Add a DB name env var

const options: MongoClientOptions = {
  connectTimeoutMS: 20000, // Increased to 20 seconds
  socketTimeoutMS: 45000, // Increased to 45 seconds
  serverSelectionTimeoutMS: 20000, // Increased to 20 seconds
  heartbeatFrequencyMS: 30000, // Add heartbeat
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!uri) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise as Promise<MongoClient>;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Return "test" database by default
export async function connectToDB(): Promise<Db> {
  try {
    const client = await clientPromise;
    return client.db("test");
  } catch (error) {
    console.error("MongoDB database access error:", error);
    throw new Error("Failed to access database");
  }
}
