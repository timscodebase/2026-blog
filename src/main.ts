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
  } else {
    updateMetaTags(
      "Local-First Blog 2026",
      "A framework-less blog built with Web Components and Dexie."
    );
    app.innerHTML = `
      <user-auth></user-auth>
      <h1>Local-First Blog</h1>
      ${
        user && user.role !== "viewer" ? "<blog-editor></blog-editor><hr/>" : ""
      }
      <blog-list></blog-list>
    `;
  }
}

// Event Listeners
window.addEventListener("hashchange", router);
window.addEventListener("auth-changed", router);
window.addEventListener("load", router);

// CRITICAL FIX: Call router immediately to handle cases where 'load' already fired
router();
