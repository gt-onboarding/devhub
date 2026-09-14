import type { ReactNode } from "react";
import Image from "next/image";
import { useMessages } from "gt-next";

import type { SolutionAuthor } from "@/lib/solutions/authors";
import { cn } from "@/lib/utils";

const SOLUTION_AUTHOR_AVATAR_COMPACT_SIZE = 28;
const SOLUTION_AUTHOR_AVATAR_SIZE = 40;

function SolutionAuthorAvatar({
  author,
  compact,
}: {
  author: SolutionAuthor;
  compact: boolean;
}): ReactNode {
  const avatarSize = compact
    ? SOLUTION_AUTHOR_AVATAR_COMPACT_SIZE
    : SOLUTION_AUTHOR_AVATAR_SIZE;

  return (
    <Image
      src={author.photo}
      alt={author.name}
      width={avatarSize}
      height={avatarSize}
      loading="eager"
      quality={100}
      className={cn(
        "rounded-full object-cover",
        compact ? "size-7 ring-2 ring-black" : "size-10 ring-1 ring-white/15",
      )}
    />
  );
}

export function SolutionByline({
  authors,
  publishedAt,
  compact = false,
}: {
  authors: SolutionAuthor[];
  publishedAt: string;
  compact?: boolean;
}): ReactNode {
  const m = useMessages();
  const names = authors.map((author) => author.name).join(", ");
  const sharedRole =
    authors.length > 0 &&
    authors.every((author) => author.role === authors[0].role)
      ? authors[0].role
      : null;

  return (
    <div
      className={cn("flex items-center", compact ? "gap-2.5" : "mt-5 gap-3")}
    >
      <div className={cn("flex", compact ? "-space-x-2.5" : "-space-x-2")}>
        {authors.map((author) => (
          <SolutionAuthorAvatar
            key={author.id}
            author={author}
            compact={compact}
          />
        ))}
      </div>
      <div
        className={cn(
          "flex min-w-0 flex-col",
          compact ? "text-sm leading-5" : "gap-0.5 text-sm leading-tight",
        )}
      >
        <span
          className={cn(
            "truncate",
            compact ? "text-grey-90 font-normal" : "font-medium text-white",
          )}
        >
          {names}
        </span>
        {!compact && sharedRole ? (
          <span className="text-grey-70 truncate">{m(sharedRole)}</span>
        ) : null}
        <time className="sr-only" dateTime={publishedAt}>
          {publishedAt}
        </time>
      </div>
    </div>
  );
}
