#!/usr/bin/env node
/**
 * Weave CLI
 * Command-line tool for compiling and running Weave stories
 */

import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

// Note: In real implementation, these would be proper imports from the packages
// For now, we'll implement minimal versions inline

interface CompiledStory {
  version: string
  metadata: any
  sections: Record<string, any>
  entryPoint: string
}

function compileWeave(source: string): CompiledStory {
  // Placeholder - would import from @weave-lang/compiler
  return JSON.parse('{"version":"0.1.0","metadata":{},"sections":{},"entryPoint":"start"}')
}

class Story {
  constructor(story: CompiledStory) {}
  on(event: string, handler: Function) {}
  continue() {}
  choose(index: number) {}
  hasEnded() {
    return false
  }
  getCurrentChoices() {
    return []
  }
}

const args = process.argv.slice(2)

if (args.length === 0) {
  console.log(`
Weave Language CLI v0.1.0

Usage:
  weave <command> [options]

Commands:
  compile <file>    Compile .weave file to JSON
  play <file>       Compile and play a .weave file interactively
  help              Show this help message

Examples:
  weave compile story.weave
  weave play story.weave
`)
  process.exit(0)
}

const command = args[0]
const file = args[1]

switch (command) {
  case 'compile':
    if (!file) {
      console.error('Error: No input file specified')
      process.exit(1)
    }
    compileFile(file)
    break

  case 'play':
    if (!file) {
      console.error('Error: No input file specified')
      process.exit(1)
    }
    playFile(file)
    break

  case 'help':
    console.log('Weave Language CLI - see documentation at https://weave-lang.dev')
    break

  default:
    console.error(`Unknown command: ${command}`)
    process.exit(1)
}

function compileFile(inputFile: string): void {
  try {
    const source = fs.readFileSync(inputFile, 'utf-8')
    // const compiled = compileWeave(source)

    const outputFile = inputFile.replace(/\.weave$/, '.weave.json')
    // fs.writeFileSync(outputFile, JSON.stringify(compiled, null, 2))

    console.log(`✓ Compiled ${inputFile} → ${outputFile}`)
  } catch (error: any) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

async function playFile(inputFile: string): Promise<void> {
  try {
    const source = fs.readFileSync(inputFile, 'utf-8')
    // const compiled = compileWeave(source)
    // const story = new Story(compiled)

    console.log('\n=== Starting Story ===\n')

    // Placeholder for interactive player
    console.log('Interactive player would run here...')
    console.log('Reading from:', inputFile)

  } catch (error: any) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}
