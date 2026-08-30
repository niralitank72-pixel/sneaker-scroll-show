import { createFileRoute } from "@tanstack/react-router";
import { Experience } from "../components/Experience";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "THE DROP — AERON // X1 | Engineered To Move" },
      {
        name: "description",
        content:
          "A cinematic, scroll-driven 3D product experience for AERON // X1. Watch the sneaker reveal, rotate, explode into components and rebuild in real time WebGL.",
      },
      { property: "og:title", content: "THE DROP — AERON // X1" },
      {
        property: "og:description",
        content:
          "Scroll-controlled 3D sneaker showroom: reveal, rotation, exploded view, materials, energy and final drop.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <Experience />;
}
