/**
 * Integration tests for Weave example games
 * Validates that example .weave files are valid
 */

const fs = require('fs')
const path = require('path')

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

function assertNoErrors(content, filename) {
  // Basic validation: check syntax elements are present
  if (!content.includes('===')) {
    throw new Error(`${filename}: Missing section markers (===)`)
  }
}

function validateWeaveFile(filename) {
  const filepath = path.join(__dirname, 'examples', filename)

  if (!fs.existsSync(filepath)) {
    throw new Error(`File not found: ${filepath}`)
  }

  const content = fs.readFileSync(filepath, 'utf-8')

  // Check file is not empty
  if (content.trim().length === 0) {
    throw new Error(`${filename}: File is empty`)
  }

  // Check has sections
  assertNoErrors(content, filename)

  // Check for balanced diverts (every -> should point somewhere)
  const diverts = content.match(/->\s*(\w+)/g) || []
  const sections = content.match(/===\s*(\w+)\s*===/g) || []
  const sectionNames = sections.map(s => s.replace(/===/g, '').trim())

  // Add END and DONE as valid targets
  sectionNames.push('END', 'DONE')

  for (const divert of diverts) {
    const target = divert.replace('->', '').trim()
    if (!sectionNames.includes(target)) {
      throw new Error(`${filename}: Invalid divert target "${target}"`)
    }
  }

  return true
}

console.log('\n=== WEAVE INTEGRATION TESTS ===\n')

// Test each example file
test('Example 1: hello-world.weave is valid', () => {
  validateWeaveFile('01-hello-world.weave')
})

test('Example 2: the-cave.weave is valid', () => {
  validateWeaveFile('02-the-cave.weave')
})

test('Example 3: dialogue.weave is valid', () => {
  validateWeaveFile('03-dialogue.weave')
})

test('All examples have start section', () => {
  const examples = fs.readdirSync(path.join(__dirname, 'examples'))
    .filter(f => f.endsWith('.weave'))

  for (const file of examples) {
    const content = fs.readFileSync(path.join(__dirname, 'examples', file), 'utf-8')
    if (!content.includes('=== start ===')) {
      throw new Error(`${file}: Missing start section`)
    }
  }
})

test('All examples have proper endings', () => {
  const examples = fs.readdirSync(path.join(__dirname, 'examples'))
    .filter(f => f.endsWith('.weave'))

  for (const file of examples) {
    const content = fs.readFileSync(path.join(__dirname, 'examples', file), 'utf-8')
    if (!content.includes('END')) {
      throw new Error(`${file}: No END marker found`)
    }
  }
})

test('No syntax errors in examples', () => {
  const examples = fs.readdirSync(path.join(__dirname, 'examples'))
    .filter(f => f.endsWith('.weave'))

  for (const file of examples) {
    const content = fs.readFileSync(path.join(__dirname, 'examples', file), 'utf-8')

    // Check for common syntax errors
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check for unbalanced ===
      if (line.includes('===')) {
        const count = (line.match(/===/g) || []).length
        if (count !== 2) {
          throw new Error(`${file}:${i + 1}: Unbalanced === markers`)
        }
      }
    }
  }
})

// Summary
console.log(`\n=== RESULTS ===`)
console.log(`Passed: ${passed}`)
console.log(`Failed: ${failed}`)
console.log(`Total:  ${passed + failed}`)

if (failed === 0) {
  console.log('\n✓ All integration tests passed!\n')
  process.exit(0)
} else {
  console.log(`\n✗ ${failed} test(s) failed\n`)
  process.exit(1)
}
