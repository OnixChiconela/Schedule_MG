// src/components/markdownComponents.tsx
import { Components } from "react-markdown";

interface MarkdownComponentsProps {
  theme: string;
}

export const getMarkdownComponents = ({ theme }: MarkdownComponentsProps): Components => ({
  h1: ({ children }) => (
    <h1 className={`text-xl font-bold mb-3 ${theme === "light" ? "text-neutral-800" : "text-neutral-200"}`}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className={`text-lg font-semibold mb-2 ${theme === "light" ? "text-neutral-800" : "text-neutral-200"}`}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className={`text-base font-medium mb-2 ${theme === "light" ? "text-neutral-800" : "text-neutral-200"}`}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className={`text-sm mb-2 ${theme === "light" ? "text-neutral-800" : "text-neutral-200"}`}>
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className={`list-disc list-inside mb-2 ${theme === "light" ? "text-neutral-800" : "text-neutral-200"}`}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className={`list-decimal list-inside mb-2 ${theme === "light" ? "text-neutral-800" : "text-neutral-200"}`}>
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="text-sm">{children}</li>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children }) => (
    <code className={`bg-gray-200 dark:bg-slate-700 px-1 py-0.5 rounded ${theme === "light" ? "text-neutral-800" : "text-neutral-200"}`}>
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className={`border-l-4 border-gray-300 pl-4 italic mb-2 ${theme === "light" ? "text-neutral-800" : "text-neutral-200"}`}>
      {children}
    </blockquote>
  ),
});