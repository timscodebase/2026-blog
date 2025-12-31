import { db, type User } from "./db";

function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error decoding JWT", e);
    return null;
  }
}

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

  async loginWithGoogle(credential: string) {
    const googleUser = decodeJwt(credential);
    if (!googleUser) return null;

    let user = await db.users.where("username").equals(googleUser.email).first();
    if (user) {
      this.setSession(user);
      return user;
    } else {
      const newUser = {
        username: googleUser.email,
        role: "viewer" as User["role"],
      };
      const id = await db.users.add(newUser);
      const user = { ...newUser, id };
      this.setSession(user);
      return user;
    }
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
    try {
      const session = localStorage.getItem("blog_session");
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  },
};
