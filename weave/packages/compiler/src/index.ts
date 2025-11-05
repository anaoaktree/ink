/**
 * @weave-lang/compiler
 * Weave language compiler - parses and compiles .weave files
 */

export { Parser, parse } from './parser.js'
export { Compiler, compile } from './compiler.js'
export * from './ast.js'

import { parse } from './parser.js'
import { compile } from './compiler.js'
import type { CompiledStory } from './ast.js'

/**
 * Compile a Weave source file to executable JSON
 */
export function compileWeave(source: string): CompiledStory {
  const ast = parse(source)
  return compile(ast)
}
