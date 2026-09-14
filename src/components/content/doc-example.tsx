"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { PortalContainerProvider } from "@databricks/appkit-ui/react";
import { T, useGT } from "gt-next";
import { createPortal } from "react-dom";
import { Toaster } from "sonner";

import { getNextTabIndex } from "@/lib/tab-keyboard-navigation";
import { cn } from "@/lib/utils";
import CodeBlock from "@/components/content/code-block";
import {
  APPKIT_CHANNEL,
  docExamples,
  type DocExampleKey,
} from "@/components/doc-examples/registry";

type DocExampleProps = {
  name: string;
};

const exampleTabs = ["preview", "code"] as const;
type ExampleTab = (typeof exampleTabs)[number];

// Components whose previews need more vertical space than the auto-sizing can
// infer (dialogs/popovers/menus that open _above_ their trigger, components
// that pin content to a viewport edge). Upstream uses the same technique.
const HEIGHT_OVERRIDES: Partial<Record<DocExampleKey, number>> = {
  "aspect-ratio": 240,
  calendar: 240,
  dialog: 600,
  drawer: 700,
  "hover-card": 400,
  "navigation-menu": 600,
  menubar: 500,
  popover: 450,
  sheet: 700,
  "dropdown-menu": 500,
  select: 450,
  "alert-dialog": 500,
  "context-menu": 500,
  sidebar: 700,
};

function isValidExampleName(name: string): name is DocExampleKey {
  return Object.prototype.hasOwnProperty.call(docExamples, name);
}

export function DocExample({ name }: DocExampleProps): ReactNode {
  const gt = useGT();
  const [tab, setTab] = useState<ExampleTab>("preview");

  if (!isValidExampleName(name)) {
    return (
      <div className="border-destructive/30 bg-destructive/5 text-destructive my-6 rounded-xl border p-4 text-sm">
        Missing DocExample for <code>{name}</code>. Re-run{" "}
        <code>pnpm sync:appkit-docs</code> to sync examples from the upstream
        appkit repo.
      </div>
    );
  }

  const entry = docExamples[name];

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentTab: ExampleTab,
  ) {
    const nextIndex = getNextTabIndex(
      event.key,
      exampleTabs.indexOf(currentTab),
      exampleTabs.length,
    );
    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    setTab(exampleTabs[nextIndex]);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [nextIndex]?.focus();
  }

  return (
    <section
      data-doc-example={name}
      className="doc-example bg-background my-6 overflow-hidden rounded-xl border border-black/10 shadow-sm dark:border-white/10"
    >
      <header className="bg-muted/40 flex items-center justify-between border-b border-black/5 px-4 py-2 dark:border-white/5">
        <div
          role="tablist"
          aria-label={gt("{name} example views", { name })}
          className="bg-background/60 inline-flex items-center gap-1 rounded-md p-0.5 ring-1 ring-black/5 dark:ring-white/10"
        >
          <TabButton
            active={tab === "preview"}
            onClick={() => setTab("preview")}
            onKeyDown={(event) => handleTabKeyDown(event, "preview")}
          >
            <T>Preview</T>
          </TabButton>
          <TabButton
            active={tab === "code"}
            onClick={() => setTab("code")}
            onKeyDown={(event) => handleTabKeyDown(event, "code")}
          >
            <T>Code</T>
          </TabButton>
        </div>
        <span className="text-muted-foreground text-[0.6875rem] font-medium tracking-wider uppercase">
          {name}
        </span>
      </header>

      {tab === "preview" ? (
        <IframePreview
          exampleKey={name}
          Component={entry.Component}
          customHeight={HEIGHT_OVERRIDES[name]}
        />
      ) : (
        <div className="doc-example-source [&_.theme-code-block]:!my-0 [&_pre]:!rounded-none [&_pre]:!border-0 [&_pre]:!bg-transparent">
          <CodeBlock language="tsx">{entry.source}</CodeBlock>
        </div>
      )}
    </section>
  );
}

function TabButton({
  active,
  onClick,
  onKeyDown,
  children,
}: {
  active: boolean;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={active ? 0 : -1}
      className={cn(
        "inline-flex h-7 items-center rounded px-3 text-xs font-medium transition-colors",
        active
          ? "bg-foreground text-background shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

// Iframe-based preview. AppKit-UI ships a Tailwind v4 stylesheet with its own
// `:root` tokens. An iframe keeps those tokens isolated from DevHub styles.
const PREVIEW_MIN_HEIGHT = 220;
const PREVIEW_MAX_HEIGHT = 800;
const PREVIEW_DEFAULT_HEIGHT = 240;

type IframePreviewProps = {
  exampleKey: DocExampleKey;
  Component: React.ComponentType;
  customHeight?: number;
};

function IframePreview({
  exampleKey,
  Component,
  customHeight,
}: IframePreviewProps) {
  const gt = useGT();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  // The compiled stylesheet path is keyed by the @databricks/appkit-ui major
  // version (v0, v1, ...) and written by scripts/sync-appkit-docs.mjs into
  // public/appkit-preview/<channel>/. Pulling the channel from the auto-
  // generated registry keeps this component, the synced docs, and the
  // compiled styles guaranteed to agree.
  const stylesHref = `/appkit-preview/${APPKIT_CHANNEL}/styles.css`;

  const height = useAutoHeight(iframeRef, customHeight);
  useSonnerStyleSync(iframeRef, exampleKey);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(iframeHtml(stylesHref));
    doc.close();

    const setFromRoot = () => {
      const root = doc.getElementById("preview-root");
      if (root) setMountNode(root);
    };

    const link = doc.querySelector('link[rel="stylesheet"]');
    if (link) {
      link.addEventListener("load", setFromRoot, { once: true });
      link.addEventListener("error", setFromRoot, { once: true });
    } else {
      setFromRoot();
    }
  }, [stylesHref]);

  return (
    <iframe
      ref={iframeRef}
      title={gt("{name} preview", { name: exampleKey })}
      style={{
        width: "100%",
        height: `${height}px`,
        minHeight: `${PREVIEW_MIN_HEIGHT}px`,
        maxHeight: `${PREVIEW_MAX_HEIGHT}px`,
        border: "none",
        display: "block",
        backgroundColor: "transparent",
        transition: "height 0.2s ease",
      }}
    >
      {mountNode &&
        createPortal(
          <PortalContainerProvider
            container={iframeRef.current?.contentDocument?.body ?? null}
          >
            {exampleKey === "sonner" ? <Toaster /> : null}
            <Component />
          </PortalContainerProvider>,
          mountNode,
        )}
    </iframe>
  );
}

function iframeHtml(stylesHref: string): string {
  return `<!doctype html>
<html class="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="${stylesHref}" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: auto;
        overflow: visible;
      }
      html {
        background: #111b20;
      }
      body {
        background: transparent;
        padding: 1.25rem;
        color: var(--foreground, inherit);
      }
      #preview-root {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: ${PREVIEW_MIN_HEIGHT - 40}px;
      }
    </style>
  </head>
  <body>
    <div id="preview-root"></div>
  </body>
</html>`;
}

function useAutoHeight(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  customHeight: number | undefined,
) {
  const [height, setHeight] = useState<number>(
    customHeight ?? PREVIEW_DEFAULT_HEIGHT,
  );

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument?.body) return;

    if (customHeight) {
      setHeight(customHeight);
      return;
    }

    const doc = iframe.contentDocument;
    const update = () => {
      const scroll = doc.body.scrollHeight;
      const next = Math.min(
        Math.max(scroll + 20, PREVIEW_MIN_HEIGHT),
        PREVIEW_MAX_HEIGHT,
      );
      setHeight(next);
    };

    const initial = setTimeout(update, 100);
    const observer = new ResizeObserver(update);
    observer.observe(doc.body);

    return () => {
      clearTimeout(initial);
      observer.disconnect();
    };
  }, [iframeRef, customHeight]);

  return height;
}

// Sonner injects its keyframe + toast styles into the *parent* document on
// first render. When the Toaster is portaled into an iframe, those styles
// never reach it. Clone them over for the sonner preview only.
function useSonnerStyleSync(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  exampleKey: DocExampleKey,
) {
  useEffect(() => {
    if (exampleKey !== "sonner") return;
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;

    const doc = iframe.contentDocument;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const cloneStyles = () => {
      const sonnerStyles = Array.from(
        document.querySelectorAll("style"),
      ).filter(
        (el) =>
          el.textContent?.includes("[data-sonner-toaster]") ||
          el.textContent?.includes("[data-sonner-toast]"),
      );

      if (sonnerStyles.length > 0) {
        for (const style of sonnerStyles) {
          doc.head.appendChild(style.cloneNode(true));
        }
        return;
      }

      if (attempts < 10) {
        attempts += 1;
        timer = setTimeout(cloneStyles, 100);
      }
    };

    timer = setTimeout(cloneStyles, 100);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [iframeRef, exampleKey]);
}
