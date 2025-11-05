/**
 * @weave-lang/compiler
 * Weave language compiler - parses and compiles .weave files
 */

export { Parser, parse } from './parser.js'
export { Compiler, compile } from './compiler.js'
export { Validator, validateStory } from './validator.js'
export * from './ast.js'

import { parse } from './parser.js'
import { compile } from './compiler.js'
import { validateStory } from './validator.js'
import type { CompiledStory } from './ast.js'
import type { ValidationResult } from './validator.js'

/**
 * Compile a Weave source file to executable JSON
 */
export function compileWeave(source: string): CompiledStory {
  const ast = parse(source)
  return compile(ast)
}

/**
 * Compile and validate a Weave source file
 */
export function compileAndValidate(source: string): { story: CompiledStory; validation: ValidationResult } {
  const ast = parse(source)
  const story = compile(ast)
  const validation = validateStory(story)
  return { story, validation }
}
