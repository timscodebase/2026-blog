import { Auth } from "../auth";

export class UserAuth extends HTMLElement {
  connectedCallback() {
    this.render();
    window.addEventListener("auth-changed", () => this.render());
  }

  render() {
    const user = Auth.getUser();

    if (user) {
      this.innerHTML = `
        <div class="auth-status">
          <span>Logged in as <strong>${user.username}</strong> (${user.role})</span>
          <button id="logout-btn" class="secondary-btn">Logout</button>
        </div>
      `;
      this.querySelector("#logout-btn")?.addEventListener("click", () =>
        Auth.logout()
      );
    } else {
      this.innerHTML = `
        <div class="auth-form card">
          <input type="text" id="username" placeholder="Username" />
          <select id="role-select">
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button id="auth-btn">Sign In / Sign Up</button>
        </div>
      `;
      this.querySelector("#auth-btn")?.addEventListener("click", async () => {
        const username = (this.querySelector("#username") as HTMLInputElement)
          .value;
        const role = (this.querySelector("#role-select") as HTMLSelectElement)
          .value as any;
        if (!username) return;
        let user = await Auth.login(username);
        if (!user) user = await Auth.signup(username, role);
        this.render();
      });
    }
  }
}
customElements.define("user-auth", UserAuth);
