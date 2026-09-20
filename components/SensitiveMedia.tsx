"use client";

import { ReactNode, useState } from "react";

export default function SensitiveMedia({
  isSensitive,
  children,
  label = "Sensitive",
}: {
  isSensitive: boolean;
  children: ReactNode;
  label?: string;
}) {
  const [revealed, setRevealed] = useState(false);

  if (!isSensitive || revealed) {
    return <div className="relative">{children}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      className="relative block w-full cursor-pointer overflow-hidden text-left"
      aria-label={`${label} content, click to reveal`}
    >
      <div className="sensitive-blurred pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
        <span className="rounded-full bg-black/80 px-3 py-1 text-xs font-medium text-white">
          🔒 {label} — click to reveal
        </span>
      </div>
    </button>
  );
}
