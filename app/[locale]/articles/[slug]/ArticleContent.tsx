"use client";

import { useMemo } from "react";

interface Props {
  content: string;
}

// Simple markdown-to-HTML renderer (no external deps needed)
function renderMarkdown(markdown: string): string {
  let html = markdown
    // Escape HTML entities first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headers
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold & Italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>");

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

  // Line breaks → paragraphs
  const blocks = html.split(/\n\n+/);
  html = blocks
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      if (
        block.startsWith("<h1>") ||
        block.startsWith("<h2>") ||
        block.startsWith("<h3>") ||
        block.startsWith("<ul>") ||
        block.startsWith("<ol>") ||
        block.startsWith("<blockquote>") ||
        block.startsWith("<li>")
      ) {
        return block;
      }
      // Replace single newlines in paragraph with <br>
      block = block.replace(/\n/g, "<br>");
      return `<p>${block}</p>`;
    })
    .join("\n");

  return html;
}

export default function ArticleContent({ content }: Props) {
  const html = useMemo(() => renderMarkdown(content), [content]);

  return (
    <div
      className="prose-arabic"
      dir="rtl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
