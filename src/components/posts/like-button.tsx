"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUpOutlineIcon, ThumbsUpFilledIcon } from "@/components/icons/icons";
import { cn } from "@/lib/utils";
import { toggleLike } from "@/app/actions/likes";

interface LikeButtonProps {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
}

export function LikeButton(props: Readonly<LikeButtonProps>) {
  const router = useRouter();
  const [count, setCount] = useState(props.initialCount);
  const [liked, setLiked] = useState(props.initialLiked);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await toggleLike(props.postId);
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
        "flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60",
        liked
          ? "text-primary"
          : "text-muted-foreground hover:text-primary",
      )}
    >
      <span>{liked ? "Retirer le like" : "Aimer"}</span>
      {liked ? <ThumbsUpFilledIcon className="h-5 w-5" /> : <ThumbsUpOutlineIcon className="h-5 w-5" />}
      {count}
    </button>
  );
}