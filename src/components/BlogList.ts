import { db } from "../db";
import { getReadingTime } from "../utils"; // Import utility

export class BlogList extends HTMLElement {
  // ... existing search logic ...

  async render() {
    let posts = await db.posts.orderBy("date").reverse().toArray();

    // ... existing filtering logic ...

    this.innerHTML = `
      <div class="search-wrapper">
        <input type="text" id="search-input" placeholder="Search posts..." value="${
          this.searchTerm
        }"/>
      </div>
      <div class="posts-container">
        ${posts
          .map(
            (post) => `
          <article class="post-card">
            <h3><a href="#/post/${post.id}">${post.title}</a></h3>
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
    // ... rest of the render logic ...
  }
}
customElements.define("blog-list", BlogList);
