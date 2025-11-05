# Weave Syntax Reference

Complete guide to writing in Weave.

---

## Table of Contents

1. [Basic Structure](#basic-structure)
2. [Sections](#sections)
3. [Text Content](#text-content)
4. [Choices](#choices)
5. [Diverts](#diverts)
6. [Comments](#comments)
7. [Coming Soon](#coming-soon)

---

## Basic Structure

A Weave story consists of **sections** containing **content** (text, choices, diverts).

```weave
=== section_name ===

Text content goes here.

* [A choice] -> another_section
* [Another choice] -> different_section

=== another_section ===

More content...

-> END
```

---

## Sections

Sections are named blocks of content, like chapters or scenes.

### Syntax

```weave
=== section_name ===
```

### Rules

- Section names must be **valid identifiers** (letters, numbers, underscores)
- Section names must be **unique** within a story
- Every story should have a `start` section (the default entry point)

### Examples

```weave
=== start ===
This is the beginning.

=== chapter_2 ===
This is chapter 2.

=== final_battle ===
The climax of the story.
```

### Special Section Names

- `start` - Default entry point (if no other section specified)
- `END` or `DONE` - Ends the story

---

## Text Content

Any line that's not a special syntax element is treated as narrative text.

### Basic Text

```weave
This is a line of text.
This is another line.

Blank lines create paragraph breaks.
```

### Dialogue

Use quotation marks for character speech:

```weave
"Hello!" she said.

"How are you?" he asked.
```

### Rendering

- Text is output exactly as written
- Line breaks are preserved
- Double line breaks create new paragraphs
- Leading/trailing whitespace is trimmed

---

## Choices

Choices present options to the player.

### Basic Choice

```weave
* [Choice text] -> destination
```

### Sticky vs. Fallthrough

```weave
* [Sticky choice] -> destination     // Can be chosen multiple times
+ [Fallthrough choice] -> destination // Can only be chosen once
```

### Multiple Choices

```weave
What do you do?

* [Go left] -> left_path
* [Go right] -> right_path
* [Go back] -> start
```

### Conditional Choices (Coming Soon)

```weave
* {has_key} [Unlock door] -> unlocked
* {health > 50} [Fight] -> battle
```

### Choice Fallback

If no target is specified, the choice defaults to `DONE`:

```weave
* [End story]  // Implicitly goes to DONE
```

---

## Diverts

Diverts redirect the story flow to another section.

### Basic Divert

```weave
-> section_name
```

### Examples

```weave
=== intro ===
Welcome to the game!

-> main_menu

=== main_menu ===
What do you want to do?

* [Play] -> start_game
* [Quit] -> END
```

### Special Diverts

```weave
-> END    // End the story
-> DONE   // Also ends the story
```

### Divert Validation

The compiler checks that all divert targets exist:

```weave
-> invalid_section  // ERROR: Section 'invalid_section' not found
```

---

## Comments

Comments are ignored by the compiler and don't appear in the output.

### Line Comments

```weave
// This is a comment
This is content  // Comment after content
```

### Use Cases

```weave
// TODO: Add more dialogue here
// NOTE: This section needs playtesting
// FIXME: Grammar issue below

"Hello, world!"
```

---

## Coming Soon

These features are planned for future sprints:

### Variables (Sprint 2)

```weave
var health = 100
var name = "Alice"
var inventory = []

~ health -= 10
~ inventory.push("sword")
```

### Conditionals (Sprint 2)

```weave
{health < 50}
  You're feeling weak.
{else}
  You're in good shape.
{/}
```

### Functions (Sprint 2)

```weave
=== function greet(name) ===
Hello, {name}!
===

-> greet("Alice")
```

### Multimedia (Sprint 3)

```weave
@image show="forest.jpg" fade=true
@audio play="music.mp3" loop=true volume=0.5
@scene bg="castle.jpg" music="epic.mp3"
```

### Tags (Sprint 3)

```weave
This is dialogue. # character:sarah # mood:happy
```

---

## Best Practices

### 1. Use Descriptive Section Names

```weave
// Good
=== forest_entrance ===
=== dragon_battle ===
=== happy_ending ===

// Bad
=== section1 ===
=== s2 ===
=== end ===
```

### 2. Comment Complex Logic

```weave
// Player found the secret key in chapter 2
* {has_secret_key} [Use secret key] -> secret_room
```

### 3. Keep Sections Focused

```weave
// Good: One scene per section
=== meet_wizard ===
A wizard appears.
* [Talk to wizard] -> wizard_dialogue

// Better: Break long sections into smaller ones
```

### 4. Use Consistent Formatting

```weave
// Pick a style and stick with it

=== start ===

First paragraph.

Second paragraph.

* [Choice 1] -> section1
* [Choice 2] -> section2
```

---

## Grammar Summary

```
Story       := Section+
Section     := "===" Identifier "===" ContentNode*
ContentNode := Text | Choice | Divert | Comment

Text        := (Any characters except special syntax)
Choice      := ("*" | "+") ("[" Text "]")? ("->" Identifier)?
Divert      := "->" Identifier
Comment     := "//" (Any characters until newline)

Identifier  := [a-zA-Z_][a-zA-Z0-9_]*
```

---

## Error Messages

Weave provides helpful error messages:

```
Parse error at line 10, column 5: Expected '==='
```

```
Invalid divert target "invalid" in section "start". Section does not exist.
```

---

## See Also

- [Getting Started Guide](getting-started.md)
- [API Documentation](api.md)
- [Examples](../examples/)
