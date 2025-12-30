import "./style.css";
// These imports are necessary to register the Web Components
import "./components/BlogEditor";
import "./components/BlogList";
import "./components/BlogPost";

import { updateMetaTags } from "./utils";

// Select the app container defined in index.html
const app = document.querySelector<HTMLDivElement>("#app")!;

function router() {
  const hash = window.location.hash;
  app.innerHTML = "";

  if (hash.startsWith("#/post/")) {
    const id = hash.replace("#/post/", "");
    const postPage = document.createElement("blog-post");
    postPage.setAttribute("post-id", id);
    app.appendChild(postPage);
  } else {
    // Reset Meta Tags for Home
    updateMetaTags(
      "Local-First Blog 2026",
      "A modern, framework-less blog built with Dexie and Web Components."
    );

    app.innerHTML = `
      <h1>Local-First Blog</h1>
      <blog-editor></blog-editor>
      <hr />
      <blog-list></blog-list>
    `;
  }
}

// Global delete listener (refreshes page after deletion)
(window as any).deletePost = async (id: number) => {
  if (confirm("Delete this post?")) {
    const { db } = await import("./db");
    await db.posts.delete(id);
    window.location.hash = ""; // Go home
    router();
  }
};

// Listen for navigation and initial load
window.addEventListener("hashchange", router);
window.addEventListener("load", router);
