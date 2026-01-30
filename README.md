# Maidy

A fast CLI tool built with Bun to render Mermaid diagrams to SVG or ASCII using [beautiful-mermaid](https://github.com/lukilabs/beautiful-mermaid).

## Installation

```bash
bun install
```

## Usage

### Basic Examples

Render a Mermaid file to SVG:
```bash
bun run index.ts -i diagram.mmd -o output.svg
```

Render to ASCII (for terminal display):
```bash
bun run index.ts -i diagram.mmd -f ascii
```

Use stdin/stdout:
```bash
cat diagram.mmd | bun run index.ts -f svg > output.svg
```

### Options

- `-i, --input <file>`: Input file containing Mermaid code (default: stdin)
- `-o, --output <file>`: Output file (default: stdout)
- `-f, --format <format>`: Output format: `svg` or `ascii` (default: svg)
- `-t, --theme <theme>`: Theme name (default: github-dark)
- `-l, --list-themes`: List available themes
- `-h, --help`: Show help message

### Themes

List all available themes:
```bash
bun run index.ts --list-themes
```

Use a specific theme:
```bash
bun run index.ts -i diagram.mmd -o output.svg -t monokai
```

## Example Mermaid Diagram

Create a file `example.mmd`:
```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> A
```

Render it:
```bash
bun run index.ts -i example.mmd -o example.svg
```

## Making it Globally Available

To use the CLI globally, you can link it:
```bash
bun link
```

Then use it anywhere:
```bash
maidy -i diagram.mmd -o output.svg
```

## License

MIT
# maidy
