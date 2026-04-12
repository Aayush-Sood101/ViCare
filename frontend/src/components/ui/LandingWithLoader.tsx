"use client";

import { useState } from "react";
import { Loader } from "@/components/ui/Loader";

export function LandingWithLoader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <Loader onComplete={() => setLoading(false)} />}
      <div
        style={{
          opacity: loading ? 0 : 1,
          transition: "opacity 0.5s ease",
          visibility: loading ? "hidden" : "visible",
        }}
      >
        {children}
      </div>
    </>
  );
}
