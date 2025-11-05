# Proposed GitHub Issues for New Narrative Language Project

These are the issues I would create to structure the work. You can copy/paste these into GitHub.

---

## Phase 1: Foundation & Design

### Issue #1: Design Language Syntax and Core Primitives
**Label**: `design`, `phase-1`

**Description**:
Define the core syntax for the new narrative scripting language.

**Requirements**:
- [ ] Basic content (text, paragraphs)
- [ ] Choices syntax
- [ ] Flow control (sections, diverts)
- [ ] Variables (declaration, assignment)
- [ ] Conditional logic
- [ ] Functions/subroutines
- [ ] Comments
- [ ] Multimedia primitives (@audio, @image, @video)

**Deliverable**: Updated `SYNTAX_SPEC.md` with complete examples

**Questions to Resolve**:
- Terse (like Ink) vs. Explicit syntax?
- Optional types or required?
- Compatibility with Ink?

---

### Issue #2: Choose Project Name and Set Up Repository Structure
**Label**: `meta`, `phase-1`

**Description**:
Decide on a name and set up the monorepo structure.

**Tasks**:
- [ ] Brainstorm names (check npm/domain availability)
- [ ] Set up pnpm workspace or yarn workspaces
- [ ] Create packages:
  - `@[name]/compiler`
  - `@[name]/runtime`
  - `@[name]/cli`
  - `@[name]/tools`
- [ ] Configure TypeScript
- [ ] Set up testing (Vitest or Jest)
- [ ] Configure linting (ESLint, Prettier)

**Candidate Names**:
- Narrative
- Narrate
- Scribe
- Chronicle
- Tale
- Weave

---

### Issue #3: Build Proof-of-Concept Parser
**Label**: `compiler`, `phase-1`, `poc`

**Description**:
Build a minimal parser that can handle basic narrative flow.

**Scope**:
- Text content
- Simple choices (`* [Choice] -> destination`)
- Sections (`=== section_name ===`)
- Diverts (`-> section_name`)
- Comments

**Out of Scope** (for now):
- Variables
- Conditionals
- Functions
- Multimedia

**Deliverable**:
- Working parser in `packages/compiler/src/parser.ts`
- Tests for basic syntax
- Can parse simple "choose your own adventure" story

**Example Input**:
```
=== start ===
You wake up in a dark room.

* [Turn on light] -> light_on
* [Stay in darkness] -> darkness

=== light_on ===
The room is empty.
-> end

=== darkness ===
You hear a noise.
-> end

=== end ===
THE END
```

---

### Issue #4: Design AST (Abstract Syntax Tree) Structure
**Label**: `compiler`, `phase-1`, `design`

**Description**:
Define the TypeScript types for the Abstract Syntax Tree.

**Requirements**:
- TypeScript interfaces for all node types
- Type-safe AST traversal
- Easy to serialize/deserialize
- Extensible for future features

**Example Nodes**:
```typescript
type Node =
  | TextNode
  | ChoiceNode
  | SectionNode
  | DivertNode
  | VariableNode
  | ConditionalNode
  | FunctionNode
  | AudioNode
  | ImageNode

interface TextNode {
  type: 'text'
  content: string
  tags?: string[]
}

interface ChoiceNode {
  type: 'choice'
  text: string
  condition?: Expression
  target: string
}

// ... etc
```

**Deliverable**: `packages/compiler/src/ast.ts`

---

### Issue #5: Build Minimal Runtime Engine
**Label**: `runtime`, `phase-1`, `poc`

**Description**:
Create a runtime that can execute the compiled story.

**Features**:
- Load compiled JSON
- Execute story flow
- Handle choices
- Track visited sections
- Emit events for game integration

**API Design**:
```typescript
const story = new Story(compiledJson)

story.on('text', (text) => {
  console.log(text)
})

story.on('choice', (choices) => {
  // Present choices to player
})

story.choose(0) // Select first choice
story.continue() // Continue story
```

**Deliverable**:
- `packages/runtime/src/index.ts`
- Tests for basic flow
- Example usage in `examples/basic/`

---

## Phase 2: Core Features

### Issue #6: Implement Variable System
**Label**: `compiler`, `runtime`, `phase-2`

**Description**:
Add support for variables with optional typing.

**Syntax**:
```
var health = 100
var name: string = "Alice"
var inventory: string[] = []

~ health -= 10
~ inventory.push("sword")
```

**Tasks**:
- [ ] Parser support for var declarations
- [ ] Parser support for assignments (`~`)
- [ ] AST nodes for variables
- [ ] Runtime variable state
- [ ] Type checking (optional)
- [ ] Tests

---

### Issue #7: Implement Conditional Logic
**Label**: `compiler`, `runtime`, `phase-2`

**Description**:
Add if/else conditionals.

**Syntax**:
```
{health < 50}
  You're feeling weak.
{else if health < 100}
  You're slightly injured.
{else}
  You're in perfect health.
{/}
```

**Tasks**:
- [ ] Parser support for conditional blocks
- [ ] Expression evaluator
- [ ] AST nodes for conditionals
- [ ] Runtime evaluation
- [ ] Nested conditionals
- [ ] Tests

---

### Issue #8: Implement Function System
**Label**: `compiler`, `runtime`, `phase-2`

**Description**:
Add reusable functions/sections with parameters.

**Syntax**:
```
=== greet(name: string, mood: string) ===
Hello, {name}! You seem {mood} today.
===

-> greet("Alice", "happy")
```

**Tasks**:
- [ ] Parser support for function definitions
- [ ] Parser support for function calls
- [ ] Parameter passing
- [ ] Return values
- [ ] Runtime call stack
- [ ] Tests

---

### Issue #9: Add First-Class Multimedia Support
**Label**: `compiler`, `runtime`, `phase-2`

**Description**:
Implement @audio, @image, @video primitives.

**Syntax**:
```
@audio play="music.mp3" loop=true volume=0.5
@image show="scene.jpg" duration=2s fade=true
@video play="cutscene.mp4" onEnd=continue
```

**Tasks**:
- [ ] Parser support for @ directives
- [ ] AST nodes for media
- [ ] Runtime event emission
- [ ] Asset preloading API
- [ ] Integration examples
- [ ] Tests

---

## Phase 3: Killer Features

### Issue #10: Implement Static Analysis - Loop Detection
**Label**: `tools`, `phase-3`, `killer-feature`

**Description**:
Build static analysis to detect infinite loops in story flow.

**Detection Cases**:
- Infinite loops (no choices, always diverts back)
- Finite loops (loops with exit conditions)
- Warn on deep recursion

**Example Warning**:
```
Warning: Potential infinite loop detected
  at section 'dungeon_room'
  -> dungeon_hallway -> dungeon_room (cycle)
```

**Tasks**:
- [ ] Build control flow graph
- [ ] Cycle detection algorithm
- [ ] Reachability analysis
- [ ] Report generation
- [ ] Tests

---

### Issue #11: Implement Static Analysis - Dead End Detection
**Label**: `tools`, `phase-3`, `killer-feature`

**Description**:
Detect story sections that have no choices and don't end properly.

**Example Error**:
```
Error: Dead end detected
  at section 'forgotten_room'
  No choices available and no END or divert
```

**Tasks**:
- [ ] Analyze all code paths
- [ ] Detect sections with no exits
- [ ] Distinguish intentional endings from bugs
- [ ] Report generation
- [ ] Tests

---

### Issue #12: Implement Static Analysis - Unreachable Content
**Label**: `tools`, `phase-3`, `killer-feature`

**Description**:
Detect story sections that can never be reached.

**Example Warning**:
```
Warning: Unreachable content
  section 'secret_ending' has no incoming diverts
  Did you forget to add a choice leading here?
```

**Tasks**:
- [ ] Build reverse dependency graph
- [ ] Find orphaned sections
- [ ] Report generation
- [ ] Tests

---

### Issue #13: Build VS Code Extension
**Label**: `tooling`, `phase-3`, `killer-feature`

**Description**:
Create a VS Code extension with syntax highlighting and basic LSP features.

**Features**:
- [ ] Syntax highlighting
- [ ] Bracket matching
- [ ] Comment toggling
- [ ] Code folding
- [ ] Snippets
- [ ] LSP integration (next issue)

**Deliverable**: Published to VS Code marketplace

---

### Issue #14: Build LSP Server
**Label**: `tooling`, `phase-3`, `killer-feature`

**Description**:
Implement Language Server Protocol for advanced IDE features.

**Features**:
- [ ] Diagnostics (errors, warnings)
- [ ] Autocomplete (variable names, section names)
- [ ] Go to definition
- [ ] Find references
- [ ] Hover information
- [ ] Rename refactoring

**Tech Stack**: Use `vscode-languageserver-node`

---

### Issue #15: Build Story Visualization Tool
**Label**: `tools`, `phase-3`, `killer-feature`

**Description**:
Generate visual flow graph of story structure.

**Output Formats**:
- [ ] Mermaid diagram
- [ ] Graphviz DOT
- [ ] Interactive HTML (D3.js or Cytoscape)

**Example**:
```bash
npx @[name]/cli visualize story.nrt --output graph.html
```

**Features**:
- Node coloring (visited/unvisited, dead ends)
- Edge labels (choice text)
- Zoom/pan
- Path highlighting

---

## Phase 4: Polish & Ecosystem

### Issue #16: Build React Integration
**Label**: `integration`, `phase-4`

**Description**:
Create React hooks and components for easy integration.

**API**:
```typescript
import { useStory, Story } from '@[name]/react'

function GameComponent() {
  const { text, choices, choose, continue } = useStory(storyData)

  return (
    <div>
      <p>{text}</p>
      {choices.map((choice, i) => (
        <button onClick={() => choose(i)}>{choice.text}</button>
      ))}
    </div>
  )
}
```

---

### Issue #17: Build Vue Integration
**Label**: `integration`, `phase-4`

**Description**:
Create Vue composables for easy integration.

**API**:
```typescript
import { useStory } from '@[name]/vue'

const { text, choices, choose } = useStory(storyData)
```

---

### Issue #18: Write Comprehensive Documentation
**Label**: `docs`, `phase-4`

**Description**:
Create full documentation site.

**Sections**:
- [ ] Getting Started
- [ ] Language Reference
- [ ] API Documentation
- [ ] Integration Guides (React, Vue, vanilla)
- [ ] Best Practices
- [ ] Migration from Ink
- [ ] Examples Gallery

**Tech**: VitePress or Docusaurus

---

### Issue #19: Create Example Games
**Label**: `examples`, `phase-4`

**Description**:
Build 5-10 example games showing different features.

**Examples**:
- [ ] Simple CYOA (choices only)
- [ ] Branching dialogue (characters, portraits)
- [ ] RPG-lite (stats, inventory, combat)
- [ ] Visual novel (backgrounds, music, character sprites)
- [ ] Mystery game (state tracking, evidence)

---

### Issue #20: Set Up CI/CD Pipeline
**Label**: `meta`, `phase-4`

**Description**:
Automate testing, building, and publishing.

**Tasks**:
- [ ] GitHub Actions workflow
- [ ] Run tests on PR
- [ ] Build packages
- [ ] Publish to npm (on release)
- [ ] Deploy docs (on push to main)
- [ ] Type checking
- [ ] Linting

---

## Future Ideas (Backlog)

### Issue #21: Ink Import/Migration Tool
**Label**: `tools`, `future`

Parse .ink files and convert to new format for easy migration.

---

### Issue #22: AI-Assisted Writing Tools
**Label**: `tools`, `future`, `experimental`

- Narrative consistency checker
- Character voice analysis
- Plot hole detection
- Pacing suggestions

---

### Issue #23: Localization System
**Label**: `feature`, `future`

Built-in i18n support for multi-language stories.

---

### Issue #24: Multiplayer/Branching Support
**Label**: `feature`, `future`

Multiple concurrent flows for different players.

---

### Issue #25: Story Testing Framework
**Label**: `tools`, `future`

Write tests for story paths:
```
test('player can find secret ending', () => {
  const story = loadStory('game.nrt')
  story.choose('explore_garden')
  story.choose('examine_statue')
  expect(story.currentSection).toBe('secret_ending')
})
```

---

## Priority Order

**Week 1-2**: Issues #1, #2, #3, #4
**Week 3-4**: Issues #5, #6, #7
**Week 5-6**: Issues #8, #9
**Week 7-8**: Issues #10, #11, #12
**Week 9-10**: Issues #13, #14, #15
**Week 11-12**: Issues #16, #17, #18, #19, #20

---

**Total estimated time**: 12 weeks for MVP + killer features + ecosystem

After this, ongoing maintenance and community building.
