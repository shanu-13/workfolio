import { Fragment, type ReactNode } from "react";

// Renders *italic accent*, **bold** and `code` inside plain strings.
export function rich(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

// Splits text into words, keeping *accent* runs flagged so they can be animated word by word.
export function words(text: string): { word: string; em: boolean }[] {
  const out: { word: string; em: boolean }[] = [];
  text.split(/(\*[^*]+\*)/g).forEach(part => {
    const em = part.startsWith("*");
    const clean = em ? part.slice(1, -1) : part;
    clean.split(" ").filter(Boolean).forEach(word => out.push({ word, em }));
  });
  return out;
}
