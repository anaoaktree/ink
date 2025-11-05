# Weave

**A modern, TypeScript-native narrative scripting language for interactive fiction and story-driven games.**

---

## What is Weave?

Weave is a narrative scripting language designed to make writing interactive stories, visual novels, and branching dialogue as simple and intuitive as possible.

Unlike other narrative tools, Weave is:

- ✅ **Web-First**: Built in TypeScript, runs natively in browsers
- ✅ **Framework-Agnostic**: Embeddable in React, Vue, Svelte, or vanilla JS
- ✅ **Writer-Friendly**: Clean, readable syntax inspired by Ink
- ✅ **Multimedia-Ready**: First-class support for images, audio, and video (coming soon)
- ✅ **Validation-Powered**: Static analysis catches narrative bugs before runtime (coming soon)

## Quick Example

```weave
=== start ===

You wake up in a mysterious room.

* [Look around] -> examine_room
* [Try the door] -> door

=== examine_room ===

The room is small and dimly lit. There's a desk with a note on it.

* [Read the note] -> read_note
* [Try the door] -> door

=== read_note ===

The note says: "The key is under the mat."

-> examine_room

=== door ===

The door is locked. You need a key.

-> END
```

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/weave.git
cd weave

# Install dependencies
npm install

# Build all packages
npm run build
```

## Quick Start

### 1. Write Your Story

Create a file `story.weave`:

```weave
=== start ===
Welcome to your first Weave story!

* [Continue] -> next

=== next ===
This is the second part.

-> END
```

### 2. Compile It

```bash
npx weave compile story.weave
```

This creates `story.weave.json` - a portable, executable version of your story.

### 3. Run It

```bash
npx weave play story.weave
```

### 4. Embed It in Your Game

```typescript
import { Story } from '@weave-lang/runtime'
import storyData from './story.weave.json'

const story = new Story(storyData)

story.on('text', (data) => {
  console.log(data.content)
})

story.on('choices', (choices) => {
  choices.forEach((choice, i) => {
    console.log(`${i + 1}. ${choice.text}`)
  })
})

story.continue() // Start the story
```

## Features

### ✅ Currently Available (MVP v0.1)

- **Sections**: Organize your story into named sections (`=== section_name ===`)
- **Choices**: Present branching options to players (`* [Choice text] -> destination`)
- **Diverts**: Jump between sections (`-> section_name`)
- **Text Content**: Rich narrative text with automatic formatting
- **Comments**: Document your story (`// comment`)
- **Compiler**: Convert `.weave` files to executable JSON
- **Runtime**: Execute stories in any JavaScript environment
- **CLI**: Command-line tools for compilation and testing

### 🚧 Coming Soon (Sprint 2)

- **Variables**: Track state (`var health = 100`)
- **Conditionals**: Branching logic (`if health < 50`)
- **Functions**: Reusable story fragments
- **Type System**: Optional TypeScript-style types

### 🔮 Future (Sprint 3+)

- **Multimedia**: `@image`, `@audio`, `@video`, `@scene` directives
- **Static Analysis**: Loop detection, dead end warnings, unreachable content
- **VS Code Extension**: Syntax highlighting, autocomplete, live preview
- **React/Vue Integration**: Pre-built components and hooks

## Documentation

- **[Getting Started](docs/getting-started.md)** - Complete beginner's guide
- **[Syntax Reference](docs/syntax.md)** - Full language specification
- **[API Documentation](docs/api.md)** - Runtime and compiler APIs
- **[Examples](examples/)** - Sample games and stories

## Why Weave vs. Other Tools?

| Feature | Weave | Ink | Twine | Narrat |
|---------|-------|-----|-------|--------|
| **TypeScript Native** | ✅ | ❌ (C#) | ❌ | ✅ |
| **Framework Agnostic** | ✅ | ✅ | ⚠️ | ❌ (Vue) |
| **Code-Based** | ✅ | ✅ | ❌ (Visual) | ✅ |
| **Multimedia Support** | 🚧 | ❌ | ⚠️ | ✅ |
| **Static Analysis** | 🚧 | ⚠️ | ❌ | ❌ |
| **Web-Optimized** | ✅ | ⚠️ | ✅ | ✅ |

## Project Structure

```
weave/
├── packages/
│   ├── compiler/       # Weave → JSON compiler
│   ├── runtime/        # Story execution engine
│   └── cli/            # Command-line tools
├── examples/           # Example stories
├── docs/               # Documentation
└── README.md           # This file
```

## Architecture

Weave follows a clean separation of concerns:

1. **Compiler** (`@weave-lang/compiler`)
   - Parses `.weave` source files
   - Generates Abstract Syntax Tree (AST)
   - Compiles to portable JSON format
   - Validates syntax and references

2. **Runtime** (`@weave-lang/runtime`)
   - Loads compiled JSON stories
   - Manages state (variables, visit counts)
   - Executes instructions
   - Emits events for game integration

3. **CLI** (`@weave-lang/cli`)
   - `weave compile` - Compile stories
   - `weave play` - Interactive player
   - `weave validate` - Static analysis (coming soon)

## Development Roadmap

### Sprint 1: Core Language ✅ (COMPLETE)
- Basic parser and compiler
- Runtime engine
- CLI tools
- Example stories
- Documentation

### Sprint 2: Variables & Logic (Next)
- Variable declarations
- Conditional logic (if/else)
- Expressions and operators
- Functions with parameters

### Sprint 3: Multimedia & Polish
- @image, @audio, @video primitives
- Character/scene management
- Static analysis
- Better error messages

### Sprint 4: Tooling
- VS Code extension
- LSP server
- Story visualizer
- npm packages

## Contributing

This project is currently in early development. Contributions, feedback, and bug reports are welcome!

See [CLAUDE.md](../CLAUDE.md) for development philosophy and roadmap.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

**Lead Developer**: Claude (AI)
**Project Sponsor**: [Your Name]

## Acknowledgments

Weave is inspired by:
- **Ink** by Inkle Studios - for pioneering clean narrative syntax
- **Narrat** - for modern web-first approach
- **Twine** - for making interactive fiction accessible
- **TypeScript** - for type-safe development

---

**Status**: MVP v0.1 - Core language complete, variables and logic coming next

**Last Updated**: 2025-11-05
