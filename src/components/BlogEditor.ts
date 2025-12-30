import { db } from "../db";

export class BlogEditor extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <form id="post-form" class="card">
        <input type="text" id="title" placeholder="Blog Title" required />
        <textarea id="content" placeholder="Write your post (Markdown supported)..." required></textarea>
        <div class="file-input-wrapper">
          <label for="image">Post Image (Optional):</label>
          <input type="file" id="image" accept="image/*" />
        </div>
        <button type="submit">Publish Post</button>
      </form>
    `;

    this.querySelector("#post-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const titleInput = this.querySelector("#title") as HTMLInputElement;
      const contentInput = this.querySelector(
        "#content"
      ) as HTMLTextAreaElement;
      const imageInput = this.querySelector("#image") as HTMLInputElement;

      let imageData = "";
      if (imageInput.files && imageInput.files[0]) {
        imageData = await this.toBase64(imageInput.files[0]);
      }

      await db.posts.add({
        title: titleInput.value,
        content: contentInput.value,
        image: imageData || undefined,
        date: Date.now(),
      });

      titleInput.value = "";
      contentInput.value = "";
      imageInput.value = "";
      window.dispatchEvent(new CustomEvent("post-added"));
    });
  }

  private toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
}
customElements.define("blog-editor", BlogEditor);
