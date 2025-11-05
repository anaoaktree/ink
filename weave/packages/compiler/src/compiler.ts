/**
 * Weave Compiler
 * Converts AST to executable JSON format
 */

import type { Story, Section, ContentNode, CompiledStory, CompiledSection, Instruction } from './ast.js'

export class Compiler {
  compile(ast: Story): CompiledStory {
    const sections: Record<string, CompiledSection> = {}

    // Compile each section
    for (const section of ast.sections) {
      sections[section.name] = this.compileSection(section)
    }

    // Validate that all divert targets exist
    this.validateDiverts(sections)

    return {
      version: '0.1.0',
      metadata: {
        created: new Date().toISOString(),
      },
      sections,
      entryPoint: 'start',
    }
  }

  private compileSection(section: Section): CompiledSection {
    const instructions: Instruction[] = []

    for (const node of section.content) {
      const compiled = this.compileNode(node)
      if (Array.isArray(compiled)) {
        instructions.push(...compiled)
      } else {
        instructions.push(compiled)
      }
    }

    return {
      name: section.name,
      instructions,
    }
  }

  private compileNode(node: ContentNode): Instruction | Instruction[] {
    switch (node.type) {
      case 'Text':
        return {
          type: 'text',
          content: node.content,
          tags: node.tags,
        }

      case 'Choice':
        return {
          type: 'choice',
          text: node.text,
          target: node.target,
          condition: node.condition ? this.compileExpression(node.condition) : undefined,
        }

      case 'Divert':
        return {
          type: 'divert',
          target: node.target,
        }

      case 'Conditional':
        return {
          type: 'conditional',
          condition: this.compileExpression(node.condition),
          thenBranch: 0, // Would need proper branch indexing
          elseBranch: node.elseBranch ? 1 : undefined,
        }

      case 'VariableDeclaration':
        return {
          type: 'var',
          name: node.name,
          value: node.initialValue ? this.compileExpression(node.initialValue) : undefined,
        }

      case 'Assignment':
        return {
          type: 'assign',
          variable: node.variable,
          operator: node.operator,
          value: this.compileExpression(node.value),
        }

      case 'MediaDirective':
        return {
          type: 'media',
          mediaType: node.mediaType,
          properties: node.properties,
        }

      default:
        throw new Error(`Unknown node type: ${(node as any).type}`)
    }
  }

  private compileExpression(expr: any): any {
    if (!expr) return null

    switch (expr.type) {
      case 'Literal':
        return expr.value

      case 'VariableReference':
        return { var: expr.name }

      case 'BinaryExpression':
        return {
          op: expr.operator,
          left: this.compileExpression(expr.left),
          right: this.compileExpression(expr.right),
        }

      case 'UnaryExpression':
        return {
          op: expr.operator,
          arg: this.compileExpression(expr.argument),
        }

      case 'FunctionCall':
        return {
          fn: expr.name,
          args: expr.arguments.map((arg: any) => this.compileExpression(arg)),
        }

      default:
        return expr
    }
  }

  private validateDiverts(sections: Record<string, CompiledSection>): void {
    const sectionNames = new Set(Object.keys(sections))
    sectionNames.add('DONE') // DONE is always valid
    sectionNames.add('END') // END is always valid

    for (const [sectionName, section] of Object.entries(sections)) {
      for (const instruction of section.instructions) {
        if (instruction.type === 'choice' && !sectionNames.has(instruction.target)) {
          throw new Error(
            `Invalid divert target "${instruction.target}" in section "${sectionName}". Section does not exist.`
          )
        }
        if (instruction.type === 'divert' && !sectionNames.has(instruction.target)) {
          throw new Error(
            `Invalid divert target "${instruction.target}" in section "${sectionName}". Section does not exist.`
          )
        }
      }
    }
  }
}

export function compile(ast: Story): CompiledStory {
  const compiler = new Compiler()
  return compiler.compile(ast)
}
