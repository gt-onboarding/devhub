import { msg } from "gt-next";

import type { ProductPageContent } from "@/lib/products/product-page";

export const agentBricksProduct: ProductPageContent = {
  slug: "agent-bricks",
  title: "Agent Bricks",
  description: msg(
    "The agent platform with multi-model routing, built-in evals, and secure data access.",
  ),
  canonicalPath: "/product/agent-bricks",
  hero: {
    eyebrow: "Agent Bricks",
    title: msg("Production-ready AI agents, on your data."),
    highlightedTitle: "Agent Bricks.",
    description: msg(
      "The agent platform with multi-model routing, built-in evals, and secure data access.",
    ),
    image: {
      src: "/img/products/hero/agent-bricks.png",
      alt: msg(
        "Agent Bricks interface showing multi-model routing, evaluations, and secure data access.",
      ),
      width: 1216,
      height: 337,
    },
    actions: [
      {
        label: msg("Build apps with Agent Bricks"),
        href: "/templates/ai-chat-app",
        variant: "primary",
      },
      {
        label: msg("Read the docs"),
        href: "/docs/agents/overview",
        variant: "secondary",
      },
    ],
  },
  benefitsIntro: {
    eyebrow: msg("Benefits"),
    title: msg("Build the agent, not the agent stack."),
    description: msg(
      "One environment for building, testing, and running agents — without stitching together separate systems.",
    ),
  },
  benefits: [
    {
      title: msg("Idea to agent"),
      description: msg(
        "Start from a prompt or template and iterate immediately, without setting up infrastructure first.",
      ),
      icon: "bulb",
    },
    {
      title: msg("Less overhead"),
      description: msg(
        "Focus on agent logic instead of wiring services, integrations, or maintaining supporting systems.",
      ),
      icon: "agent-arrows",
    },
    {
      title: msg("Production-ready"),
      description: msg(
        "Go from prototype to production with the same setup, without rebuilding as you scale.",
      ),
      icon: "agent-check",
    },
  ],
  featuresIntro: {
    eyebrow: msg("Features"),
    title: msg("What you get with Agent Bricks, out of the box"),
  },
  features: [
    {
      eyebrow: msg("Multi-model routing"),
      index: "01",
      title: msg("Use the right model for every task."),
      description: msg(
        "Switch between leading models like GPT, Claude, Llama, and more.",
      ),
      body: msg(
        "Send requests through a single API and route across models by cost, performance, or availability — without building your own orchestration layer.",
      ),
      details: [
        msg("Access models from multiple providers in one place"),
        msg("Route requests by cost, performance, or availability"),
        msg("Built-in fallback and usage controls"),
      ],
      visual: "multi-model",
    },
    {
      eyebrow: msg("Built-in evals"),
      index: "02",
      title: msg("Control and improve output quality."),
      description: msg(
        "Measure how your agent performs and make targeted improvements.",
      ),
      body: msg(
        "Run your agent against real scenarios, evaluate responses, and improve based on clear feedback — all in one place.",
      ),
      details: [
        msg("Generate eval datasets from real use cases"),
        msg("Score outputs for quality, relevance, and correctness"),
        msg("Compare results across prompts, models, and iterations"),
      ],
      visual: "built-in",
    },
    {
      eyebrow: msg("Secure data access"),
      index: "03",
      title: msg("Use your data, with the right permissions."),
      description: msg(
        "Access real data securely — without copying or bypassing controls.",
      ),
      body: msg(
        "Connect your agent to governed data and run queries with proper access controls, so it only sees what it's allowed to see.",
      ),
      details: [
        msg("Query data with user-level permissions"),
        msg("No data duplication or reverse ETL"),
        msg("Enforce access controls and governance by default"),
      ],
      visual: "secure-data",
    },
  ],
  useCasesIntro: {
    eyebrow: msg("Use cases"),
    title: msg("Built for real-world agents."),
    description: msg(
      "Common ways teams use Agent Bricks to build and ship AI-powered applications.",
    ),
  },
  useCases: [
    {
      title: msg("AI Copilots on Your Data"),
      description: msg(
        "Assist users by querying real data, generating responses, and taking actions with the right permissions.",
      ),
    },
    {
      title: msg("Customer Support"),
      description: msg(
        "Handle requests with agents that retrieve context, generate replies, and improve over time.",
      ),
    },
    {
      title: msg("Internal Automation"),
      description: msg(
        "Automate workflows by connecting systems and executing tasks beyond simple text generation.",
      ),
    },
    {
      title: msg("Decision-Making Systems"),
      description: msg(
        "Build systems that analyze inputs and take the next best action in real time.",
      ),
    },
    {
      title: msg("Content Pipelines"),
      description: msg(
        "Generate and validate content at scale with built-in evaluation to ensure consistent output quality.",
      ),
    },
    {
      title: msg("RAG Systems"),
      description: msg(
        "Ground responses in your data while enforcing access controls and permissions.",
      ),
    },
    {
      title: msg("Experimentation"),
      description: msg(
        "Compare prompts and models to optimize output quality, cost, and performance.",
      ),
    },
    {
      title: msg("Background Tasks"),
      description: msg(
        "Run agents asynchronously to process tasks, analyze data, and act without user interaction.",
      ),
    },
  ],
  testimonialsIntro: {
    eyebrow: msg("Testimonials"),
    titleLead: msg("Agent Bricks powers real agents in production."),
    titleMuted: msg("See how teams ship AI applications on governed data."),
  },
  testimonials: [
    {
      company: "AstraZeneca",
      quote: msg(
        "With Agent Bricks, our teams were able to parse through more than 400,000 clinical trial documents and extract structured data points — without writing a single line of code. In just under 60 minutes, we had a working agent that can transform complex unstructured data usable for Analytics.",
      ),
      attributionName: "Joseph Roemer",
      attributionTitle: msg("Head of Data & AI, Commercial IT"),
    },
    {
      company: "Flo Health",
      quote: msg(
        "Agent Bricks enabled us to double our medical accuracy over standard commercial LLMs, while meeting Flo Health's high internal standards for clinical accuracy, safety, privacy, and security.",
      ),
      attributionName: "Roman Bugaev",
      attributionTitle: msg("CTO"),
    },
    {
      company: "Lippert",
      quote: msg(
        "With Agent Bricks, we can quickly productionize domain-specific AI agents for tasks like extracting insights from customer support calls — something that used to take weeks of manual review.",
      ),
      attributionName: "Chris Nishnick",
      attributionTitle: msg("Director of AI"),
    },
  ],
};
