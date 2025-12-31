import "./style.css";
import "./components/BlogEditor";
import "./components/BlogList";
import "./components/BlogPost";
import "./components/UserAuth";
import { updateMetaTags } from "./utils";
import { Auth } from "./auth";

const app = document.querySelector<HTMLDivElement>("#app")!;

function router() {
  const hash = window.location.hash;
  const user = Auth.getUser();
  app.innerHTML = "";

  if (hash.startsWith("#/post/")) {
    const id = hash.replace("#/post/", "");
    const el = document.createElement("blog-post");
    el.setAttribute("post-id", id);
    app.appendChild(el);
  } else if (hash === "#/auth") {
    app.innerHTML = "<user-auth></user-auth>";
  } else if (hash === "#/editor") {
    if (user && user.role !== "viewer") {
      app.innerHTML = "<blog-editor></blog-editor>";
    } else {
      window.location.hash = "#/auth";
    }
  } else {
    updateMetaTags(
      "Local-First Blog 2026",
      "A framework-less blog built with Web Components and Dexie."
    );
    app.innerHTML = `
      <nav>
        <a href="#">Home</a>
        ${
          user
            ? `
              ${
                user.role !== "viewer"
                  ? '<a href="#/editor">New Post</a>'
                  : ""
              }
              <a href="#" id="logout">Logout</a>
            `
            : '<a href="#/auth">Login</a>'
        }
      </nav>
      <h1>Local-First Blog</h1>
      <blog-list></blog-list>
    `;
    const logoutLink = document.querySelector("#logout");
    if (logoutLink) {
      logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        Auth.logout();
        window.dispatchEvent(new CustomEvent("auth-changed"));
      });
    }
  }
}

// Event Listeners
window.addEventListener("hashchange", router);
window.addEventListener("auth-changed", (e) => {
  if (
    (e as CustomEvent).detail &&
    (e as CustomEvent).detail.loggedIn
  ) {
    window.location.hash = "#";
  }
  router();
});
window.addEventListener("load", router);

// CRITICAL FIX: Call router immediately to handle cases where 'load' already fired
router();
