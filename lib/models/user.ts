import { Schema, model, models } from "mongoose";

// Define the interface for TypeScript
interface User {
  clerkId: string; // Clerk user ID
  hasAccess: boolean;
  customerId?: string;
  planId: "free" | "paid";
  createdAt?: Date;
  updatedAt?: Date;
}

// Create the schema
const UserSchema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    hasAccess: {
      type: Boolean,
      default: false, // Set the default value to false as requested
    },
    customerId: {
      // Stripe customer ID returned from Stripe (for paid plan)
      type: String,
      required: false, // Optional
      unique: true,
      sparse: true, // Allows multiple nulls for unique index
      trim: true,
    },
    planId: {
      type: String,
      required: true,
      enum: ["free", "paid"],
      default: "free",
    },
  },
  {
    timestamps: true, // Handles createdAt and updatedAt automatically
  },
);

// Return mongoose's model if it exists
// otherwise create a new model
const UserModel = models?.User || model<User>("User", UserSchema);

export default UserModel;
