import Dexie, { type EntityTable } from "dexie";

export interface Post {
  id?: number;
  title: string;
  content: string;
  image?: string; // Optional base64 image string
  date: number;
}

export const db = new Dexie("BlogDatabase") as Dexie & {
  posts: EntityTable<Post, "id">;
};

db.version(2).stores({
  posts: "++id, title, date",
});
