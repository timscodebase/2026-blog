import { db } from "../db";
import { getReadingTime } from "../utils";
import { Auth } from "../auth";

export class BlogList extends HTMLElement {
  private searchTerm = "";
  private filterTag: string | null = null;

  async connectedCallback() {
    this.render();
    window.addEventListener("post-added", () => this.render());
  }

  async exportData() {
    const posts = await db.posts.toArray();
    const blob = new Blob([JSON.stringify(posts, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async render() {
    const user = Auth.getUser();
    let posts = await db.posts.orderBy("date").reverse().toArray();

    if (this.searchTerm || this.filterTag) {
      posts = posts.filter((p) => {
        const matchesSearch =
          !this.searchTerm || p.title.toLowerCase().includes(this.searchTerm);
        const matchesTag = !this.filterTag || p.tags?.includes(this.filterTag);
        return matchesSearch && matchesTag;
      });
    }

    this.innerHTML = `
      <div class="list-controls">
        <div class="search-wrapper">
          <input type="text" id="search-input" placeholder="Search..." value="${
            this.searchTerm
          }"/>
        </div>
        ${
          user?.role === "admin"
            ? '<button id="export-btn" class="secondary-btn">Backup</button>'
            : ""
        }
      </div>
      ${
        this.filterTag
          ? `<div class="filter-status">Tag: ${this.filterTag} <button id="clear-tag">X</button></div>`
          : ""
      }
      <div class="posts-container">
        ${posts
          .map(
            (post) => `
          <article class="post-card">
            <h3><a href="#/post/${post.id}">${post.title}</a></h3>
            <div class="tag-list">${(post.tags || [])
              .map((t) => `<span class="tag-pill" data-tag="${t}">${t}</span>`)
              .join("")}</div>
            <p>${post.content.substring(0, 100)}...</p>
            <div class="post-item-meta">
              <small>${new Date(
                post.date
              ).toLocaleDateString()} • ${getReadingTime(post.content)}</small>
              ${
                user?.role === "admin"
                  ? `<button class="delete-btn" data-id="${post.id}">Delete</button>`
                  : ""
              }
            </div>
          </article>
        `
          )
          .join("")}
      </div>
    `;

    this.querySelector("#search-input")?.addEventListener("input", (e) => {
      this.searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
      this.render();
    });

    this.querySelector("#export-btn")?.addEventListener("click", () =>
      this.exportData()
    );
    this.querySelector("#clear-tag")?.addEventListener("click", () => {
      this.filterTag = null;
      this.render();
    });

    this.querySelectorAll(".tag-pill").forEach((p) =>
      p.addEventListener("click", (e) => {
        this.filterTag = (e.target as HTMLElement).dataset.tag!;
        this.render();
      })
    );

    this.querySelectorAll(".delete-btn").forEach((b) =>
      b.addEventListener("click", async (e) => {
        const id = Number((e.target as HTMLElement).dataset.id);
        if (confirm("Delete?")) {
          await db.posts.delete(id);
          this.render();
        }
      })
    );
  }
}
customElements.define("blog-list", BlogList);
