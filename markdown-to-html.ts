import { marked } from 'marked';
import { renderMermaid } from 'beautiful-mermaid';

interface MermaidBlock {
  code: string;
  placeholder: string;
  svg?: string;
}

/**
 * Extract mermaid code blocks from markdown
 */
export function extractMermaidBlocks(markdown: string): { markdown: string; blocks: MermaidBlock[] } {
  const blocks: MermaidBlock[] = [];
  let counter = 0;

  const processedMarkdown = markdown.replace(/```mermaid\n([\s\S]*?)```/g, (match, code) => {
    const placeholder = `<!--MERMAID_DIAGRAM_${counter}-->`;
    blocks.push({
      code: code.trim(),
      placeholder,
    });
    counter++;
    return placeholder;
  });

  return { markdown: processedMarkdown, blocks };
}

/**
 * Render mermaid blocks to SVG
 */
export async function renderMermaidBlocks(
  blocks: MermaidBlock[],
  theme?: any
): Promise<MermaidBlock[]> {
  const rendered = await Promise.all(
    blocks.map(async (block) => {
      try {
        const svg = await renderMermaid(block.code, theme);
        return { ...block, svg };
      } catch (error) {
        console.error(`Error rendering mermaid block: ${error instanceof Error ? error.message : error}`);
        return { ...block, svg: undefined };
      }
    })
  );

  return rendered;
}

/**
 * Convert markdown to HTML with embedded mermaid diagrams
 */
export async function markdownToHtml(
  markdown: string,
  theme?: any,
  options?: {
    includeStyles?: boolean;
    title?: string;
  }
): Promise<string> {
  const { includeStyles = true, title = 'Document' } = options || {};

  // Extract mermaid blocks
  const { markdown: processedMarkdown, blocks } = extractMermaidBlocks(markdown);

  // Render mermaid blocks to SVG
  const renderedBlocks = await renderMermaidBlocks(blocks, theme);

  // Convert markdown to HTML
  let html = await marked.parse(processedMarkdown);

  // Replace placeholders with actual SVG content
  renderedBlocks.forEach((block, index) => {
    if (block.svg) {
      // Wrap SVG in a div for styling
      const wrappedSvg = `<div class="mermaid-diagram">${block.svg}</div>`;
      html = html.replace(`<!--MERMAID_DIAGRAM_${index}-->`, wrappedSvg);
    } else {
      html = html.replace(
        `<!--MERMAID_DIAGRAM_${index}-->`,
        '<div class="mermaid-error">Error rendering diagram</div>'
      );
    }
  });

  // If includeStyles is true, wrap in a complete HTML document
  if (includeStyles) {
    html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
      color: #24292f;
      background: #ffffff;
    }

    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
      line-height: 1.25;
    }

    h1 {
      font-size: 2em;
      border-bottom: 1px solid #d0d7de;
      padding-bottom: 0.3em;
    }

    h2 {
      font-size: 1.5em;
      border-bottom: 1px solid #d0d7de;
      padding-bottom: 0.3em;
    }

    h3 { font-size: 1.25em; }
    h4 { font-size: 1em; }
    h5 { font-size: 0.875em; }
    h6 { font-size: 0.85em; color: #57606a; }

    p {
      margin-top: 0;
      margin-bottom: 1em;
    }

    a {
      color: #0969da;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    code {
      background: #f6f8fa;
      padding: 0.2em 0.4em;
      border-radius: 6px;
      font-size: 85%;
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
    }

    pre {
      background: #f6f8fa;
      padding: 1em;
      border-radius: 6px;
      overflow-x: auto;
      margin-bottom: 1em;
    }

    pre code {
      background: none;
      padding: 0;
      font-size: 100%;
    }

    blockquote {
      padding: 0 1em;
      color: #57606a;
      border-left: 0.25em solid #d0d7de;
      margin: 0 0 1em 0;
    }

    ul, ol {
      padding-left: 2em;
      margin-bottom: 1em;
    }

    li {
      margin-bottom: 0.25em;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 1em;
    }

    table th,
    table td {
      padding: 6px 13px;
      border: 1px solid #d0d7de;
    }

    table th {
      font-weight: 600;
      background: #f6f8fa;
    }

    table tr:nth-child(even) {
      background: #f6f8fa;
    }

    hr {
      height: 0.25em;
      padding: 0;
      margin: 1.5em 0;
      background-color: #d0d7de;
      border: 0;
    }

    .mermaid-diagram {
      margin: 1.5em 0;
      text-align: center;
      overflow-x: auto;
    }

    .mermaid-diagram svg {
      max-width: 100%;
      height: auto;
    }

    .mermaid-error {
      color: #cf222e;
      background: #ffebe9;
      padding: 1em;
      border-radius: 6px;
      margin: 1em 0;
    }

    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }
    }
  </style>
</head>
<body>
${html}
</body>
</html>`;
  }

  return html;
}
