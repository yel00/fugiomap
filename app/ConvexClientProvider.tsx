"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";

const url = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!url) {
  console.warn("NEXT_PUBLIC_CONVEX_URL is not set — Convex will not work.");
}

const convex = new ConvexReactClient(url ?? "https://placeholder.convex.cloud");

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
