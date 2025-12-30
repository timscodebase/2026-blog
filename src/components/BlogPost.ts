import { db } from "../db";
import { updateMetaTags, getReadingTime } from "../utils";
import snarkdown from "snarkdown";

export class BlogPost extends HTMLElement {
  async connectedCallback() {
    const postId = this.getAttribute("post-id");
    if (!postId) return;

    const post = await db.posts.get(Number(postId));

    if (!post) {
      this.innerHTML = `<p>Post not found.</p><a href="#">Back to Home</a>`;
      return;
    }

    // Update browser title and social meta tags
    updateMetaTags(post.title, post.content.substring(0, 150), post.image);

    this.innerHTML = `
      <article class="post-page">
        <a href="#" class="back-link">← Back to Blog</a>
        
        ${
          post.image
            ? `<img src="${post.image}" class="featured-image" alt="${post.title}" />`
            : ""
        }
        
        <h1>${post.title}</h1>
        <div class="post-meta">
          Published on ${new Date(post.date).toLocaleDateString()} • 
          <span class="reading-time">${getReadingTime(post.content)}</span>
        </div>
        
        <div class="post-body">
          ${snarkdown(post.content)}
        </div>
      </article>
    `;
  }
}
customElements.define("blog-post", BlogPost);
