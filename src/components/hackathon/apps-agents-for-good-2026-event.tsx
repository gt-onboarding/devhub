import Link from "next/link";
import { msg, T } from "gt-next";

import type { HackathonEvent } from "@/components/hackathon/hackathon-event-page";

/**
 * Apps & Agents for Good Hackathon at Data + AI Summit 2026.
 *
 * Served at `/hackathon/apps-agents-for-good-2026`. Content is hardcoded here
 * so it can be edited without touching other events or shared schema.
 *
 * Plain string fields are marked with `msg()` and resolved with `m()` where
 * they render; rich fields are wrapped in `<T>` so gt-next can translate them
 * in place. Dates and URLs are left as-is.
 */

const hackathonDatasetUrl =
  "https://login.databricks.com/signin?intent=SIGN_IN&auto_login=true&destination_url=%2Fmarketplace%2Fconsumer%2Flistings%2F19326b3d-db63-4627-abc0-cf4e8131a305&utm_source=open-in-databricks&utm_medium=marketplace&utm_campaign=dais-devrel-hackathon";

const inlineLink =
  "text-db-lava hover:text-db-lava-dark font-medium underline underline-offset-2";

export const appsAgentsForGood2026Event: HackathonEvent = {
  name: msg("Apps & Agents for Good Hackathon"),
  description: (
    <T>
      The Databricks Apps & Agents for Good Hackathon 2026 is a multi-day
      competition hosted in partnership with OpenAI, bringing developers
      together to drive meaningful change.
    </T>
  ),
  metaTitle: msg(
    "Apps & Agents for Good Hackathon — Databricks Data + AI Summit 2026",
  ),
  metaDescription: msg(
    "Databricks Apps & Agents for Good Hackathon at Data + AI Summit 2026 — schedule, resources, and how to apply.",
  ),
  applyUrl:
    "https://events.mlh.com/events/13878-databricks-apps-agents-hackathon-for-good",
  registrationClosed: true,
  applyNote: (
    <T>
      Registration is now closed. The hackathon is open only to Data + AI Summit
      2026 attendees.
    </T>
  ),
  facts: [
    {
      title: msg("Data + AI Summit"),
      detail: <T>Partnering with OpenAI</T>,
    },
    {
      title: msg("When"),
      detail: "June 15 – June 16, 2026",
    },
    {
      title: msg("Where"),
      detail: <T>Marriott Marquis, San Francisco</T>,
    },
  ],
  about: (
    <T>
      <p className="m-0">
        This year's hackathon challenges teams to build powerful agentic data
        apps for social impact using Lakebase, Agent Bricks, and Databricks
        Apps.
      </p>
      <p className="m-0">
        The event culminates in live judging, a showcase of standout projects,
        and cash prizes for the most impactful and imaginative solutions. The
        hackathon is part of Data + AI Summit 2026 — you and every teammate must
        be registered for the summit to participate.
      </p>
    </T>
  ),
  resources: [
    {
      label: msg("Checklist"),
      title: msg("Quick start checklist"),
      href: "/hackathon/quick-start-checklist",
      description: (
        <T>Follow the step-by-step checklist to get set up and start coding.</T>
      ),
      wide: true,
    },
    {
      label: msg("Challenge"),
      title: msg("The challenge"),
      href: "/hackathon/challenge",
      description: (
        <T>
          Read the full challenge prompt, dataset overview, and the four tracks
          you can pick from.
        </T>
      ),
    },
    {
      label: msg("Setup guide"),
      title: msg("Set up Free Edition"),
      href: "/hackathon/free-edition-setup",
      description: (
        <T>
          Create a Databricks Free Edition workspace and get your whole team
          ready to build and demo.
        </T>
      ),
    },
    {
      label: msg("Dataset"),
      title: msg("Hackathon dataset"),
      href: hackathonDatasetUrl,
      external: true,
      description: (
        <T>
          Add the hackathon dataset to your Databricks workspace to start
          building with it.
        </T>
      ),
    },
    {
      label: msg("Template"),
      title: msg("Hackathon starter template"),
      href: "/templates/hackathon-app-with-synced-dataset",
      description: (
        <T>
          Scaffold a Databricks App backed by Lakebase with the hackathon
          dataset automatically synced in.
        </T>
      ),
    },
    {
      label: msg("Discord community"),
      title: msg("Ask questions"),
      href: "https://discord.com/invite/bedRGCjFq",
      external: true,
      description: (
        <T>
          Stuck on something during the build? Join our hackathon Discord server
          to ask questions anytime.
        </T>
      ),
    },
    {
      label: msg("PDF"),
      title: msg("Official rules"),
      href: "https://bit.ly/4d0Gj7w",
      external: true,
      description: (
        <T>
          Read the eligibility, team requirements, IP terms, and judging rules
          before you start building anything.
        </T>
      ),
    },
    {
      label: msg("Docs"),
      title: msg("Read the Docs"),
      wide: true,
      description: (
        <T>
          <p className="m-0">
            Read the docs to learn how to set up your coding environment and
            start building your app. We highly suggest reading the following
            pages before you start hacking:
          </p>
        </T>
      ),
      links: [
        { label: msg("Start here"), href: "/docs/start-here" },
        { label: msg("Platform overview"), href: "/docs/platform-overview" },
        { label: msg("Databricks CLI"), href: "/docs/tools/databricks-cli" },
        {
          label: msg("Agent skills"),
          href: "/docs/tools/ai-tools/agent-skills",
        },
        { label: msg("What are templates?"), href: "/docs/templates" },
      ],
    },
  ],
  timeline: [
    {
      date: "May 31, 2026 · 11:59pm PT",
      label: msg("Applications close"),
      detail: msg("Apply on MLH in teams of 2–4."),
    },
    {
      date: "June 15, 2026 · 8:00am–4:00pm PT",
      label: msg("Opening + hacking begins"),
      detail: msg(
        "A full day of hacking, kicking off with the opening ceremony at Marriott Marquis, San Francisco.",
      ),
    },
    {
      date: "June 16, 2026 · 11:00am–5:00pm PT",
      label: msg("Hacker's Corner (optional)"),
      detail: msg("Open collaboration space with mentors on hand to help."),
    },
    {
      date: "June 16, 2026 · 6:00pm–9:00pm PT",
      label: msg("Judging + awards"),
      detail: msg("Live judging, followed by the awards ceremony."),
    },
  ],
  submission: (
    <T>
      Submit a Git repo and project description. Be ready to give a three-minute
      demo.
    </T>
  ),
  submissionUrl: "https://dais-for-good-2026.devpost.com/",
  judgingIntro: <T>Submissions will be judged on four dimensions:</T>,
  judgingCriteria: [
    {
      title: msg("Product judgment"),
      detail: msg(
        "Is the user clear? Are the workflow and tradeoffs thoughtful?",
      ),
    },
    {
      title: msg("Evidence and uncertainty"),
      detail: msg(
        "Are outputs grounded in citations? Is uncertainty handled honestly?",
      ),
    },
    {
      title: msg("Technical execution"),
      detail: msg(
        "Does the app work reliably in a live demo? Are Databricks capabilities used well?",
      ),
    },
    {
      title: msg("Ambition"),
      detail: msg(
        "Did the team go beyond the minimum workflow in a meaningful way?",
      ),
    },
  ],
  faq: [
    {
      question: msg("Do I need to be registered for Data + AI Summit 2026?"),
      answer: (
        <T>
          Yes. The hackathon is part of Data + AI Summit 2026, and every
          participant — including all teammates — must be registered for the
          summit to take part.
        </T>
      ),
    },
    {
      question: msg("When do applications close?"),
      answer: (
        <T>
          Sunday, May 31, 2026 at 11:59pm PT. Apply through the MLH event page;
          if you've applied, hold off on booking Monday activities in the DAIS
          attendee portal until you hear back.
        </T>
      ),
    },
    {
      question: msg("Where is the hackathon?"),
      answer: (
        <T>
          In-person only at the Marriott Marquis in San Francisco, alongside
          Data + AI Summit 2026.
        </T>
      ),
    },
    {
      question: msg("How big can my team be?"),
      answer: (
        <T>
          Teams of 2 to 4 people. Every teammate must also be registered for
          Data + AI Summit 2026.
        </T>
      ),
    },
    {
      question: msg("What if I'm new to Databricks?"),
      answer: (
        <T>
          Start with the "Start here" docs and copy one of the templates as a
          prompt for your coding agent — it will scaffold a working app and walk
          you through the rest.
        </T>
      ),
    },
    {
      question: msg("What if I can't run a coding agent on my laptop?"),
      answer: (
        <T>
          <p>
            Some participants may be using corporate laptops where local
            installs, IDE extensions, or coding agents are restricted.
            That&rsquo;s okay — you can still participate. You can follow the
            manual AppKit quick start to scaffold and deploy a Databricks App
            with the CLI:{" "}
            <Link
              href="/docs/appkit/v0#manual-quick-start"
              className={inlineLink}
            >
              Getting started with AppKit
            </Link>
            .
          </p>
          <p>
            If possible, try to form a team with at least one person who has a
            local coding-agent setup and can iterate on the app. Not everyone on
            the team needs to work on the app code at the same time — other
            teammates can focus on data exploration, product direction,
            evaluation, storytelling, the final demo, and other areas where a
            local coding agent is less valuable.
          </p>
          <p>
            You can also use agentic tools that don&rsquo;t require local setup:
          </p>
          <ul className="m-0 flex list-disc flex-col gap-y-2 pl-5">
            <li>
              <strong>Databricks Genie Code</strong> — use Genie Code inside
              Databricks for help understanding the dataset, writing SQL,
              exploring tables, shaping the data work that powers your app, and
              creating and managing the app.
            </li>
            <li>
              <strong>Browser-based development tools</strong> — tools like
              Replit can be useful when your laptop can&rsquo;t install a local
              coding environment. Check your company policies before connecting
              accounts, repos, or data.
            </li>
          </ul>
          <p>
            If your team is blocked by laptop restrictions, don&rsquo;t spend
            the whole hackathon fighting the machine. Shift work to the teammate
            or environment that can run the app, and use Databricks itself for
            as much data exploration and prototyping as possible. Ask hackathon
            mentors for help and ideas.
          </p>
        </T>
      ),
    },
    {
      question: msg("Which Databricks account should I use?"),
      answer: (
        <T>
          <p>
            Use a personal Databricks Free Edition account, not your work or
            enterprise account. Building and demoing on Free Edition keeps every
            team on the same playing field — see the{" "}
            <Link href="/hackathon/free-edition-setup" className={inlineLink}>
              Free Edition setup guide
            </Link>{" "}
            to get set up.
          </p>
        </T>
      ),
    },
  ],
};
