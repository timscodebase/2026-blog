import { db, User } from "./db";

export const Auth = {
  async signup(username: string, role: User["role"]): Promise<User> {
    const id = await db.users.add({ username, role });
    const user = { id, username, role };
    this.setSession(user);
    return user;
  },

  async login(username: string): Promise<User | null> {
    const user = await db.users.where("username").equals(username).first();
    if (user) this.setSession(user);
    return user || null;
  },

  logout() {
    localStorage.removeItem("blog_session");
    window.dispatchEvent(new CustomEvent("auth-changed"));
  },

  setSession(user: User) {
    localStorage.setItem("blog_session", JSON.stringify(user));
    window.dispatchEvent(new CustomEvent("auth-changed"));
  },

  getUser(): User | null {
    const session = localStorage.getItem("blog_session");
    return session ? JSON.parse(session) : null;
  },
};
