import mongoose, { Mongoose } from "mongoose";
// import logger from "./logger";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  // This error occurs during server initialization/rendering.
  // It cannot be caught by client-side toast handlers.
  // The application will fail to build or render pages that require DB access.
  console.error(
    "FATAL ERROR: MONGODB_URI is not defined in environment variables.",
  );
  // Throw a standard Error object
  throw new Error("FATAL ERROR: MONGODB_URI is not defined.");
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const dbConnect = async (): Promise<Mongoose> => {
  if (cached.conn) {
    // logger.info("Using existing database connection");
    console.log("Using existing database connection");
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "defaultDB",
      })
      .then((result) => {
        console.log("Connected to MongoDB");
        return result;
      })
      .catch((error) => {
        console.log("Error connecting to MongoDB", error);
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;

  return cached.conn;
};

export default dbConnect;
