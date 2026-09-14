"use client";

import { useEffect, useRef, useState } from "react";
import { useGT } from "gt-next";

function CodeCopyIcon() {
  return (
    <svg aria-hidden="true" className="size-full" viewBox="0 0 14 14">
      <path
        d="M10.0625 0.4375H0.4375V10.0625H10.0625V0.4375Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.8125 3.9375H13.5625V13.5625H3.9375V11.8125"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CodeCopiedIcon() {
  return (
    <svg aria-hidden="true" className="size-full" viewBox="0 0 24 24">
      <path
        d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CodeWordWrapIcon() {
  return (
    <svg aria-hidden="true" className="size-4.75" viewBox="0 0 24 24">
      <path
        d="M4 19h6v-2H4v2zM20 5H4v2h16V5zm-3 6H4v2h13.25c1.1 0 2 .9 2 2s-.9 2-2 2H15v-2l-3 3l3 3v-2h2c2.21 0 4-1.79 4-4s-1.79-4-4-4z"
        fill="currentColor"
      />
    </svg>
  );
}

function CodeCopyButton({ text }: { text: string }) {
  const gt = useGT();
  const [copied, setCopied] = useState(false);

  return (
    <button
      aria-label={copied ? gt("Copied code") : gt("Copy code to clipboard")}
      className="clean-btn"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        });
      }}
      title={
        copied
          ? gt("Copied", { $context: "code was copied to the clipboard" })
          : gt("Copy", { $context: "button that copies code" })
      }
      type="button"
    >
      <span className="copyButtonIcons">
        {copied ? <CodeCopiedIcon /> : <CodeCopyIcon />}
      </span>
    </button>
  );
}

function CodeWordWrapButton() {
  const gt = useGT();
  const [wrapped, setWrapped] = useState(false);

  return (
    <button
      aria-label={gt("Toggle word wrap")}
      aria-pressed={wrapped}
      className="clean-btn"
      onClick={(event) => {
        const nextWrapped = !wrapped;
        event.currentTarget
          .closest(".theme-code-block")
          ?.classList.toggle("code-block--word-wrap", nextWrapped);
        setWrapped(nextWrapped);
      }}
      title={gt("Toggle word wrap")}
      type="button"
    >
      <CodeWordWrapIcon />
    </button>
  );
}

export function CodeBlockControls({ text }: { text: string }) {
  const groupRef = useRef<HTMLDivElement>(null);
  const [canWrap, setCanWrap] = useState(false);

  useEffect(() => {
    const codeBlock = groupRef.current?.closest(".theme-code-block");
    const pre = codeBlock?.querySelector("pre");
    const code = codeBlock?.querySelector("code");
    if (!codeBlock || !pre || !code) {
      return;
    }

    const updateCanWrap = () => {
      if (codeBlock.classList.contains("code-block--word-wrap")) {
        setCanWrap(true);
        return;
      }

      const lineOverflows = Array.from(
        code.querySelectorAll<HTMLElement>(".line"),
      ).some(
        (line) => line.getBoundingClientRect().width > pre.clientWidth + 1,
      );

      setCanWrap(
        pre.scrollWidth > pre.clientWidth + 1 ||
          code.scrollWidth > code.clientWidth + 1 ||
          lineOverflows,
      );
    };

    updateCanWrap();
    const frame = window.requestAnimationFrame(updateCanWrap);
    const timeout = window.setTimeout(updateCanWrap, 250);
    void document.fonts?.ready.then(updateCanWrap);

    const observer = new ResizeObserver(updateCanWrap);
    observer.observe(pre);
    observer.observe(code);
    window.addEventListener("resize", updateCanWrap);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.removeEventListener("resize", updateCanWrap);
    };
  }, []);

  return (
    <div className="buttonGroup" ref={groupRef}>
      {canWrap ? <CodeWordWrapButton /> : null}
      <CodeCopyButton text={text} />
    </div>
  );
}
