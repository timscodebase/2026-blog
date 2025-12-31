import Dexie, { type EntityTable } from "dexie";

export interface Post {
  id?: number;
  title: string;
  content: string;
  image?: string; // Optimized base64 image string
  tags?: string[]; // Array of tags for filtering
  date: number;
}

export const db = new Dexie("BlogDatabase") as Dexie & {
  posts: EntityTable<Post, "id">;
};

// Increment to version 3 to support tags
db.version(3).stores({
  posts: "++id, title, date, *tags", // '*' makes tags a multi-entry index
});
