import { msg } from "gt-next";

export type SolutionAuthor = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  links?: { label: string; href: string }[];
};

const solutionAuthors: SolutionAuthor[] = [
  {
    id: "andre-landgraf",
    name: "Andre Landgraf",
    role: msg("Staff Developer Advocate, Databricks"),
    bio: msg(
      "Andre is a staff developer advocate at Databricks, focused on the developer experience for building data and AI apps on the Databricks platform.",
    ),
    photo: "/img/authors/andre-landgraf.jpg",
    links: [
      {
        label: "github.com/andrelandgraf",
        href: "https://github.com/andrelandgraf",
      },
    ],
  },
];

export function getSolutionAuthor(id: string): SolutionAuthor {
  const author = solutionAuthors.find((entry) => entry.id === id);
  if (!author) {
    throw new Error(`Solution author not found: ${id}`);
  }
  return author;
}
