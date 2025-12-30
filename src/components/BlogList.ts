import { db } from "../db";

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

  async render() {
    let posts = await db.posts.orderBy("date").reverse().toArray();

    // Filter posts based on search term
    if (this.searchTerm) {
      posts = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(this.searchTerm) ||
          post.content.toLowerCase().includes(this.searchTerm)
      );
    }

    this.innerHTML = `
      <div class="search-wrapper">
        <input 
          type="text" 
          id="search-input" 
          placeholder="Search posts..." 
          value="${this.searchTerm}"
        />
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
            <small>${new Date(post.date).toLocaleDateString()}</small>
          </article>
        `
          )
          .join("")}
      </div>
    `;

    // Re-attach the listener every time we re-render
    this.querySelector("#search-input")?.addEventListener("input", (e) =>
      this.handleSearch(e)
    );

    // Maintain focus for a better typing experience
    if (this.searchTerm) {
      const input = this.querySelector("#search-input") as HTMLInputElement;
      input.focus();
      input.setSelectionRange(this.searchTerm.length, this.searchTerm.length);
    }
  }
}
customElements.define("blog-list", BlogList);
