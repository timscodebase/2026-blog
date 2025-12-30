import { db } from "../db";
import { updateMetaTags } from "../utils";
import snarkdown from "snarkdown"; // Import the parser

export class BlogPost extends HTMLElement {
  async connectedCallback() {
    const postId = this.getAttribute("post-id");
    if (!postId) return;

    const post = await db.posts.get(Number(postId));

    if (!post) {
      this.innerHTML = `<p>Post not found.</p><a href="#">Back to Home</a>`;
      return;
    }

    updateMetaTags(post.title, post.content.substring(0, 150), post.image);

    // Use snarkdown to convert content to HTML
    const htmlContent = snarkdown(post.content);

    this.innerHTML = `
      <article class="post-page">
        <a href="#" class="back-link">← Back to Blog</a>
        
        ${
          post.image
            ? `<img src="${post.image}" class="featured-image" alt="${post.title}" />`
            : ""
        }
        
        <h1>${post.title}</h1>
        <div class="post-meta">Published on ${new Date(
          post.date
        ).toLocaleDateString()}</div>
        
        <div class="post-body">
          ${htmlContent}
        </div>
      </article>
    `;
  }
}
customElements.define("blog-post", BlogPost);
