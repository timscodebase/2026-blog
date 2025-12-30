import { db } from "../db";
import { updateMetaTags, getReadingTime } from "../utils";
import snarkdown from "snarkdown";

export class BlogPost extends HTMLElement {
  async connectedCallback() {
    // ... existing fetch logic ...

    this.innerHTML = `
      <article class="post-page">
        <a href="#" class="back-link">← Back to Blog</a>
        ${
          post.image ? `<img src="${post.image}" class="featured-image" />` : ""
        }
        <h1>${post.title}</h1>
        <div class="post-meta">
          Published on ${new Date(post.date).toLocaleDateString()} • 
          <span class="reading-time">${getReadingTime(post.content)}</span>
        </div>
        <div class="post-body">${snarkdown(post.content)}</div>
      </article>
    `;
  }
}
customElements.define("blog-post", BlogPost);
