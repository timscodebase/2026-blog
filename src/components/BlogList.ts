import { db } from "../db";
import { getReadingTime } from "../utils";

export class BlogList extends HTMLElement {
  private searchTerm: string = "";
  private filterTag: string | null = null; // State for tag filtering

  async connectedCallback() {
    this.render();
    window.addEventListener("post-added", () => this.render());
  }

  // Feature #5: Data Export
  private async exportData() {
    const posts = await db.posts.toArray();
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(posts, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `blog_backup_${new Date().toLocaleDateString()}.json`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  async render() {
    let posts = await db.posts.orderBy("date").reverse().toArray();

    // Combined search and tag filtering
    if (this.searchTerm || this.filterTag) {
      posts = posts.filter((post) => {
        const matchesSearch =
          !this.searchTerm ||
          post.title.toLowerCase().includes(this.searchTerm) ||
          post.content.toLowerCase().includes(this.searchTerm);

        const matchesTag =
          !this.filterTag || (post.tags && post.tags.includes(this.filterTag));

        return matchesSearch && matchesTag;
      });
    }

    this.innerHTML = `
      <div class="list-controls">
        <div class="search-wrapper">
          <input type="text" id="search-input" placeholder="Search title or content..." value="${
            this.searchTerm
          }" />
        </div>
        <button id="export-btn" class="secondary-btn">Backup to JSON</button>
      </div>

      ${
        this.filterTag
          ? `
        <div class="filter-status">
          Showing posts with tag: <strong>${this.filterTag}</strong>
          <button id="clear-filter">Clear</button>
        </div>
      `
          : ""
      }

      <div class="posts-container">
        ${posts.length === 0 ? `<p>No matching posts found.</p>` : ""}
        ${posts
          .map(
            (post) => `
          <article class="post-card">
            <h3><a href="#/post/${post.id}">${post.title}</a></h3>
            <div class="tag-list">
              ${(post.tags || [])
                .map(
                  (tag) =>
                    `<span class="tag-pill" data-tag="${tag}">${tag}</span>`
                )
                .join("")}
            </div>
            <p>${post.content.substring(0, 100)}...</p>
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

    // Event Listeners
    this.querySelector("#search-input")?.addEventListener("input", (e) => {
      this.searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
      this.render();
    });

    this.querySelector("#export-btn")?.addEventListener("click", () =>
      this.exportData()
    );
    this.querySelector("#clear-filter")?.addEventListener("click", () => {
      this.filterTag = null;
      this.render();
    });

    // Click on a tag to filter the list
    this.querySelectorAll(".tag-pill").forEach((pill) => {
      pill.addEventListener("click", (e) => {
        this.filterTag = (e.target as HTMLElement).dataset.tag || null;
        this.render();
      });
    });
  }
}
customElements.define("blog-list", BlogList);
