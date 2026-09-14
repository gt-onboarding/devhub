import { msg } from "gt-next";

import type { ProductPageContent } from "@/lib/products/product-page";

export const lakebaseProduct: ProductPageContent = {
  slug: "lakebase",
  title: "Lakebase",
  description: msg(
    "Managed Postgres with branching, autoscaling, and Lakehouse sync for modern agentic workloads.",
  ),
  canonicalPath: "/product/lakebase",
  hero: {
    eyebrow: "Lakebase",
    title: msg("Managed Postgres, built for modern agentic workloads."),
    highlightedTitle: "Lakebase.",
    description: msg(
      "The serverless database with branching, autoscaling, and your Lakehouse data.",
    ),
    image: {
      src: "/img/products/hero/lakebase.png",
      alt: msg(
        "Lakebase dashboard showing monitoring, branches, and project settings.",
      ),
      width: 1216,
      height: 450,
    },
    actions: [
      {
        label: msg("Build apps with Lakebase"),
        href: "/templates/app-with-lakebase",
        variant: "primary",
      },
      {
        label: msg("Read the docs"),
        href: "/docs/lakebase/overview",
        variant: "secondary",
      },
    ],
  },
  benefitsIntro: {
    eyebrow: msg("Benefits"),
    title: msg("Built for shipping, not provisioning."),
    description: msg(
      "No infrastructure to stand up, no reverse-ETL to wire, no credentials to rotate. Just the database and your app.",
    ),
  },
  benefits: [
    {
      title: msg("Real Postgres"),
      description: msg(
        "Wire-compatible with standard Postgres. Same drivers, extensions, and ORMs you already use.",
      ),
      icon: "plug",
    },
    {
      title: msg("Lakehouse-native"),
      description: msg(
        "Two-way Postgres-Lakehouse sync. Curated data for Lakebase app reads.",
      ),
      icon: "arrows",
    },
    {
      title: msg("Auth, handled"),
      description: msg(
        "Postgres roles linked to Databricks identities with short-lived secure tokens in apps.",
      ),
      icon: "lock",
    },
  ],
  featuresIntro: {
    eyebrow: msg("Features"),
    title: msg("How Lakebase powers\nthe apps you ship day to day"),
  },
  features: [
    {
      eyebrow: msg("Branching"),
      index: "01",
      title: msg("Branch your database instantly."),
      description: msg(
        "A full-fidelity copy, regardless of size, fully isolated from its parent.",
      ),
      body: msg(
        "Branches are copy-on-write — they share storage with their parent and only consume new space for the bytes you change.",
      ),
      details: [
        msg("Per-PR preview environments"),
        msg("Schema migration sandboxes"),
        msg("Branch from any point in time"),
      ],
      visual: "branching",
    },
    {
      eyebrow: msg("Autoscaling"),
      index: "02",
      title: msg("Right-size your compute automatically."),
      description: msg(
        "Demand-driven, scaled to zero on idle, milliseconds to wake.",
      ),
      body: msg(
        "Lakebase tracks load in real time and adjusts capacity within the range you set, with no compute cost while idle.",
      ),
      details: [
        msg("Non-disruptive scaling within range"),
        msg("Independent autoscaling per replica"),
        msg("Configurable idle timeout per branch"),
      ],
      visual: "autoscaling",
    },
    {
      eyebrow: msg("Lakehouse sync"),
      index: "03",
      title: msg("Connect your app to your Lakehouse."),
      description: msg(
        "Inbound and outbound, fully managed, governed by Unity Catalog.",
      ),
      body: msg(
        "Both directions are managed by Databricks, no external pipelines, no jobs you have to operate, no glue code to maintain.",
      ),
      details: [
        msg("Snapshot, triggered, or continuous sync"),
        msg("Schema-level config for outbound replication"),
        msg("Federated queries across both sides"),
      ],
      visual: "lakehouse-sync",
    },
  ],
  useCasesIntro: {
    eyebrow: msg("Use cases"),
    title: msg("How teams use Lakebase in production."),
    description: msg(
      "Lakebase powers the data layer between apps, agents, and your Lakehouse.",
    ),
  },
  useCases: [
    {
      title: msg("Shipping Full-Stack Apps"),
      description: msg(
        "Use Lakebase as your app database for users, sessions, and logic, no external Postgres needed.",
      ),
    },
    {
      title: msg("Powering Stateful AI Agents"),
      description: msg(
        "Store conversations, tool outputs, and state so agents persist across sessions.",
      ),
    },
    {
      title: msg("Serving Product Data"),
      description: msg(
        "Bring Lakehouse data into Postgres for low-latency reads across APIs, ORMs, and apps.",
      ),
    },
    {
      title: msg("Closing the Data Loop"),
      description: msg(
        "Capture app writes for analytics with no custom pipelines needed.",
      ),
    },
    {
      title: msg("Testing Database Changes"),
      description: msg(
        "Validate schema changes and new features in isolated environments before they reach production.",
      ),
    },
    {
      title: msg("Scaling Read-Heavy Apps"),
      description: msg(
        "Handle high query volume by distributing reads without changing your application architecture.",
      ),
    },
    {
      title: msg("Isolating Customers per Tenant"),
      description: msg(
        "Run separate database environments per tenant for independent scaling.",
      ),
    },
    {
      title: msg("Recovering and Debugging"),
      description: msg(
        "Restore past data states to investigate issues and understand how your system evolved over time.",
      ),
    },
  ],
  testimonialsIntro: {
    eyebrow: msg("Testimonials"),
    titleLead: msg("Lakebase powers applications."),
    titleMuted: msg(
      "See how teams use it to bring data directly into user experiences.",
    ),
  },
  testimonials: [
    {
      company: "tibber",
      quote: msg(
        "At Tibber, empowering customers to take control of their energy consumption requires a flexible data infrastructure. Lakebase's integration with Databricks makes it easy to serve analytical and transactional data, helping us deliver real-time insights to our customers.",
      ),
      attributionName: "Niklas Nordansjo",
      attributionTitle: msg("Data Platform Lead"),
    },
    {
      company: "Ensemble Health Partners",
      quote: msg(
        "Lakebase lets an agentic team quickly self-serve the data they need for their models, whether it's historical claims or real-time transactions, and that's really powerful.",
      ),
      attributionName: "Dragon Sky",
      attributionTitle: msg("Chief Architect"),
    },
    {
      company: "yipitDATA",
      quote: msg(
        "Lakebase gives us a durable, low-latency store for application state, so our data apps load quickly, refresh seamlessly and even support shared page links between users.",
      ),
      attributionName: "Bobby Muldoon",
      attributionTitle: msg("VP of Engineering"),
    },
  ],
};
