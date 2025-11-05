/**
 * Weave Language Parser
 * Converts .weave source code into AST
 */

import type {
  Story,
  Section,
  ContentNode,
  TextNode,
  ChoiceNode,
  DivertNode,
  SourceLocation,
  Expression,
  Literal,
  VariableReference,
  BinaryExpression,
} from './ast.js'

export class Parser {
  private source: string
  private pos: number = 0
  private line: number = 1
  private column: number = 1

  constructor(source: string) {
    this.source = source
  }

  parse(): Story {
    const sections: Section[] = []

    // Skip leading whitespace
    this.skipWhitespace()

    // Parse all sections
    while (!this.isAtEnd()) {
      if (this.peek(3) === '===') {
        sections.push(this.parseSection())
      } else {
        // Content before first section goes into implicit "start" section
        if (sections.length === 0) {
          sections.push({
            type: 'Section',
            name: 'start',
            content: this.parseSectionContent(),
          })
        } else {
          throw this.error('Unexpected content outside section')
        }
      }
      this.skipWhitespace()
    }

    // If no sections found, create a default start section with all content
    if (sections.length === 0) {
      sections.push({
        type: 'Section',
        name: 'start',
        content: [],
      })
    }

    return {
      type: 'Story',
      sections,
    }
  }

  private parseSection(): Section {
    // === section_name ===
    this.expect('===')
    this.skipWhitespace()

    const name = this.parseIdentifier()

    this.skipWhitespace()
    this.expect('===')
    this.skipWhitespace()

    const content = this.parseSectionContent()

    return {
      type: 'Section',
      name,
      content,
    }
  }

  private parseSectionContent(): ContentNode[] {
    const content: ContentNode[] = []

    while (!this.isAtEnd() && this.peek(3) !== '===') {
      this.skipWhitespace()

      if (this.isAtEnd() || this.peek(3) === '===') break

      // Check what kind of content this is
      if (this.peek() === '@') {
        // Media directive (@image, @audio, @video, @scene, @char)
        content.push(this.parseMediaDirective())
      } else if (this.peek(3) === 'var' && !this.isAlphaNumeric(this.peek(1, 3))) {
        // Variable declaration
        content.push(this.parseVariableDeclaration())
      } else if (this.peek() === '~') {
        // Assignment
        content.push(this.parseAssignment())
      } else if (this.peek() === '{' && this.peek(1, 1) !== '}') {
        // Conditional block
        content.push(this.parseConditional())
      } else if (this.peek(2) === '->') {
        // Divert
        content.push(this.parseDivert())
      } else if (this.peek() === '*' || this.peek() === '+') {
        // Choice
        content.push(this.parseChoice())
      } else if (this.peek(2) === '//') {
        // Comment - skip
        this.skipUntil('\n')
        this.advance()
      } else {
        // Text content
        const text = this.parseText()
        if (text.content.trim()) {
          content.push(text)
        }
      }
    }

    return content
  }

  private parseText(): TextNode {
    let text = ''

    while (!this.isAtEnd()) {
      const char = this.peek()

      // Stop at special characters that start new content types
      if (char === '*' || char === '+' || this.peek(2) === '->' || this.peek(3) === '===') {
        break
      }

      // Handle line breaks - double newline = new paragraph
      if (char === '\n') {
        const next = this.peek(1, 1)
        if (next === '\n') {
          // Double newline = end of this text node
          this.advance() // consume first newline
          break
        }
        text += char
        this.advance()
      } else {
        text += char
        this.advance()
      }
    }

    return {
      type: 'Text',
      content: text.trim(),
    }
  }

  private parseChoice(): ChoiceNode {
    const sticky = this.peek() === '*'
    this.advance() // consume * or +

    this.skipWhitespace()

    // Optional condition {condition}
    let condition: Expression | undefined
    if (this.peek() === '{') {
      this.advance()
      condition = this.parseExpression()
      this.expect('}')
      this.skipWhitespace()
    }

    // Choice text [text]
    this.expect('[')
    let text = ''
    while (this.peek() !== ']' && !this.isAtEnd()) {
      text += this.peek()
      this.advance()
    }
    this.expect(']')

    this.skipWhitespace()

    // Target -> destination
    let target = 'DONE'
    if (this.peek(2) === '->') {
      this.expect('->')
      this.skipWhitespace()
      target = this.parseIdentifier()
    }

    this.skipWhitespace()

    return {
      type: 'Choice',
      text: text.trim(),
      target,
      sticky,
      condition,
    }
  }

  private parseDivert(): DivertNode {
    this.expect('->')
    this.skipWhitespace()

    const target = this.parseIdentifier()

    return {
      type: 'Divert',
      target,
    }
  }

  private parseVariableDeclaration(): import('./ast.js').VariableDeclaration {
    // var name = value or var name: type = value
    this.expect('var')
    this.skipWhitespace()

    const name = this.parseIdentifier()
    this.skipWhitespace()

    // Optional type annotation
    let valueType: import('./ast.js').TypeAnnotation | undefined
    if (this.peek() === ':') {
      this.advance() // :
      this.skipWhitespace()
      valueType = this.parseTypeAnnotation()
      this.skipWhitespace()
    }

    // Optional initial value
    let initialValue: Expression | undefined
    if (this.peek() === '=') {
      this.advance() // =
      this.skipWhitespace()
      initialValue = this.parseExpression()
    }

    return {
      type: 'VariableDeclaration',
      name,
      valueType,
      initialValue,
    }
  }

  private parseAssignment(): import('./ast.js').Assignment {
    // ~ variable = value or ~ variable += value
    this.expect('~')
    this.skipWhitespace()

    const variable = this.parseIdentifier()
    this.skipWhitespace()

    // Operator
    let operator: '=' | '+=' | '-=' | '*=' | '/=' = '='
    if (this.match(['+=', '-=', '*=', '/='])) {
      operator = this.source.substring(this.pos - 2, this.pos) as any
    } else {
      this.expect('=')
    }

    this.skipWhitespace()
    const value = this.parseExpression()

    return {
      type: 'Assignment',
      variable,
      operator,
      value,
    }
  }

  private parseConditional(): import('./ast.js').ConditionalNode {
    // { condition } content {else} content {/}
    this.expect('{')
    const condition = this.parseExpression()
    this.expect('}')
    this.skipWhitespace()

    // Parse then branch until {else} or {/}
    const thenBranch: ContentNode[] = []
    while (!this.isAtEnd() && this.peek() !== '{') {
      const text = this.parseText()
      if (text.content.trim()) {
        thenBranch.push(text)
      }
      if (this.peek() === '{') break
    }

    // Optional else branch
    let elseBranch: ContentNode[] | undefined
    if (this.peek(6) === '{else}') {
      this.advance(6)
      this.skipWhitespace()

      elseBranch = []
      while (!this.isAtEnd() && this.peek(2) !== '{/') {
        const text = this.parseText()
        if (text.content.trim()) {
          elseBranch.push(text)
        }
        if (this.peek(2) === '{/') break
      }
    }

    // Closing {/}
    this.expect('{/')
    this.expect('}')

    return {
      type: 'Conditional',
      condition,
      thenBranch,
      elseBranch,
    }
  }

  private parseTypeAnnotation(): import('./ast.js').TypeAnnotation {
    const type = this.parseIdentifier()
    if (type === 'string' || type === 'number' || type === 'boolean') {
      return type
    }
    // Could extend for arrays etc
    throw this.error(`Unknown type: ${type}`)
  }

  private parseMediaDirective(): import('./ast.js').MediaDirective {
    // @image show="pic.jpg" duration=2s fade=true
    // @audio play="music.mp3" loop=true volume=0.5
    // @video play="cutscene.mp4" onEnd=continue
    // @scene bg="forest.jpg" music="ambient.mp3"
    // @char name="Sarah" portrait="sarah_happy.jpg"

    this.expect('@')
    const mediaType = this.parseIdentifier()

    const validTypes = ['image', 'audio', 'video', 'scene', 'char']
    if (!validTypes.includes(mediaType)) {
      throw this.error(`Unknown media directive: @${mediaType}`)
    }

    this.skipWhitespace()

    // Parse properties (key=value pairs)
    const properties: Record<string, string | number | boolean> = {}

    while (!this.isAtEnd() && this.peek() !== '\n' && this.peek(3) !== '===') {
      const key = this.parseIdentifier()
      this.skipWhitespace()

      if (this.peek() === '=') {
        this.advance() // =
        const value = this.parsePropertyValue()
        properties[key] = value
        this.skipWhitespace()
      } else {
        // Boolean flag (presence = true)
        properties[key] = true
      }
    }

    return {
      type: 'MediaDirective',
      mediaType: mediaType as any,
      properties,
    }
  }

  private parsePropertyValue(): string | number | boolean {
    // Parse quoted string, number, or boolean
    if (this.peek() === '"' || this.peek() === "'") {
      const quote = this.peek()
      this.advance()
      let value = ''
      while (this.peek() !== quote && !this.isAtEnd()) {
        value += this.peek()
        this.advance()
      }
      this.expect(quote)
      return value
    }

    if (this.peek(4) === 'true') {
      this.advance(4)
      return true
    }

    if (this.peek(5) === 'false') {
      this.advance(5)
      return false
    }

    // Number or identifier
    if (this.isDigit(this.peek())) {
      let num = ''
      while ((this.isDigit(this.peek()) || this.peek() === '.') && !this.isAtEnd()) {
        num += this.peek()
        this.advance()
      }
      return parseFloat(num)
    }

    // Plain identifier value
    return this.parseIdentifier()
  }

  private parseExpression(): Expression {
    return this.parseComparison()
  }

  private parseComparison(): Expression {
    let left = this.parsePrimary()

    while (this.match(['==', '!=', '<', '>', '<=', '>='])) {
      const operator = this.previous() as any
      const right = this.parsePrimary()
      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
      }
    }

    return left
  }

  private parsePrimary(): Expression {
    // Numbers
    if (this.isDigit(this.peek())) {
      return this.parseNumber()
    }

    // Strings
    if (this.peek() === '"' || this.peek() === "'") {
      return this.parseString()
    }

    // Booleans
    if (this.peek(4) === 'true') {
      this.advance(4)
      return { type: 'Literal', value: true, valueType: 'boolean' }
    }
    if (this.peek(5) === 'false') {
      this.advance(5)
      return { type: 'Literal', value: false, valueType: 'boolean' }
    }

    // Variables
    if (this.isAlpha(this.peek())) {
      const name = this.parseIdentifier()
      return { type: 'VariableReference', name }
    }

    throw this.error('Unexpected expression')
  }

  private parseNumber(): Literal {
    let num = ''
    while (this.isDigit(this.peek()) || this.peek() === '.') {
      num += this.peek()
      this.advance()
    }
    return {
      type: 'Literal',
      value: parseFloat(num),
      valueType: 'number',
    }
  }

  private parseString(): Literal {
    const quote = this.peek()
    this.advance() // opening quote

    let str = ''
    while (this.peek() !== quote && !this.isAtEnd()) {
      str += this.peek()
      this.advance()
    }

    this.expect(quote) // closing quote

    return {
      type: 'Literal',
      value: str,
      valueType: 'string',
    }
  }

  private parseIdentifier(): string {
    let id = ''
    while (this.isAlphaNumeric(this.peek()) || this.peek() === '_') {
      id += this.peek()
      this.advance()
    }
    if (!id) throw this.error('Expected identifier')
    return id
  }

  // Utility methods
  private peek(length: number = 1, offset: number = 0): string {
    return this.source.substring(this.pos + offset, this.pos + offset + length)
  }

  private advance(count: number = 1): string {
    const chars = this.source.substring(this.pos, this.pos + count)
    for (let i = 0; i < count; i++) {
      if (this.source[this.pos] === '\n') {
        this.line++
        this.column = 1
      } else {
        this.column++
      }
      this.pos++
    }
    return chars
  }

  private match(tokens: string[]): boolean {
    for (const token of tokens) {
      if (this.peek(token.length) === token) {
        this.advance(token.length)
        return true
      }
    }
    return false
  }

  private expect(token: string): void {
    if (this.peek(token.length) !== token) {
      throw this.error(`Expected '${token}'`)
    }
    this.advance(token.length)
  }

  private previous(): string {
    // This is a simplified version - would need to track last matched token
    return ''
  }

  private skipWhitespace(): void {
    while (!this.isAtEnd()) {
      const char = this.peek()
      if (char === ' ' || char === '\t' || char === '\r' || char === '\n') {
        this.advance()
      } else if (this.peek(2) === '//') {
        // Skip line comments
        this.skipUntil('\n')
      } else {
        break
      }
    }
  }

  private skipUntil(char: string): void {
    while (!this.isAtEnd() && this.peek() !== char) {
      this.advance()
    }
  }

  private isAtEnd(): boolean {
    return this.pos >= this.source.length
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9'
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char)
  }

  private error(message: string): Error {
    return new Error(`Parse error at line ${this.line}, column ${this.column}: ${message}`)
  }

  private getLocation(): SourceLocation {
    return {
      line: this.line,
      column: this.column,
      offset: this.pos,
    }
  }
}

export function parse(source: string): Story {
  const parser = new Parser(source)
  return parser.parse()
}
