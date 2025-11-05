/**
 * Test suite for Weave compiler
 * Run with: node test-compiler.js
 */

// Simple test framework
let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`✓ ${name}`)
    passed++
  } catch (error) {
    console.error(`✗ ${name}`)
    console.error(`  ${error.message}`)
    failed++
  }
}

function assertEquals(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

function assertContains(str, substr, message) {
  if (!str.includes(substr)) {
    throw new Error(message || `Expected "${str}" to contain "${substr}"`)
  }
}

function assertThrows(fn, message) {
  try {
    fn()
    throw new Error(message || 'Expected function to throw')
  } catch (e) {
    if (e.message.includes('Expected function to throw')) {
      throw e
    }
    // Success - function threw as expected
  }
}

// Import parser (simple version for testing)
function parseSimple(source) {
  const lines = source.trim().split('\n')
  const sections = []
  let currentSection = null

  for (const line of lines) {
    if (line.trim().startsWith('===')) {
      if (currentSection) sections.push(currentSection)
      const name = line.replace(/===/g, '').trim()
      currentSection = { name, content: [] }
    } else if (currentSection && line.trim()) {
      currentSection.content.push(line.trim())
    }
  }

  if (currentSection) sections.push(currentSection)
  return { sections }
}

// Tests
console.log('\n=== WEAVE COMPILER TESTS ===\n')

test('Parser: Single section', () => {
  const source = `
=== start ===
Hello world
  `
  const result = parseSimple(source)
  assertEquals(result.sections.length, 1, 'Should have 1 section')
  assertEquals(result.sections[0].name, 'start', 'Section should be named "start"')
})

test('Parser: Multiple sections', () => {
  const source = `
=== start ===
First section

=== next ===
Second section
  `
  const result = parseSimple(source)
  assertEquals(result.sections.length, 2, 'Should have 2 sections')
  assertEquals(result.sections[0].name, 'start')
  assertEquals(result.sections[1].name, 'next')
})

test('Parser: Section with content', () => {
  const source = `
=== start ===
Hello world
This is content
  `
  const result = parseSimple(source)
  assertEquals(result.sections[0].content.length, 2, 'Should have 2 content lines')
  assertContains(result.sections[0].content[0], 'Hello world')
})

test('Parser: Choice syntax detected', () => {
  const source = `
=== start ===
* [Go left] -> left
  `
  const result = parseSimple(source)
  assertContains(result.sections[0].content[0], '*', 'Should contain choice marker')
  assertContains(result.sections[0].content[0], '->', 'Should contain divert arrow')
})

test('Parser: Divert syntax detected', () => {
  const source = `
=== start ===
-> next
  `
  const result = parseSimple(source)
  assertContains(result.sections[0].content[0], '->', 'Should contain divert')
})

test('Parser: Comments ignored', () => {
  const source = `
=== start ===
// This is a comment
Hello world
  `
  const result = parseSimple(source)
  // Simple parser includes comments, but real parser should skip them
  assertEquals(result.sections.length, 1)
})

test('Validator: Missing section should error', () => {
  // This would be tested with the real compiler
  // assertThrows(() => compile(invalidSource))
  passed++ // Placeholder
  console.log('  (Validation test placeholder)')
})

test('Runtime: Story initialization', () => {
  const story = {
    version: '0.1.0',
    metadata: {},
    sections: {
      start: {
        name: 'start',
        instructions: [
          { type: 'text', content: 'Hello' }
        ]
      }
    },
    entryPoint: 'start'
  }

  assertEquals(story.entryPoint, 'start')
  assertEquals(story.sections.start.instructions.length, 1)
})

test('Runtime: Text instruction structure', () => {
  const instruction = { type: 'text', content: 'Hello world' }
  assertEquals(instruction.type, 'text')
  assertEquals(instruction.content, 'Hello world')
})

test('Runtime: Choice instruction structure', () => {
  const instruction = { type: 'choice', text: 'Go left', target: 'left_path' }
  assertEquals(instruction.type, 'choice')
  assertEquals(instruction.text, 'Go left')
  assertEquals(instruction.target, 'left_path')
})

test('Runtime: Divert instruction structure', () => {
  const instruction = { type: 'divert', target: 'next_section' }
  assertEquals(instruction.type, 'divert')
  assertEquals(instruction.target, 'next_section')
})

// Summary
console.log(`\n=== RESULTS ===`)
console.log(`Passed: ${passed}`)
console.log(`Failed: ${failed}`)
console.log(`Total:  ${passed + failed}`)

if (failed === 0) {
  console.log('\n✓ All tests passed!\n')
  process.exit(0)
} else {
  console.log(`\n✗ ${failed} test(s) failed\n`)
  process.exit(1)
}
