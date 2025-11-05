/**
 * Abstract Syntax Tree (AST) node types for Weave language
 */

export interface SourceLocation {
  line: number
  column: number
  offset: number
}

export interface SourceRange {
  start: SourceLocation
  end: SourceLocation
}

// Base node type
export interface Node {
  type: string
  loc?: SourceRange
}

// Root node
export interface Story extends Node {
  type: 'Story'
  sections: Section[]
}

// Section (=== section_name ===)
export interface Section extends Node {
  type: 'Section'
  name: string
  content: ContentNode[]
}

// Content nodes (things that can appear in sections)
export type ContentNode =
  | TextNode
  | ChoiceNode
  | DivertNode
  | ConditionalNode
  | VariableDeclaration
  | Assignment
  | MediaDirective
  | TimelineDirective
  | RelationshipDirective

// Plain text content
export interface TextNode extends Node {
  type: 'Text'
  content: string
  tags?: string[]
}

// Choice (* [Choice text] -> destination)
export interface ChoiceNode extends Node {
  type: 'Choice'
  text: string
  condition?: Expression
  target: string
  sticky?: boolean // * (fallthrough) vs + (once only)
}

// Divert (-> destination)
export interface DivertNode extends Node {
  type: 'Divert'
  target: string
  conditional?: boolean
}

// Conditional block (if/else)
export interface ConditionalNode extends Node {
  type: 'Conditional'
  condition: Expression
  thenBranch: ContentNode[]
  elseBranch?: ContentNode[]
}

// Variable declaration (var name = value)
export interface VariableDeclaration extends Node {
  type: 'VariableDeclaration'
  name: string
  valueType?: TypeAnnotation
  initialValue?: Expression
}

// Assignment (~ variable = expression)
export interface Assignment extends Node {
  type: 'Assignment'
  variable: string
  operator: '=' | '+=' | '-=' | '*=' | '/='
  value: Expression
}

// Media directives (@image, @audio, @video, @scene, @char)
export interface MediaDirective extends Node {
  type: 'MediaDirective'
  mediaType: 'image' | 'audio' | 'video' | 'scene' | 'char'
  properties: Record<string, string | number | boolean>
}

// Timeline directives (@timeline, @time, @schedule)
export interface TimelineDirective extends Node {
  type: 'TimelineDirective'
  directiveType: 'timeline' | 'time' | 'schedule'
  properties: Record<string, string | number | boolean>
}

// Relationship directives (@character, @relationship, @faction)
export interface RelationshipDirective extends Node {
  type: 'RelationshipDirective'
  directiveType: 'character' | 'relationship' | 'faction'
  properties: Record<string, string | number | boolean>
}

// Expressions
export type Expression =
  | Literal
  | VariableReference
  | BinaryExpression
  | UnaryExpression
  | FunctionCall

export interface Literal extends Node {
  type: 'Literal'
  value: string | number | boolean
  valueType: 'string' | 'number' | 'boolean'
}

export interface VariableReference extends Node {
  type: 'VariableReference'
  name: string
}

export interface BinaryExpression extends Node {
  type: 'BinaryExpression'
  operator: '+' | '-' | '*' | '/' | '%' | '==' | '!=' | '<' | '>' | '<=' | '>=' | '&&' | '||'
  left: Expression
  right: Expression
}

export interface UnaryExpression extends Node {
  type: 'UnaryExpression'
  operator: '!' | '-'
  argument: Expression
}

export interface FunctionCall extends Node {
  type: 'FunctionCall'
  name: string
  arguments: Expression[]
}

// Type annotations (optional)
export type TypeAnnotation =
  | 'string'
  | 'number'
  | 'boolean'
  | ArrayType

export interface ArrayType {
  elementType: 'string' | 'number' | 'boolean'
}

// Compiled format (output of compiler)
export interface CompiledStory {
  version: string
  metadata: {
    title?: string
    author?: string
    created: string
  }
  sections: Record<string, CompiledSection>
  entryPoint: string
}

export interface CompiledSection {
  name: string
  instructions: Instruction[]
}

export type Instruction =
  | { type: 'text'; content: string; tags?: string[] }
  | { type: 'choice'; text: string; target: string; condition?: any }
  | { type: 'divert'; target: string }
  | { type: 'conditional'; condition: any; thenBranch: number; elseBranch?: number }
  | { type: 'var'; name: string; value?: any }
  | { type: 'assign'; variable: string; operator: string; value: any }
  | { type: 'media'; mediaType: string; properties: Record<string, any> }
  | { type: 'timeline'; directiveType: string; properties: Record<string, any> }
  | { type: 'relationship'; directiveType: string; properties: Record<string, any> }
