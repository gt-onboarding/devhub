"use client";

import { useState } from "react";
import { T, useGT } from "gt-next";
import { Check, Link as LinkIcon } from "lucide-react";

function copyTextWithTextarea(value: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  document.body.removeChild(textarea);
  return copied;
}

export function HeadingCopyButton({ id }: { id: string }) {
  const gt = useGT();
  const [copied, setCopied] = useState(false);

  async function copyHeadingLink() {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;

    let succeeded = false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        succeeded = true;
      } catch {
        succeeded = copyTextWithTextarea(url);
      }
    } else {
      succeeded = copyTextWithTextarea(url);
    }

    if (!succeeded) {
      return;
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      aria-label={gt("Copy link to section")}
      className={`text-grey-70 ml-2 inline-flex translate-x-0 items-center gap-x-1 align-middle opacity-0 transition duration-300 group-hover/content-heading:translate-x-1 group-hover/content-heading:opacity-100 focus-visible:translate-x-1 focus-visible:opacity-100 ${
        copied ? "translate-x-1 opacity-100" : ""
      }`}
      onClick={() => {
        void copyHeadingLink();
      }}
      title={gt("Copy link")}
      type="button"
    >
      {copied ? (
        <>
          <Check className="size-4" />
          <span className="hidden text-xs leading-none font-medium lg:inline">
            <T>Copied</T>
          </span>
        </>
      ) : (
        <LinkIcon className="size-4" />
      )}
    </button>
  );
}
