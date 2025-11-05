/**
 * Static Analysis & Validation for Weave Stories
 * Detects loops, dead ends, unreachable content
 */

import type { Story, Section, ContentNode } from './ast.js'
import type { CompiledStory, CompiledSection } from './ast.js'

export interface ValidationResult {
  errors: ValidationError[]
  warnings: ValidationWarning[]
  info: ValidationInfo[]
}

export interface ValidationError {
  type: 'error'
  message: string
  section?: string
  line?: number
}

export interface ValidationWarning {
  type: 'warning'
  message: string
  section?: string
  detail?: string
}

export interface ValidationInfo {
  type: 'info'
  message: string
  detail?: string
}

export class Validator {
  private story: CompiledStory
  private sectionGraph: Map<string, Set<string>> = new Map()

  constructor(story: CompiledStory) {
    this.story = story
    this.buildGraph()
  }

  /**
   * Build a graph of section connections (diverts/choices)
   */
  private buildGraph(): void {
    for (const [sectionName, section] of Object.entries(this.story.sections)) {
      const targets = new Set<string>()

      for (const instruction of section.instructions) {
        if (instruction.type === 'choice') {
          targets.add(instruction.target)
        } else if (instruction.type === 'divert') {
          targets.add(instruction.target)
        }
      }

      this.sectionGraph.set(sectionName, targets)
    }
  }

  /**
   * Run all validation checks
   */
  validate(): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const info: ValidationInfo[] = []

    // Check for dead ends
    const deadEnds = this.detectDeadEnds()
    warnings.push(...deadEnds)

    // Check for infinite loops
    const loops = this.detectInfiniteLoops()
    warnings.push(...loops)

    // Check for unreachable content
    const unreachable = this.detectUnreachableContent()
    warnings.push(...unreachable)

    // Info: endpoint analysis
    const endpoints = this.findEndpoints()
    if (endpoints.length > 0) {
      info.push({
        type: 'info',
        message: `Story has ${endpoints.length} possible ending(s)`,
        detail: endpoints.join(', '),
      })
    }

    return { errors, warnings, info }
  }

  /**
   * Detect sections with no choices and no divert (dead ends)
   */
  private detectDeadEnds(): ValidationWarning[] {
    const warnings: ValidationWarning[] = []

    for (const [sectionName, section] of Object.entries(this.story.sections)) {
      const hasChoices = section.instructions.some((i) => i.type === 'choice')
      const hasDivert = section.instructions.some((i) => i.type === 'divert')

      if (!hasChoices && !hasDivert && sectionName !== 'END' && sectionName !== 'DONE') {
        warnings.push({
          type: 'warning',
          message: `Dead end detected in section "${sectionName}"`,
          section: sectionName,
          detail: 'Section has no choices or diverts - story will end here unexpectedly',
        })
      }
    }

    return warnings
  }

  /**
   * Detect infinite loops (cycles with no escape)
   */
  private detectInfiniteLoops(): ValidationWarning[] {
    const warnings: ValidationWarning[] = []
    const visited = new Set<string>()
    const stack: string[] = []

    const hasCycle = (section: string): boolean => {
      if (stack.includes(section)) {
        // Found a cycle - check if it has choices (escape paths)
        const cycleStart = stack.indexOf(section)
        const cycleNodes = stack.slice(cycleStart)

        // If all nodes in cycle have no choices, it's an infinite loop
        const hasEscape = cycleNodes.some((node) => {
          const sec = this.story.sections[node]
          return sec?.instructions.some((i) => i.type === 'choice')
        })

        if (!hasEscape) {
          warnings.push({
            type: 'warning',
            message: `Potential infinite loop detected`,
            detail: `Cycle: ${cycleNodes.join(' → ')} → ${section}`,
          })
          return true
        }
      }

      if (visited.has(section)) return false

      visited.add(section)
      stack.push(section)

      const targets = this.sectionGraph.get(section) || new Set()
      for (const target of targets) {
        if (target === 'END' || target === 'DONE') continue
        hasCycle(target)
      }

      stack.pop()
      return false
    }

    hasCycle(this.story.entryPoint)
    return warnings
  }

  /**
   * Detect unreachable content (sections that can never be visited)
   */
  private detectUnreachableContent(): ValidationWarning[] {
    const warnings: ValidationWarning[] = []
    const reachable = new Set<string>()

    // BFS from entry point
    const queue = [this.story.entryPoint]
    while (queue.length > 0) {
      const section = queue.shift()!
      if (reachable.has(section)) continue
      reachable.add(section)

      const targets = this.sectionGraph.get(section) || new Set()
      for (const target of targets) {
        if (!reachable.has(target) && target !== 'END' && target !== 'DONE') {
          queue.push(target)
        }
      }
    }

    // Find unreachable sections
    for (const sectionName of Object.keys(this.story.sections)) {
      if (!reachable.has(sectionName)) {
        warnings.push({
          type: 'warning',
          message: `Unreachable content detected in section "${sectionName}"`,
          section: sectionName,
          detail: 'This section can never be visited from the entry point',
        })
      }
    }

    return warnings
  }

  /**
   * Find all possible endpoints (sections that lead to END/DONE)
   */
  private findEndpoints(): string[] {
    const endpoints: string[] = []

    for (const [sectionName, targets] of this.sectionGraph.entries()) {
      if (targets.has('END') || targets.has('DONE')) {
        endpoints.push(sectionName)
      }
    }

    return endpoints
  }

  /**
   * Generate a report of validation results
   */
  static formatReport(result: ValidationResult): string {
    const lines: string[] = []

    if (result.errors.length > 0) {
      lines.push('ERRORS:')
      for (const error of result.errors) {
        lines.push(`  ✗ ${error.message}`)
      }
      lines.push('')
    }

    if (result.warnings.length > 0) {
      lines.push('WARNINGS:')
      for (const warning of result.warnings) {
        lines.push(`  ⚠ ${warning.message}`)
        if (warning.detail) {
          lines.push(`    ${warning.detail}`)
        }
      }
      lines.push('')
    }

    if (result.info.length > 0) {
      lines.push('INFO:')
      for (const info of result.info) {
        lines.push(`  ℹ ${info.message}`)
        if (info.detail) {
          lines.push(`    ${info.detail}`)
        }
      }
      lines.push('')
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
      lines.push('✓ No issues found!')
    }

    return lines.join('\n')
  }
}

export function validateStory(story: CompiledStory): ValidationResult {
  const validator = new Validator(story)
  return validator.validate()
}
