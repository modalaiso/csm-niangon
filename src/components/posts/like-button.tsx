"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleLike } from "@/app/actions/likes";

interface LikeButtonProps {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
}

export function LikeButton({ postId, initialCount, initialLiked }: LikeButtonProps) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await toggleLike(postId);
      if ("error" in result) {
        if (result.error === "auth_required") {
          router.push("/login");
        }
        return;
      }
      setLiked(result.liked);
      setCount(result.count);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={liked}
      className={cn(
        "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60",
        liked
          ? "border-destructive/50 bg-destructive/10 text-destructive"
          : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary",
      )}
    >
      <Heart className={cn("h-4 w-4", liked && "fill-destructive")} />
      {count}
    </button>
  );
}