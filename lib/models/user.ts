import { Schema, model, models } from "mongoose";

// Define the interface for TypeScript
interface User {
  hasAccess: boolean;
  customerId: string;
  planId: string;
  createdAt: Date; // Adding default timestamps like the Note example
  updatedAt: Date; // Adding default timestamps like the Note example
}

// Create the schema
const UserSchema = new Schema({
  hasAccess: {
    type: Boolean,
    default: false, // Set the default value to false as requested
  },
  customerId: {
    type: String,
    required: true, // Assuming customerId is required
    unique: true, // Assuming customerId should be unique
    trim: true,
  },
  planId: {
    type: String,
    required: true, // Assuming planId is required
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Default to the current date/time
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Default to the current date/time
  },
});

// Return mongoose's model if it exists
// otherwise create a new model
const UserModel = models?.User || model<User>("User", UserSchema);

export default UserModel;
