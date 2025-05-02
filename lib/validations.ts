import { z } from "zod";

export const NoteSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .nonempty("Title is required")
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be less than 100 characters"),
  content: z
    .string()
    .nonempty("Content is required")
    .min(10, "Content must be at least 10 characters"),
  userId: z.string().nonempty("userId is required"),
});

export type NoteFormValues = z.infer<typeof NoteSchema>;
