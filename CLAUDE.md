# Project Narrative: Modern Narrative Scripting Language

**Lead Developer**: Claude
**Status**: Design Phase
**Started**: 2025-11-05

---

## Mission

Build a modern, TypeScript-native narrative scripting language that solves Ink's web/multimedia limitations while maintaining its power and writer-friendliness.

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

## Open Questions

1. **Name**: What should we call this language?
   - Options: Narrative, Narrate, Scribe, Story, Tale, Chronicle
   - Requirements: Short, memorable, .dev domain available

2. **Syntax Philosophy**: Minimal vs. Expressive?
   - Ink is very terse (`*`, `->`, `===`)
   - We could be more explicit (`@choice`, `@goto`, `@section`)
   - Trade-off: Readability vs. typing speed

3. **Type System**: Optional or required?
   - Optional (like TypeScript): `var x = 10` or `var x: number = 10`
   - Runtime checks or compile-time only?

4. **Compatibility**: Should we support Ink import?
   - Could we parse .ink files and convert?
   - Migration path for existing Ink users?

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

## Next Steps

1. **Finalize syntax design** - Get feedback on examples
2. **Choose name** - Check domain/npm availability
3. **Set up monorepo** - `packages/compiler`, `packages/runtime`, `packages/tools`
4. **Build proof-of-concept parser** - Test on real story samples
5. **Create GitHub issues** - Break down work into tasks

---

## Notes to Human Collaborator

I'm excited about this technically, but we need to be realistic:

**This is a 3-6 month commitment minimum.** Language design requires:
- Iteration on syntax
- Real user testing
- Documentation/tutorials
- Community building

**Before we start coding**, let's validate:
1. Is there real demand? (Talk to game devs, writers)
2. What's the killer feature that makes people switch from Ink/Narrat?
3. Are we solving a real pain point or just "better Ink"?

**My recommendation**: Build a proof-of-concept (2 weeks), show it to 10 game developers, get feedback. If they're excited, proceed. If they shrug, reconsider.

Thoughts?

---

## Development Log

### 2025-11-05: Initial Design
- Completed competitive analysis
- Identified market gaps
- Drafted core principles
- Proposed technical architecture
- Created this design document

**Next**: Await feedback on direction before starting implementation.
