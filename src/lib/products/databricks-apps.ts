import { msg } from "gt-next";

import type { ProductPageContent } from "@/lib/products/product-page";

export const databricksAppsProduct: ProductPageContent = {
  slug: "databricks-apps",
  title: "Databricks Apps",
  description: msg(
    "A deploy platform for apps, with built-in auth, hosting, and integrations.",
  ),
  canonicalPath: "/product/databricks-apps",
  hero: {
    eyebrow: "Databricks Apps",
    title: msg("Build full-stack apps on your data."),
    highlightedTitle: "Databricks Apps.",
    description: msg(
      "A deploy platform for apps, with built-in auth, hosting, and integrations.",
    ),
    image: {
      src: "/img/products/hero/databricks-apps.png",
      alt: msg(
        "Databricks Apps interface showing an app dashboard and deployment terminal.",
      ),
      width: 1216,
      height: 434,
    },
    actions: [
      {
        label: msg("Build with Databricks Apps"),
        href: "/templates/spin-up-databricks-app",
        variant: "primary",
      },
      {
        label: msg("Read the docs"),
        href: "/docs/apps/overview",
        variant: "secondary",
      },
    ],
  },
  benefitsIntro: {
    eyebrow: msg("Benefits"),
    title: msg("Where your app and data come together."),
    description: msg(
      "Most app stacks require wiring auth, data, and services together. Databricks Apps runs it all in one place.",
    ),
  },
  benefits: [
    {
      title: msg("Connected by default"),
      description: msg(
        "Authentication, data access, and services work together out of the box — eliminating glue code.",
      ),
      icon: "plus",
    },
    {
      title: msg("One unified stack"),
      description: msg(
        "No separate application stack or environments to manage — focus on building and shipping instantly.",
      ),
      icon: "layers",
    },
    {
      title: msg("Built on your data"),
      description: msg(
        "Use governed data, models, and permissions your platform already runs on for seamless access.",
      ),
      icon: "data",
    },
  ],
  featuresIntro: {
    eyebrow: msg("Features"),
    title: msg("How you build and ship with Databricks Apps"),
  },
  features: [
    {
      eyebrow: msg("Serverless app hosting"),
      index: "01",
      title: msg("Run your app inside Databricks."),
      description: msg(
        "Serverless hosting for full-stack apps, with compute, TLS, and deployment handled.",
      ),
      body: msg(
        "Apps run inside your workspace — no infrastructure to manage and no separate hosting to maintain.",
      ),
      details: [
        msg("Containerized runtime with managed compute"),
        msg("Built-in TLS and automatic HTTPS app URLs"),
        msg("Automatic builds and deploys from source"),
      ],
      visual: "serverless",
    },
    {
      eyebrow: msg("Auth & Permissions"),
      index: "02",
      title: msg("Secure your app with built-in identity."),
      description: msg(
        "Native authentication and permissions, fully integrated with your data and resources.",
      ),
      body: msg(
        "Identity flows through your app — no separate auth system to build or permissions layer to manage across data, models, and services.",
      ),
      details: [
        msg("Service principals created and managed per app"),
        msg("On-behalf-of-user access with fine-grained controls"),
        msg("Permissions enforced across data, models, and resources"),
      ],
      visual: "auth",
    },
    {
      eyebrow: msg("Native integrations"),
      index: "03",
      title: msg("Connect to data and services, natively."),
      description: msg(
        "Apps integrate directly with your data, models, and services as first-class resources.",
      ),
      body: msg(
        "Declare dependencies once — no API keys to manage or services to wire together across environments.",
      ),
      details: [
        msg("Native access to SQL, Lakebase, and storage"),
        msg("Built-in connections to models and vector search"),
        msg("Secrets and external services managed in one place"),
      ],
      visual: "integrations",
    },
  ],
  useCasesIntro: {
    eyebrow: msg("Use cases"),
    title: msg("How teams build with Databricks Apps."),
    description: msg(
      "Full-stack apps powering internal tools, AI interfaces, real-time systems, and more.",
    ),
  },
  useCases: [
    {
      title: msg("Data Applications"),
      description: msg(
        "Custom tools and dashboards built directly on warehouse data and metrics.",
      ),
    },
    {
      title: msg("AI Chat Applications"),
      description: msg(
        "Chat interfaces over documents, structured data, or a combination of both.",
      ),
    },
    {
      title: msg("Agent UIs Control Center"),
      description: msg(
        "Interfaces to monitor, debug, and manage AI agent workflows and actions.",
      ),
    },
    {
      title: msg("Inference Tools Hub"),
      description: msg(
        "Simple applications for running models with real inputs and displaying outputs.",
      ),
    },
    {
      title: msg("Real-Time Apps Engine"),
      description: msg(
        "Low-latency applications powered by operational data and continuously updated systems.",
      ),
    },
    {
      title: msg("Admin Tools Console"),
      description: msg(
        "Internal CRUD tools for managing data, users, and business operations.",
      ),
    },
    {
      title: msg("Data and AI Apps Platform"),
      description: msg(
        "Applications that combine analytics, models, and user interaction in one place.",
      ),
    },
    {
      title: msg("Workflow Apps Suite"),
      description: msg(
        "Tools that trigger jobs, manage approvals, and automate business processes.",
      ),
    },
  ],
  testimonialsIntro: {
    eyebrow: msg("Testimonials"),
    titleLead: msg("Databricks Apps powers real applications."),
    titleMuted: msg("See how teams ship data and AI apps on the platform."),
  },
  testimonials: [
    {
      company: "SAE International",
      quote: msg(
        "Databricks Apps helped me turn my RAG proof of concept into a polished and branded application. We built a RAG system to answer user questions by utilizing our company's extensive knowledge base.",
      ),
      attributionName: "Heather Gomer",
      attributionTitle: msg("Senior Data Scientist"),
    },
    {
      company: "E.ON Digital Technology",
      quote: msg(
        "The seamless integration of Databricks Apps into our DevOps processes enables us to quickly demonstrate and test new features with users while also providing a secure, production-ready front end for the internal application — all without needing additional infrastructure.",
      ),
      attributionName: "Lukas Heidegger",
      attributionTitle: msg("Data and MLOps Engineer"),
    },
    {
      company: "Addi",
      quote: msg(
        "By using Databricks Apps, we saved many rounds with the security and infrastructure team and were able to instantly share our app with stakeholders in production.",
      ),
      attributionName: "Cesar Augusto Charalla Olazo",
      attributionTitle: msg("Senior Machine Learning Engineer"),
    },
  ],
};
