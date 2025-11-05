/**
 * @weave-lang/runtime
 * Weave story runtime engine
 */

import { Timeline, type TimeEvent } from '../../compiler/src/timeline-system.js'
import { RelationshipSystem } from '../../compiler/src/relationship-system.js'

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

export interface Choice {
  text: string
  index: number
}

export interface StoryState {
  currentSection: string
  variables: Map<string, any>
  visitCounts: Map<string, number>
}

type EventType = 'text' | 'choices' | 'media' | 'end' | 'error'
type EventHandler = (data: any) => void

export class Story {
  private story: CompiledStory
  private state: StoryState
  private currentInstructionIndex: number = 0
  private currentChoices: Array<{ text: string; target: string; index: number }> = []
  private eventHandlers: Map<EventType, EventHandler[]> = new Map()
  private ended: boolean = false
  public timeline: Timeline = new Timeline()
  public relationships: RelationshipSystem = new RelationshipSystem()

  constructor(compiledStory: CompiledStory) {
    this.story = compiledStory
    this.state = {
      currentSection: compiledStory.entryPoint,
      variables: new Map(),
      visitCounts: new Map(),
    }

    // Initialize event handler maps
    for (const type of ['text', 'choices', 'media', 'end', 'error'] as EventType[]) {
      this.eventHandlers.set(type, [])
    }
  }

  /**
   * Register event handler
   */
  on(event: EventType, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event) || []
    handlers.push(handler)
    this.eventHandlers.set(event, handlers)
  }

  /**
   * Emit event to handlers
   */
  private emit(event: EventType, data: any): void {
    const handlers = this.eventHandlers.get(event) || []
    for (const handler of handlers) {
      handler(data)
    }
  }

  /**
   * Start or continue the story
   */
  continue(): void {
    if (this.ended) {
      return
    }

    // Clear current choices
    this.currentChoices = []

    const section = this.story.sections[this.state.currentSection]
    if (!section) {
      this.emit('error', `Section not found: ${this.state.currentSection}`)
      this.ended = true
      return
    }

    // Track visit count
    const visitCount = this.state.visitCounts.get(this.state.currentSection) || 0
    this.state.visitCounts.set(this.state.currentSection, visitCount + 1)

    // Execute instructions
    while (this.currentInstructionIndex < section.instructions.length) {
      const instruction = section.instructions[this.currentInstructionIndex]
      this.currentInstructionIndex++

      const shouldStop = this.executeInstruction(instruction)
      if (shouldStop) {
        return
      }
    }

    // Reached end of section without choices or divert
    if (this.currentChoices.length === 0) {
      this.emit('end', null)
      this.ended = true
    }
  }

  /**
   * Execute a single instruction
   * Returns true if execution should stop (waiting for choice)
   */
  private executeInstruction(instruction: Instruction): boolean {
    switch (instruction.type) {
      case 'text':
        this.emit('text', {
          content: instruction.content,
          tags: instruction.tags || [],
        })
        return false

      case 'choice':
        // Evaluate condition if present
        if (instruction.condition && !this.evaluateExpression(instruction.condition)) {
          return false
        }

        this.currentChoices.push({
          text: instruction.text,
          target: instruction.target,
          index: this.currentChoices.length,
        })
        return false

      case 'divert':
        this.divertTo(instruction.target)
        return true // Stop execution after divert

      case 'var':
        const value = instruction.value !== undefined ? this.evaluateExpression(instruction.value) : null
        this.state.variables.set(instruction.name, value)
        return false

      case 'assign':
        this.executeAssignment(instruction)
        return false

      case 'media':
        this.emit('media', {
          type: instruction.mediaType,
          properties: instruction.properties,
        })
        return false

      case 'timeline':
        this.handleTimelineInstruction(instruction as any)
        return false

      case 'relationship':
        this.handleRelationshipInstruction(instruction as any)
        return false

      case 'conditional':
        // Evaluate condition and execute appropriate branch
        if (this.evaluateExpression(instruction.condition)) {
          // Execute then branch (would need to compile branch instructions)
          // For now, this is a placeholder
        } else if (instruction.elseBranch !== undefined) {
          // Execute else branch
        }
        return false

      default:
        return false
    }
  }

  /**
   * Present current choices to player
   */
  private presentChoices(): void {
    if (this.currentChoices.length > 0) {
      this.emit('choices', this.currentChoices.map((c) => ({ text: c.text, index: c.index })))
    }
  }

  /**
   * Choose an option
   */
  choose(index: number): void {
    if (index < 0 || index >= this.currentChoices.length) {
      this.emit('error', `Invalid choice index: ${index}`)
      return
    }

    const choice = this.currentChoices[index]
    this.currentChoices = []
    this.divertTo(choice.target)
    this.continue()
  }

  /**
   * Divert to a section
   */
  private divertTo(target: string): void {
    if (target === 'DONE' || target === 'END') {
      this.emit('end', null)
      this.ended = true
      return
    }

    if (!this.story.sections[target]) {
      this.emit('error', `Invalid divert target: ${target}`)
      this.ended = true
      return
    }

    this.state.currentSection = target
    this.currentInstructionIndex = 0
  }

  /**
   * Evaluate an expression
   */
  private evaluateExpression(expr: any): any {
    if (expr === null || expr === undefined) return null

    // Literal value
    if (typeof expr !== 'object') {
      return expr
    }

    // Variable reference
    if (expr.var) {
      return this.state.variables.get(expr.var)
    }

    // Binary operation
    if (expr.op && expr.left !== undefined && expr.right !== undefined) {
      const left = this.evaluateExpression(expr.left)
      const right = this.evaluateExpression(expr.right)

      switch (expr.op) {
        case '+':
          return left + right
        case '-':
          return left - right
        case '*':
          return left * right
        case '/':
          return left / right
        case '%':
          return left % right
        case '==':
          return left === right
        case '!=':
          return left !== right
        case '<':
          return left < right
        case '>':
          return left > right
        case '<=':
          return left <= right
        case '>=':
          return left >= right
        case '&&':
          return left && right
        case '||':
          return left || right
        default:
          return null
      }
    }

    // Unary operation
    if (expr.op && expr.arg !== undefined) {
      const arg = this.evaluateExpression(expr.arg)
      switch (expr.op) {
        case '!':
          return !arg
        case '-':
          return -arg
        default:
          return null
      }
    }

    return expr
  }

  /**
   * Execute assignment
   */
  private executeAssignment(instruction: { variable: string; operator: string; value: any }): void {
    const value = this.evaluateExpression(instruction.value)
    const current = this.state.variables.get(instruction.variable) || 0

    switch (instruction.operator) {
      case '=':
        this.state.variables.set(instruction.variable, value)
        break
      case '+=':
        this.state.variables.set(instruction.variable, current + value)
        break
      case '-=':
        this.state.variables.set(instruction.variable, current - value)
        break
      case '*=':
        this.state.variables.set(instruction.variable, current * value)
        break
      case '/=':
        this.state.variables.set(instruction.variable, current / value)
        break
    }
  }

  /**
   * Get current state (for save/load)
   */
  getState(): StoryState {
    return {
      currentSection: this.state.currentSection,
      variables: new Map(this.state.variables),
      visitCounts: new Map(this.state.visitCounts),
    }
  }

  /**
   * Restore state (for save/load)
   */
  setState(state: StoryState): void {
    this.state = {
      currentSection: state.currentSection,
      variables: new Map(state.variables),
      visitCounts: new Map(state.visitCounts),
    }
    this.currentInstructionIndex = 0
    this.currentChoices = []
    this.ended = false
  }

  /**
   * Get variable value
   */
  getVariable(name: string): any {
    return this.state.variables.get(name)
  }

  /**
   * Set variable value
   */
  setVariable(name: string, value: any): void {
    this.state.variables.set(name, value)
  }

  /**
   * Check if story has ended
   */
  hasEnded(): boolean {
    return this.ended
  }

  /**
   * Get current choices (after continue() but before choose())
   */
  getCurrentChoices(): Choice[] {
    return this.currentChoices.map((c) => ({ text: c.text, index: c.index }))
  }

  /**
   * Handle timeline instructions
   */
  private handleTimelineInstruction(instruction: { directiveType: string; properties: Record<string, any> }): void {
    const { directiveType, properties } = instruction

    switch (directiveType) {
      case 'timeline':
        // Initialize timeline with config
        this.timeline = new Timeline({
          startTime: properties.start as number | undefined,
          timeScale: properties.scale as number | undefined,
          dayLength: properties.dayLength as number | undefined,
        })
        break

      case 'time':
        if (properties.advance !== undefined) {
          const events = this.timeline.advance(properties.advance as number)
          // Emit events that triggered
          for (const event of events) {
            this.emit('text', { content: `[Time advanced: ${properties.advance} minutes]` })
            if (event.section) {
              this.divertTo(event.section)
            }
          }
        }
        break

      case 'schedule':
        if (properties.at !== undefined && properties.goto !== undefined) {
          this.timeline.scheduleEvent({
            id: `event_${Date.now()}`,
            triggerTime: properties.at as number,
            section: properties.goto as string,
            repeating: properties.repeat !== undefined,
            interval: properties.repeat === 'daily' ? 1440 : undefined,
          })
        }
        break
    }

    // Emit timeline state
    this.emit('media', {
      type: 'timeline',
      state: this.timeline.getState(),
    })
  }

  /**
   * Handle relationship instructions
   */
  private handleRelationshipInstruction(instruction: {
    directiveType: string
    properties: Record<string, any>
  }): void {
    const { directiveType, properties } = instruction

    switch (directiveType) {
      case 'character':
        this.relationships.registerCharacter({
          id: properties.id as string,
          name: properties.name as string,
          faction: properties.faction as string | undefined,
          traits: properties.traits as string[] | undefined,
        })
        break

      case 'relationship':
        if (properties.with) {
          const charId = properties.with as string
          // Apply relationship changes
          for (const [key, value] of Object.entries(properties)) {
            if (key !== 'with' && typeof value === 'number') {
              this.relationships.modifyRelationship(charId, key as any, value)
            }
          }
        }
        break

      case 'faction':
        this.relationships.registerFaction({
          id: properties.id as string,
          name: properties.name as string,
          reputation: (properties.rep as number) || 0,
          standing: 'neutral',
        })
        if (properties.rep !== undefined) {
          this.relationships.modifyFaction(properties.id as string, 0) // Trigger standing update
        }
        break
    }

    // Emit relationship state
    this.emit('media', {
      type: 'relationship',
      summary: this.relationships.getSummary(),
    })
  }

  /**
   * Get timeline (for external access)
   */
  getTimeline(): Timeline {
    return this.timeline
  }

  /**
   * Get relationship system (for external access)
   */
  getRelationships(): RelationshipSystem {
    return this.relationships
  }
}
