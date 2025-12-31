import Dexie, { type EntityTable } from "dexie";

export interface User {
  id?: number;
  username: string;
  role: "admin" | "editor" | "viewer";
}

export interface Post {
  id?: number;
  title: string;
  content: string;
  image?: string;
  tags?: string[];
  authorId?: number;
  date: number;
}

export const db = new Dexie("BlogDatabase") as Dexie & {
  posts: EntityTable<Post, "id">;
  users: EntityTable<User, "id">;
};

// Version 4 adds the users table and authorId index
db.version(4).stores({
  posts: "++id, title, date, *tags, authorId",
  users: "++id, &username, role",
});
