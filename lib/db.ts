import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

interface DbConnectionResult {
  success: boolean;
  conn?: Mongoose;
  error?: {
    message: string;
    code: string;
  };
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

//
const MAX_RETRIES = 3; // Maximum number of retry attempts
const RETRY_DELAY_MS = 2000; // Delay between retries in milliseconds (2 seconds)
//

const dbConnect = async (): Promise<DbConnectionResult> => {
  // If a cached connection already exists, return it
  if (cached.conn) {
    console.log("Using existing database connection");
    return { success: true, conn: cached.conn };
  }

  // Ensure MongoDB URI is defined in environment variables
  if (!MONGODB_URI) {
    console.error(
      "DATABASE ERROR: MONGODB_URI is not defined in environment variables.",
    );
    return {
      success: false,
      error: {
        message:
          "Database connection string is missing. Please check your environment configuration.",
        code: "DB_URI_MISSING",
      },
    };
  }

  let attempts = 0; // Track the number of attempts made
  let lastError: any = null; // Store the last error to return if all retries fail

  // Retry loop — will try to connect up to MAX_RETRIES times
  while (attempts < MAX_RETRIES) {
    attempts++;
    console.log(`[DB CONNECT] Attempt ${attempts}...`);

    // If there's no ongoing promise, attempt to connect
    if (!cached.promise) {
      cached.promise = mongoose
        .connect(MONGODB_URI, { dbName: "defaultDB" }) // Connect using Mongoose
        .then((result) => {
          console.log("Connected to MongoDB");
          return result;
        })
        .catch((error) => {
          console.error(
            `Connection error on attempt ${attempts}:`,
            error.message,
          );
          cached.promise = null; // Reset promise so it can retry on next loop

          // Throw a structured error for catch block below
          throw {
            message: error.message || "Unknown DB error",
            code: error.code || "DB_CONNECTION_ERROR",
          };
        });
    }

    try {
      // Wait for the connection attempt to resolve
      cached.conn = await cached.promise;
      return { success: true, conn: cached.conn }; // If successful, return the connection
    } catch (error: any) {
      lastError = error; // Save the last error
      // If not the last attempt, wait before retrying
      if (attempts < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
      }
    }
  }

  // If all retries fail, return a failure response with the last error
  return {
    success: false,
    error: {
      message:
        lastError?.message || "Failed to connect to database after retries",
      code: lastError?.code || "DB_CONNECTION_FAILED",
    },
  };
};

export default dbConnect;
