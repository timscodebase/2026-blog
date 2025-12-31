import { Auth } from "../auth";
import { GoogleAuth } from "../google-auth";

export class UserAuth extends HTMLElement {
  connectedCallback() {
    this.render();
    GoogleAuth.init("YOUR_GOOGLE_CLIENT_ID", this.handleGoogleLogin.bind(this));
  }

  async handleGoogleLogin(response: any) {
    await Auth.loginWithGoogle(response.credential);
    this.innerHTML = ``;
    window.dispatchEvent(new CustomEvent("auth-changed", { detail: { loggedIn: true } }));
  }

  render() {
    const user = Auth.getUser();

    if (user) {
      // User is logged in, but we are on the auth page, so we show nothing.
      // The main router will redirect away from here.
      this.innerHTML = ``;
      return;
    }

    this.innerHTML = `
      <div class="auth-form card">
        <input type="text" id="username" placeholder="Username" />
        <select id="role-select">
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
        <button id="auth-btn">Sign In / Sign Up</button>
        <hr>
        <div id="google-signin-button"></div>
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
      
      // Dispatch event with detail
      window.dispatchEvent(new CustomEvent("auth-changed", { detail: { loggedIn: true } }));
    });
  }
}
customElements.define("user-auth", UserAuth);
