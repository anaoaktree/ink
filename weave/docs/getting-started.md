# Getting Started with Weave

Welcome to Weave! This guide will teach you everything you need to know to start writing interactive stories.

---

## Installation

### Prerequisites

- Node.js 18+ installed
- A text editor (VS Code recommended)
- Basic familiarity with command line

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/weave.git
cd weave
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

---

## Your First Story

### Step 1: Create a File

Create a new file called `first-story.weave`:

```weave
=== start ===

Welcome to your first Weave story!

This is just plain text. It will be shown to the player.

* [Continue] -> next

=== next ===

Great! You clicked a choice and moved to a new section.

Now let's try another choice:

* [Go to the forest] -> forest
* [Go to the city] -> city

=== forest ===

You enter a dark forest.

Trees tower above you. You hear strange sounds.

* [Turn back] -> next
* [Venture deeper] -> deep_forest

=== city ===

You arrive in a bustling city.

People rush past you. Merchants shout their wares.

-> END

=== deep_forest ===

You venture deeper into the forest...

And get completely lost.

-> END
```

### Step 2: Compile It

```bash
npx weave compile first-story.weave
```

This creates `first-story.weave.json` - the compiled, executable version.

### Step 3: Play It

```bash
npx weave play first-story.weave
```

---

## Understanding the Basics

### Sections

Think of sections like pages in a "choose your own adventure" book.

```weave
=== start ===
This is section 1.

=== next ===
This is section 2.
```

**Rules:**
- Section names start with `===` and end with `===`
- Use descriptive names: `forest_entrance`, not `section2`
- Every story needs a `start` section

### Choices

Choices let the player make decisions:

```weave
* [Choice text] -> destination
```

**Example:**
```weave
What do you do?

* [Open the door] -> opened_door
* [Walk away] -> walked_away
```

### Diverts

Diverts are like page turns - they move the story to a new section:

```weave
-> section_name
```

**Example:**
```weave
=== intro ===
Welcome!

-> main_menu  // Automatically go to main_menu
```

### Comments

Comments are notes for you, the writer. They don't appear in the story:

```weave
// This is a comment

This is actual story text. // Comments can go here too
```

---

## Tutorial: Building a Simple Game

Let's build a short adventure game step by step.

### Part 1: The Setup

```weave
=== start ===

You wake up in a strange room.

// First decision point
* [Look around] -> examine_room
* [Try the door] -> try_door
```

### Part 2: Adding More Sections

```weave
=== examine_room ===

The room is small. There's a bed, a desk, and a locked door.

On the desk, you see a key.

* [Take the key] -> take_key
* [Try the door] -> try_door

=== try_door ===

You try the door. It's locked.

* [Look around the room] -> examine_room
```

### Part 3: Adding an Ending

```weave
=== take_key ===

You pick up the key from the desk.

* [Try the door with the key] -> unlock_door

=== unlock_door ===

The key fits! The door swings open.

You step out into freedom.

-> END
```

### Complete Story

```weave
=== start ===
You wake up in a strange room.

* [Look around] -> examine_room
* [Try the door] -> try_door

=== examine_room ===
The room is small. There's a bed, a desk, and a locked door.
On the desk, you see a key.

* [Take the key] -> take_key
* [Try the door] -> try_door

=== try_door ===
You try the door. It's locked.

* [Look around the room] -> examine_room

=== take_key ===
You pick up the key from the desk.

* [Try the door with the key] -> unlock_door

=== unlock_door ===
The key fits! The door swings open.
You step out into freedom.

-> END
```

---

## Common Patterns

### Hub-and-Spoke

A central location with multiple options:

```weave
=== town_square ===

You're in the town square.

* [Visit the shop] -> shop
* [Visit the inn] -> inn
* [Leave town] -> forest

=== shop ===
You enter the shop.
* [Go back to square] -> town_square

=== inn ===
You enter the inn.
* [Go back to square] -> town_square
```

### Linear Story with Choices

Story progresses linearly but with flavor choices:

```weave
=== start ===
How do you introduce yourself?

* [Friendly] -> intro_friendly
* [Reserved] -> intro_reserved

=== intro_friendly ===
"Hi! I'm so glad to meet you!"
-> chapter_2

=== intro_reserved ===
"Hello."
-> chapter_2

=== chapter_2 ===
// Story continues...
```

### Branching Paths

Different choices lead to different endings:

```weave
=== critical_choice ===

Do you trust the stranger?

* [Yes] -> trust_path
* [No] -> distrust_path

=== trust_path ===
// Path A...
-> good_ending

=== distrust_path ===
// Path B...
-> bad_ending
```

---

## Tips for Writers

### 1. Plan Your Structure

Sketch out your story flow before writing:

```
start → intro → choice1
                  ├─→ path_a → ending_a
                  └─→ path_b → ending_b
```

### 2. Use Comments Liberally

```weave
// TODO: Add more description here
// NOTE: This is the main branching point
// FIXME: Check grammar
```

### 3. Test Early and Often

Compile and play your story frequently to catch issues.

### 4. Keep Sections Short

Aim for 3-5 paragraphs per section. Long sections are harder to manage.

### 5. Give Meaningful Choices

```weave
// Bad - meaningless choice
* [Say yes] -> next
* [Say no] -> next

// Good - meaningful branches
* [Agree to help] -> help_quest
* [Refuse] -> refuse_quest
```

---

## Next Steps

### Learn More

- Read the [Syntax Reference](syntax.md) for complete language details
- Check out the [Examples](../examples/) for inspiration
- Read the [API Documentation](api.md) to integrate Weave into your game

### Coming Soon

- **Variables**: Track player stats, inventory, flags
- **Conditionals**: Show/hide content based on state
- **Functions**: Create reusable story fragments
- **Multimedia**: Add images, audio, and video

---

## Troubleshooting

### "Section not found" error

Make sure the section name in your divert matches exactly:

```weave
* [Go] -> forrest  // ERROR: typo
* [Go] -> forest   // CORRECT
```

### "Expected '==='" error

Check your section declarations:

```weave
== start ==  // ERROR: wrong syntax
=== start === // CORRECT
```

### Story doesn't end

Make sure all paths lead somewhere:

```weave
=== dead_end ===
You're stuck!
// Missing -> END or choices!
```

---

## Get Help

- Read the [Syntax Reference](syntax.md)
- Check the [Examples](../examples/)
- Report bugs on [GitHub](https://github.com/yourusername/weave/issues)

---

Happy writing! 🎮📝
