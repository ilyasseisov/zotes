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

const dbConnect = async (): Promise<DbConnectionResult> => {
  if (cached.conn) {
    console.log("Using existing database connection");
    return { success: true, conn: cached.conn };
  }

  // Check if MONGODB_URI is defined
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

        // Return more specific error information based on error type
        const errorMessage =
          error.message || "Unknown database connection error";
        const errorCode = error.code || "DB_CONNECTION_ERROR";

        throw {
          message: errorMessage,
          code: errorCode,
        };
      });
  }

  try {
    cached.conn = await cached.promise;
    return { success: true, conn: cached.conn };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || "Failed to connect to database",
        code: error.code || "DB_CONNECTION_ERROR",
      },
    };
  }
};

export default dbConnect;
