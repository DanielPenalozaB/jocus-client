import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Jocus",
    short_name: "Jocus",
    description: "Play together, anywhere",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1f0f3f",
    theme_color: "#1f0f3f",
    categories: ["games", "entertainment"],
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
