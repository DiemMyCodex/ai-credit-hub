"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PlaygroundRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/chat");
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 font-mono text-xs">
      Đang chuyển hướng sang giao diện Chat...
    </div>
  );
}
