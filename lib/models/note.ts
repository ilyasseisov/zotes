import { Schema, model, models } from "mongoose";

// define the interface for typescript
interface Note {
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// create the schema
const NoteSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
// return mongoose's model if it exists
// otherwise create a new model
const NoteModel = models?.Note || model<Note>("Note", NoteSchema);

export default NoteModel;
