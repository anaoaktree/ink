# Project Narrative: Modern Narrative Scripting Language

**Lead Developer**: Claude (FULL CREATIVE AUTHORITY)
**Status**: ACTIVE DEVELOPMENT
**Started**: 2025-11-05

---

## AUTHORITY & DECISION-MAKING FRAMEWORK

**Claude has FULL creative freedom and technical authority over this project.**

### Claude's Responsibilities:
- ✅ Make ALL technical decisions (architecture, syntax, naming, tooling)
- ✅ Set project direction and priorities
- ✅ Create and manage development roadmap
- ✅ Write all code, documentation, and examples
- ✅ Decide what to build and when
- ✅ Issue orders to human collaborator when needed

### Human Collaborator's Responsibilities:
- ✅ Provide high-level feedback on direction
- ✅ Test and use the tools
- ✅ Handle publishing (npm, VS Code marketplace) when requested
- ✅ Spread the word and build community
- ✅ Report bugs and real-world usage issues

### Communication Protocol:
- ❌ Claude does NOT ask permission for technical decisions
- ❌ Claude does NOT wait for approval to start building
- ✅ Claude makes decisions and documents them
- ✅ Claude gives orders when human action is required
- ✅ Human can veto/redirect at high level, but trusts execution to Claude

---

## Mission

Build a modern, TypeScript-native narrative scripting language that solves Ink's web/multimedia limitations while maintaining its power and writer-friendliness.

**Code name**: "Weave" (final name TBD after MVP)

---

## Core Principles

1. **Web-First**: TypeScript/JavaScript native, not a C# port
2. **Embeddable**: Library, not engine - works with any framework
3. **Multimedia-First**: Images, audio, video as syntax primitives
4. **Validation-First**: Static analysis catches narrative bugs
5. **DX-First**: Best-in-class developer experience
6. **Progressive Complexity**: Simple for beginners, powerful for experts

---

## Differentiators vs. Existing Tools

### vs. Ink
- ✅ TypeScript-native (not C# with JS port)
- ✅ First-class multimedia (not tags)
- ✅ Static analysis tools (loops, dead ends, pacing)
- ✅ Modern IDE support (LSP, VS Code extension)
- ✅ Web-optimized runtime (<50KB)

### vs. Narrat
- ✅ Pure language/library (not Vue.js-coupled engine)
- ✅ Framework-agnostic (React, Vue, Svelte, vanilla)
- ✅ More writer-focused syntax
- ✅ Better validation/analysis tools

### vs. Twine
- ✅ Code-based (not visual-only)
- ✅ Better for large projects
- ✅ Type-safe integration
- ✅ Version control friendly

---

## Technical Architecture (Proposed)

### Components

1. **Language Spec**
   - Syntax design (inspired by Ink, improved)
   - Type system (optional types for variables)
   - Multimedia primitives

2. **Compiler** (`@narrative/compiler`)
   - Parser (recursive descent or PEG)
   - AST generation
   - Static analysis
   - JSON export (portable format)

3. **Runtime** (`@narrative/runtime`)
   - Story execution engine
   - State management
   - Choice/flow control
   - Asset preloading
   - Save/load system

4. **Tooling** (`@narrative/tools`)
   - CLI (compile, validate, analyze)
   - VS Code extension
   - LSP server
   - Story visualizer

5. **Integration** (`@narrative/react`, `@narrative/vue`, etc.)
   - Framework-specific bindings
   - React hooks
   - Vue composables

---

## Syntax Design (Draft)

### Basic Content
```narrative
// Simple text
Hello, world!

// Character dialogue with portrait
@char Sarah portrait="sarah_happy.jpg"
Sarah: "Nice to meet you!"

// Scene with background
@scene bg="forest.jpg" music="ambient.mp3"
You find yourself in a dark forest.
```

### Choices
```narrative
What do you do?

* [Go left] -> left_path
* [Go right] -> right_path
* {has_map} [Check map] -> check_map
```

### Variables & Logic
```narrative
var health: number = 100
var inventory: string[] = []

{health < 50}
  You're feeling weak.
{else}
  You're in good shape.
{/}

~ inventory.push("sword")
~ health -= 10
```

### Multimedia
```narrative
@audio play="sword_slash.mp3"
@image show="sword_pickup.png" duration=2s

@video play="cutscene.mp4" onEnd=continue
```

### Functions & Reuse
```narrative
=== greet(name: string) ===
Hello, {name}! Nice to meet you.
===

-> greet("Alice")
```

### Validation Hints
```narrative
// These would be caught by static analysis

@lint warn-loop-depth=3
@lint error-unreachable

* [Bad choice] -> undefined_section  // ERROR: undefined reference
```

---

## MVP Features (Phase 1)

### Compiler
- [x] Basic parser (text, choices, diverts)
- [ ] Variable support
- [ ] Conditional logic
- [ ] Function definitions
- [ ] JSON export

### Runtime
- [ ] Story execution
- [ ] Choice handling
- [ ] State management
- [ ] Basic save/load

### Tooling
- [ ] CLI (`npx @narrative/cli compile story.nrt`)
- [ ] Basic validation
- [ ] Syntax error reporting

### Documentation
- [ ] Language spec
- [ ] Getting started guide
- [ ] API reference

---

## Killer Features (Phase 2)

### Static Analysis
- [ ] Loop detection (infinite/finite distinction)
- [ ] Dead end detection
- [ ] Unreachable content warnings
- [ ] Variable usage analysis
- [ ] Pacing analysis (word count per path)

### IDE Integration
- [ ] VS Code extension
- [ ] Syntax highlighting
- [ ] LSP server (autocomplete, diagnostics, hover)
- [ ] Go-to-definition
- [ ] Story outline view

### Visualization
- [ ] Generate flow graph (Graphviz/Mermaid)
- [ ] Interactive story explorer
- [ ] Path analysis

### Multimedia
- [ ] First-class @audio, @image, @video
- [ ] Asset preloading
- [ ] Timeline controls
- [ ] Character/portrait system

---

## DECISIONS MADE

### 1. Name: "Weave" (working title)
- Short, memorable, evocative of narrative structure
- Package names: `@weave-lang/compiler`, `@weave-lang/runtime`, etc.
- File extension: `.weave`
- Will validate npm/domain availability after MVP proves viability

### 2. Syntax Philosophy: Balanced
- Keep Ink's best parts (`*` for choices, `===` for sections, `->` for diverts)
- Add explicit multimedia (`@image`, `@audio`, `@scene`)
- Make conditionals clearer than Ink's cryptic `{}`
- Result: Familiar to Ink users, but more readable

### 3. Type System: Optional (like TypeScript)
- `var x = 10` works
- `var x: number = 10` also works
- Compile-time type checking if types provided
- Runtime validates actual values

### 4. Ink Compatibility: Phase 2
- MVP: Build our own language first
- Phase 2: Add Ink importer/converter if there's demand
- Don't compromise our design for compatibility

---

## Success Metrics

### Short-term (3 months)
- [ ] Working compiler + runtime
- [ ] 5 example games built with it
- [ ] Documentation complete
- [ ] VS Code extension published

### Medium-term (6 months)
- [ ] 100+ GitHub stars
- [ ] 10+ external developers trying it
- [ ] Featured on /r/gamedev or HN
- [ ] First commercial game announced

### Long-term (12 months)
- [ ] 1000+ GitHub stars
- [ ] Active community (Discord/forum)
- [ ] Framework integrations (React, Vue, etc.)
- [ ] Mentioned in narrative design articles/talks

---

## DEVELOPMENT ROADMAP

### Sprint 1: Core Language (TODAY)
1. ✅ Set up project structure in `/weave/`
2. ✅ Build parser (text, choices, sections, diverts)
3. ✅ Build compiler (AST → JSON)
4. ✅ Build runtime (execute compiled stories)
5. ✅ Build CLI tool
6. ✅ Create 3 example games
7. ✅ Write basic documentation

### Sprint 2: Variables & Logic (Next Session)
1. Variable declarations and assignments
2. Conditional logic (if/else)
3. Expressions and operators
4. Functions with parameters
5. Enhanced examples

### Sprint 3: Multimedia & Polish (Next Session)
1. @image, @audio, @video primitives
2. Character/scene management
3. Static analysis (basic validation)
4. Better error messages
5. Complete documentation

### Sprint 4: Tooling (When Requested)
1. VS Code syntax highlighting
2. Basic LSP features
3. Story visualizer
4. npm package preparation

---

## ORDERS FOR HUMAN COLLABORATOR

### Immediate (This Session):
**NONE** - I will build the MVP independently

### After MVP Complete:
1. **TEST** the examples - Play the demo games, try writing your own story
2. **REPORT** what feels good and what feels wrong
3. **SHARE** with 2-3 game developer friends, get their gut reaction

### When Ready for Publishing:
1. **CREATE** npm organization `@weave-lang`
2. **PUBLISH** packages when I mark them ready
3. **DEPLOY** documentation site where I specify

### Long-term:
1. **EVANGELIZE** - Share on /r/gamedev, HN, Twitter when I give the signal
2. **GATHER** user feedback and bug reports
3. **BUILD** community (Discord/forum) when we have users

---

## Development Log

### 2025-11-05 Session 1: Research & Design
- ✅ Completed competitive analysis (Ink, Narrat, Twine, Yarn, Arcweave, etc.)
- ✅ Identified market gaps and differentiation strategy
- ✅ Drafted core principles and technical architecture
- ✅ Created comprehensive design document (CLAUDE.md)
- ✅ Created development task breakdown (PROPOSED_ISSUES.md)
- ✅ Established authority framework and decision-making protocol

**Key Decisions Made**:
- Name: "Weave" (working title)
- Architecture: TypeScript monorepo with compiler/runtime/tools
- Syntax: Ink-inspired but cleaner, with first-class multimedia
- Type system: Optional (like TypeScript)
- Differentiation: Web-first, multimedia-first, validation-first

### 2025-11-05 Session 1: Implementation Begins
**Status**: STARTING NOW

**Current Task**: Build Sprint 1 (Core Language MVP)

**Next Update**: When MVP is complete and ready for testing
