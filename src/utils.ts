export function updateMetaTags(
  title: string,
  description: string,
  image?: string
) {
  document.title = title;
  const tags = {
    "og:title": title,
    "og:description": description,
    "og:image": image || "/vite.svg",
    "og:type": "article",
    "twitter:card": "summary_large_image",
  };

  for (const [property, content] of Object.entries(tags)) {
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("property", property);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }
}
