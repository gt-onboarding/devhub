import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import {
  buildSolutionItems,
  getSolutionListItems,
  getSolutionPageCount,
} from "@/lib/solutions/solutions";

import SolutionsPage, { generateMetadata } from "../../page";

export { generateMetadata };

type SolutionsPaginatedPageProps = {
  params: Promise<{
    page: string;
  }>;
};

function getPublishedSolutionPageCount(): number {
  return getSolutionPageCount(getSolutionListItems(buildSolutionItems(false)));
}

function isValidSolutionsPageParam(page: string, pageCount: number): boolean {
  const pageNumber = Number(page);
  return (
    Number.isSafeInteger(pageNumber) &&
    pageNumber > 1 &&
    pageNumber <= pageCount
  );
}

export function generateStaticParams(): Array<{ page: string }> {
  const pageCount = getPublishedSolutionPageCount();
  return Array.from({ length: pageCount - 1 }, (_, index) => ({
    page: String(index + 2),
  }));
}

export default async function SolutionsPaginatedPage({
  params,
}: SolutionsPaginatedPageProps): Promise<ReactNode> {
  const { page } = await params;
  if (!isValidSolutionsPageParam(page, getPublishedSolutionPageCount())) {
    notFound();
  }

  return <SolutionsPage />;
}
