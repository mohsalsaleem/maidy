#!/usr/bin/env bun

import { renderMermaid, renderMermaidAscii, THEMES } from 'beautiful-mermaid';
import { parseArgs } from 'util';
import { markdownToHtml } from './markdown-to-html';

interface CliOptions {
  input?: string;
  output?: string;
  format: 'svg' | 'ascii' | 'html';
  markdown: boolean;
  theme?: string;
  help: boolean;
}

function printHelp() {
  console.log(`
Maidy - Render Mermaid diagrams to SVG, ASCII, or convert Markdown to HTML

Usage:
  maidy [options]

Options:
  -i, --input <file>     Input file containing Mermaid code or Markdown (default: stdin)
  -o, --output <file>    Output file (default: stdout)
  -f, --format <format>  Output format: svg, ascii, or html (default: svg)
  -m, --markdown         Markdown mode: convert markdown with mermaid blocks to HTML
  -t, --theme <theme>    Theme name (default: github-dark)
  -l, --list-themes      List available themes
  -h, --help             Show this help message

Examples:
  # Render Mermaid diagram to SVG
  maidy -i diagram.mmd -o output.svg
  cat diagram.mmd | maidy -f ascii
  maidy -i diagram.mmd -f svg -t monokai

  # Convert Markdown with Mermaid diagrams to HTML
  maidy -i document.md -m -o output.html
  maidy -i document.md -m -f html -t dracula > output.html
  cat document.md | maidy -m > output.html

  # List available themes
  maidy --list-themes
`);
}

function listThemes() {
  console.log('Available themes:');
  Object.keys(THEMES).forEach(theme => {
    console.log(`  - ${theme}`);
  });
}

async function readInput(inputFile?: string): Promise<string> {
  if (inputFile) {
    return await Bun.file(inputFile).text();
  }

  // Read from stdin
  const decoder = new TextDecoder();
  const chunks: Uint8Array[] = [];

  for await (const chunk of Bun.stdin.stream()) {
    chunks.push(chunk);
  }

  const combined = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  return decoder.decode(combined);
}

async function writeOutput(content: string, outputFile?: string): Promise<void> {
  if (outputFile) {
    await Bun.write(outputFile, content);
    console.error(`Output written to: ${outputFile}`);
  } else {
    console.log(content);
  }
}

async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      input: { type: 'string', short: 'i' },
      output: { type: 'string', short: 'o' },
      format: { type: 'string', short: 'f', default: 'svg' },
      markdown: { type: 'boolean', short: 'm', default: false },
      theme: { type: 'string', short: 't', default: 'github-dark' },
      'list-themes': { type: 'boolean', short: 'l', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
    strict: true,
    allowPositionals: false,
  });

  const options = values as unknown as CliOptions;

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  if (options['list-themes' as keyof CliOptions]) {
    listThemes();
    process.exit(0);
  }

  // Validate format
  const validFormats = ['svg', 'ascii', 'html'];
  if (!validFormats.includes(options.format)) {
    console.error(`Error: Invalid format "${options.format}". Use: ${validFormats.join(', ')}`);
    process.exit(1);
  }

  // Validate format compatibility with modes
  if (!options.markdown && options.format === 'html') {
    console.error('Error: HTML format requires markdown mode (-m flag).');
    process.exit(1);
  }

  if (options.markdown && options.format === 'ascii') {
    console.error('Error: Markdown mode does not support ASCII format.');
    process.exit(1);
  }

  try {
    const input = await readInput(options.input);

    if (!input.trim()) {
      console.error('Error: No input provided');
      process.exit(1);
    }

    let output: string;

    if (options.markdown) {
      // Markdown mode - convert to HTML
      const theme = THEMES[options.theme as keyof typeof THEMES];
      if (!theme && options.theme !== 'default') {
        console.error(`Warning: Theme "${options.theme}" not found, using default`);
      }
      output = await markdownToHtml(input, theme || undefined);
    } else {
      // Direct Mermaid rendering mode
      if (options.format === 'svg') {
        const theme = THEMES[options.theme as keyof typeof THEMES];
        if (!theme && options.theme !== 'default') {
          console.error(`Warning: Theme "${options.theme}" not found, using default`);
        }
        output = await renderMermaid(input, theme || undefined);
      } else {
        output = renderMermaidAscii(input);
      }
    }

    await writeOutput(output, options.output);
  } catch (error) {
    console.error('Error rendering diagram:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
