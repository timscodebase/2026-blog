import { db } from "../db";

export class BlogEditor extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <form id="post-form" class="card">
        <input type="text" id="title" placeholder="Blog Title" required />
        <textarea id="content" placeholder="Write your post (Markdown supported)..." required></textarea>
        <input type="text" id="tags" placeholder="Tags (comma separated, e.g. tech, personal)" />
        <div class="file-input-wrapper">
          <label for="image">Post Image (Optional - will be optimized):</label>
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
      const tagsInput = this.querySelector("#tags") as HTMLInputElement;
      const imageInput = this.querySelector("#image") as HTMLInputElement;

      let imageData = "";
      if (imageInput.files && imageInput.files[0]) {
        // Feature #6: Image Optimization before saving
        imageData = await this.optimizeImage(imageInput.files[0]);
      }

      // Feature #4: Parse comma-separated tags
      const tags = tagsInput.value
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t !== "");

      await db.posts.add({
        title: titleInput.value,
        content: contentInput.value,
        tags: tags.length > 0 ? tags : undefined,
        image: imageData || undefined,
        date: Date.now(),
      });

      // Reset form
      (e.target as HTMLFormElement).reset();
      window.dispatchEvent(new CustomEvent("post-added"));
    });
  }

  // Feature #6: Canvas-based Image Optimization
  private optimizeImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Export as compressed JPEG (0.7 quality)
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
      };
    });
  }
}
customElements.define("blog-editor", BlogEditor);
