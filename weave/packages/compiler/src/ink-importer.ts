/**
 * Ink to Weave Importer
 * Converts Ink (.ink) files to Weave (.weave) format
 */

export interface ImportResult {
  weaveSource: string
  warnings: string[]
  unsupportedFeatures: string[]
}

export class InkImporter {
  private warnings: string[] = []
  private unsupported: string[] = []

  import(inkSource: string): ImportResult {
    this.warnings = []
    this.unsupported = []

    const lines = inkSource.split('\n')
    const weaveLines: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const converted = this.convertLine(line, i + 1)
      if (converted !== null) {
        weaveLines.push(converted)
      }
    }

    return {
      weaveSource: weaveLines.join('\n'),
      warnings: this.warnings,
      unsupportedFeatures: this.unsupported,
    }
  }

  private convertLine(line: string, lineNum: number): string | null {
    const trimmed = line.trim()

    // Empty lines
    if (!trimmed) return ''

    // Comments
    if (trimmed.startsWith('//')) {
      return line // Keep as-is
    }

    if (trimmed.startsWith('/*') || trimmed.startsWith('*/')) {
      return line // Keep block comments
    }

    // TODO/AUTHOR comments
    if (trimmed.startsWith('TODO:')) {
      return `// ${trimmed}`
    }

    // Knots (=== name ===)
    if (trimmed.match(/^===\s*\w+\s*===/)) {
      return line // Already compatible
    }

    // Stitches (= name =) - convert to sections
    if (trimmed.match(/^=\s*\w+\s*=$/)) {
      const name = trimmed.replace(/=/g, '').trim()
      this.warnings.push(`Line ${lineNum}: Converted stitch to section: ${name}`)
      return `=== ${name} ===`
    }

    // Choices (* or +)
    if (trimmed.match(/^[\*\+]/)) {
      return this.convertChoice(line, lineNum)
    }

    // Diverts (->)
    if (trimmed.match(/^->/)) {
      return this.convertDivert(line, lineNum)
    }

    // Gathers (-) - not directly supported
    if (trimmed.match(/^-[^>]/)) {
      this.warnings.push(`Line ${lineNum}: Gathers not supported, converting to text`)
      return `// GATHER: ${line}`
    }

    // Variables (VAR, temp, CONST)
    if (trimmed.match(/^(VAR|temp|CONST)\s/)) {
      return this.convertVariable(line, lineNum)
    }

    // Conditionals
    if (trimmed.startsWith('{') && !trimmed.startsWith('//')) {
      return this.convertConditional(line, lineNum)
    }

    // Tags (#)
    if (trimmed.startsWith('#')) {
      this.warnings.push(`Line ${lineNum}: Tags not fully supported yet`)
      return `// TAG: ${trimmed}`
    }

    // Lists - not supported
    if (trimmed.match(/^LIST\s/)) {
      this.unsupported.push(`Line ${lineNum}: LIST (Ink's enum system)`)
      return `// UNSUPPORTED LIST: ${line}`
    }

    // Tunnels (->->) - not supported
    if (trimmed.match(/^->->/)) {
      this.unsupported.push(`Line ${lineNum}: Tunnels (->->)`)
      return `// UNSUPPORTED TUNNEL: ${line}`
    }

    // Threads (<-) - not supported
    if (trimmed.match(/^<-/)) {
      this.unsupported.push(`Line ${lineNum}: Threads (<-)`)
      return `// UNSUPPORTED THREAD: ${line}`
    }

    // External functions - not supported
    if (trimmed.match(/^EXTERNAL\s/)) {
      this.unsupported.push(`Line ${lineNum}: External functions`)
      return `// UNSUPPORTED EXTERNAL: ${line}`
    }

    // Plain text
    return line
  }

  private convertChoice(line: string, lineNum: number): string {
    // Ink: * [Choice text] -> destination
    // Ink: + [Choice text] -> destination (sticky vs fallthrough)
    // Weave uses same syntax!

    // Check for nested choices (**, ***, etc)
    const match = line.match(/^(\*+|\++)/)
    if (match && match[1].length > 1) {
      this.warnings.push(`Line ${lineNum}: Nested choices flattened (${match[1].length} levels)`)
      return line.replace(/^[\*\+]+/, '*')
    }

    return line // Already compatible!
  }

  private convertDivert(line: string, lineNum: number): string {
    // Ink: -> destination
    // Weave: -> destination
    // Already compatible!

    // Check for END/DONE
    if (line.includes('-> END') || line.includes('-> DONE')) {
      return line // Compatible
    }

    return line
  }

  private convertVariable(line: string, lineNum: number): string {
    // Ink: VAR name = value
    // Ink: temp name = value
    // Ink: CONST NAME = value
    // Weave: var name = value

    const trimmed = line.trim()

    if (trimmed.startsWith('VAR ')) {
      return line.replace(/^VAR\s/, 'var ')
    }

    if (trimmed.startsWith('temp ')) {
      this.warnings.push(`Line ${lineNum}: temp variables converted to var (scope may differ)`)
      return line.replace(/^temp\s/, 'var ')
    }

    if (trimmed.startsWith('CONST ')) {
      this.warnings.push(`Line ${lineNum}: CONST converted to var (not truly constant)`)
      return line.replace(/^CONST\s/, 'var ')
    }

    return line
  }

  private convertConditional(line: string, lineNum: number): string {
    // Ink conditionals are complex, just warn for now
    if (line.includes(':') || line.includes('-')) {
      this.warnings.push(`Line ${lineNum}: Complex conditional may need manual adjustment`)
    }

    return line
  }
}

/**
 * Convert an Ink file to Weave format
 */
export function importFromInk(inkSource: string): ImportResult {
  const importer = new InkImporter()
  return importer.import(inkSource)
}

/**
 * Save import result to file
 */
export function formatImportReport(result: ImportResult): string {
  const lines: string[] = []

  lines.push('=== Ink → Weave Import Report ===\n')

  if (result.warnings.length > 0) {
    lines.push('⚠️  WARNINGS:')
    result.warnings.forEach((w) => lines.push(`  - ${w}`))
    lines.push('')
  }

  if (result.unsupportedFeatures.length > 0) {
    lines.push('❌ UNSUPPORTED FEATURES:')
    result.unsupportedFeatures.forEach((u) => lines.push(`  - ${u}`))
    lines.push('')
    lines.push('These features require manual conversion or are not yet supported.')
    lines.push('')
  }

  if (result.warnings.length === 0 && result.unsupportedFeatures.length === 0) {
    lines.push('✅ Import successful! No issues detected.')
    lines.push('')
  }

  lines.push('Review the converted .weave file and test thoroughly.')

  return lines.join('\n')
}
