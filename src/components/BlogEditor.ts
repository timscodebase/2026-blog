import { db } from "../db";
import { Auth } from "../auth";

export class BlogEditor extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <form id="post-form" class="card">
        <input type="text" id="title" placeholder="Blog Title" required />
        <textarea id="content" placeholder="Content (Markdown)..." required></textarea>
        <input type="text" id="tags" placeholder="Tags (comma separated)" />
        <div class="file-input-wrapper">
          <label>Image:</label>
          <input type="file" id="image" accept="image/*" />
        </div>
        <button type="submit">Publish</button>
      </form>
    `;

    this.querySelector("#post-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const user = Auth.getUser();
      if (!user) return;

      const title = (this.querySelector("#title") as HTMLInputElement).value;
      const content = (this.querySelector("#content") as HTMLTextAreaElement)
        .value;
      const tagsInput = (this.querySelector("#tags") as HTMLInputElement).value;
      const imageFile = (this.querySelector("#image") as HTMLInputElement)
        .files?.[0];

      let image = "";
      if (imageFile) image = await this.optimizeImage(imageFile);

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t);

      await db.posts.add({
        title,
        content,
        image,
        tags,
        authorId: user.id,
        date: Date.now(),
      });

      (e.target as HTMLFormElement).reset();
      window.dispatchEvent(new CustomEvent("post-added"));
    });
  }

  private optimizeImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
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
          canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
      };
    });
  }
}
customElements.define("blog-editor", BlogEditor);
