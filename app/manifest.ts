import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ClearIt",
    short_name: "ClearIt",
    description: "Take a picture. Know what to do.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fbff",
    theme_color: "#1d4ed8",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };
}
