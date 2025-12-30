import { db } from "../db";
import { getReadingTime } from "../utils";

export class BlogList extends HTMLElement {
  private searchTerm: string = "";

  async connectedCallback() {
    this.render();
    window.addEventListener("post-added", () => this.render());
  }

  private handleSearch(e: Event) {
    this.searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
    this.render();
  }

  // Feature #3: Data Export Logic
  private async exportData() {
    const posts = await db.posts.toArray();
    const blob = new Blob([JSON.stringify(posts, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blog-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async render() {
    let posts = await db.posts.orderBy("date").reverse().toArray();

    if (this.searchTerm) {
      posts = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(this.searchTerm) ||
          post.content.toLowerCase().includes(this.searchTerm)
      );
    }

    this.innerHTML = `
      <div class="list-controls">
        <div class="search-wrapper">
          <input 
            type="text" 
            id="search-input" 
            placeholder="Search posts..." 
            value="${this.searchTerm}"
          />
        </div>
        <button id="export-btn" class="secondary-btn">Download Backup (JSON)</button>
      </div>
      <div class="posts-container">
        ${
          posts.length === 0
            ? `<p>No posts found ${
                this.searchTerm ? `for "${this.searchTerm}"` : ""
              }.</p>`
            : ""
        }
        ${posts
          .map(
            (post) => `
          <article class="post-card">
            <h3><a href="#/post/${post.id}">${post.title}</a></h3>
            <p>${post.content.substring(0, 100)}${
              post.content.length > 100 ? "..." : ""
            }</p>
            <div class="post-item-meta">
              <small>${new Date(post.date).toLocaleDateString()}</small>
              <span class="reading-time-tag">${getReadingTime(
                post.content
              )}</span>
            </div>
          </article>
        `
          )
          .join("")}
      </div>
    `;

    // Re-attach listeners
    this.querySelector("#search-input")?.addEventListener("input", (e) =>
      this.handleSearch(e)
    );
    this.querySelector("#export-btn")?.addEventListener("click", () =>
      this.exportData()
    );

    // Restore focus if searching
    if (this.searchTerm) {
      const input = this.querySelector("#search-input") as HTMLInputElement;
      input.focus();
      input.setSelectionRange(this.searchTerm.length, this.searchTerm.length);
    }
  }
}
customElements.define("blog-list", BlogList);
