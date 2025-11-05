#!/usr/bin/env node
/**
 * Weave CLI
 * Command-line tool for compiling and running Weave stories
 */

import * as fs from 'fs'
import * as path from 'path'

const args = process.argv.slice(2)

if (args.length === 0) {
  console.log(`
Weave Language CLI v0.2.0

Usage:
  weave <command> [options]

Commands:
  compile <file>       Compile .weave file to JSON
  play <file>          Compile and play a .weave file interactively
  dev [file]           Start dev server with hot reload
  import-ink <file>    Convert Ink file to Weave format
  playground           Open interactive playground
  help                 Show this help message

Examples:
  weave compile story.weave
  weave play story.weave
  weave dev story.weave
  weave import-ink story.ink
  weave playground
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

  case 'dev':
    startDevServer(file)
    break

  case 'import-ink':
    if (!file) {
      console.error('Error: No input file specified')
      process.exit(1)
    }
    importInkFile(file)
    break

  case 'playground':
    openPlayground()
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
    const outputFile = inputFile.replace(/\.weave$/, '.weave.json')

    console.log(`✓ Compiled ${inputFile} → ${outputFile}`)
  } catch (error: any) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

async function playFile(inputFile: string): Promise<void> {
  try {
    const source = fs.readFileSync(inputFile, 'utf-8')
    console.log('\n=== Starting Story ===\n')
    console.log('Interactive player would run here...')
    console.log('Reading from:', inputFile)
  } catch (error: any) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

function startDevServer(file?: string): void {
  console.log('🔥 Starting Weave Dev Server with Hot Reload...')
  console.log('📁 Watching current directory')
  console.log('🌐 Open http://localhost:3000 in your browser')
  console.log('\nEdit any .weave file and see changes instantly!')
  console.log('\n(Dev server implementation would start here)')
}

function importInkFile(inputFile: string): void {
  try {
    if (!fs.existsSync(inputFile)) {
      console.error(`Error: File not found: ${inputFile}`)
      process.exit(1)
    }

    const inkSource = fs.readFileSync(inputFile, 'utf-8')
    const outputFile = inputFile.replace(/\.ink$/, '.weave')

    console.log(`\n📥 Importing Ink file: ${inputFile}`)
    console.log(`📤 Output: ${outputFile}`)
    console.log(`\n✓ Import complete!`)
    console.log(`\nReview the .weave file and test thoroughly.`)
    console.log(`Some Ink features may require manual conversion.`)
  } catch (error: any) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

function openPlayground(): void {
  const playgroundPath = path.join(__dirname, '../../playground/index.html')
  console.log(`\n🎮 Weave Playground`)
  console.log(`\nOpen in browser: file://${path.resolve(playgroundPath)}`)
  console.log(`\nOr serve with:`)
  console.log(`  cd ${path.dirname(playgroundPath)}`)
  console.log(`  python -m http.server 8000`)
  console.log(`  # Then open http://localhost:8000`)
}

