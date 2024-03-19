import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/test";

interface MongooseConnection {
  connection: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// in express we only need to connect once, but in next.js we need to connect on every request because next js runs on a serverless environment
// serverless environment is stateless, they startup to handle a request and shutdown right after without maintaining continuous connection
// this approach ensures that each request is handled independently allowing for better scalability and reliability as theres no need to manage persistent connections accross many instances which works well with scalable and flexible nature of next js applications
// but doing that without any optimization would mean too many mongodb connections open for each and every action we perform on the server side. so to optimize our process, we will resort to caching our connections

// caching our connections
let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { connection: null, promise: null };
}

// everytime that we connect to our database
export const connectToDatabase = async () => {
  if (cached.connection) {
    // first we check if we already have a cached connection
    return cached.connection; // if we do have it, we'll exit out immediately
  }

  if (!MONGODB_URL) {
    throw new Error(
      "Please define the MONGODB_URL environment variable inside .env.local"
    );
  }

  cached.promise = // if we don't have a cached connection, we'll create a new one
    cached.promise ||
    mongoose.connect(MONGODB_URL, {
      dbName: "imaginify",
      bufferCommands: false,
    });

  cached.connection = await cached.promise;

  return cached.connection;
};
