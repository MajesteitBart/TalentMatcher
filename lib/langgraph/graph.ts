// lib/langgraph/graph.ts
import { StateGraph, END, START } from '@langchain/langgraph'
import { Send } from '@langchain/langgraph'
import { WorkflowStateAnnotation } from './state'
import { parseCVNode } from './nodes/parse-cv'
import { retrieveSkillsNode } from './nodes/retrieve-skills'
import { retrieveExperienceNode } from './nodes/retrieve-experience'
import { retrieveProfileNode } from './nodes/retrieve-profile'
import { consolidateNode } from './nodes/consolidate'
import { analyzeNode } from './nodes/analyze'
import { logger } from '@/lib/utils/logger'
import type { WorkflowState } from '@/lib/types'

/**
 * Create the LangGraph workflow
 */
export function createWorkflowGraph() {
  logger.info('Creating workflow graph')
  
  // Initialize graph with state annotation
  const workflow = new StateGraph(WorkflowStateAnnotation)
  
  // Add nodes
  workflow.addNode('parse_cv', parseCVNode)
  workflow.addNode('retrieve_skills', retrieveSkillsNode)
  workflow.addNode('retrieve_experience', retrieveExperienceNode)
  workflow.addNode('retrieve_profile', retrieveProfileNode)
  workflow.addNode('consolidate', consolidateNode)
  workflow.addNode('analyze', analyzeNode)
  
  // Define edges
  // START -> parse_cv
  workflow.addEdge(START, 'parse_cv')
  
  // parse_cv -> parallel retrieval nodes (CORRECT WAY TO DO PARALLEL EXECUTION)
  workflow.addConditionalEdges(
    'parse_cv',
    async (state: WorkflowState) => {
      // Check if parsing was successful
      if (state.error || !state.parsed_cv) {
        logger.warn('CV parsing failed, skipping retrieval', { 
          candidateId: state.candidate_id 
        })
        return 'consolidate' // Skip to consolidate with empty matches
      }
      
      // Fan out to parallel nodes using Send API
      return [
        new Send('retrieve_skills', state),
        new Send('retrieve_experience', state),
        new Send('retrieve_profile', state)
      ]
    }
  )
  
  // All retrieval nodes converge to consolidate
  workflow.addEdge('retrieve_skills', 'consolidate')
  workflow.addEdge('retrieve_experience', 'consolidate')
  workflow.addEdge('retrieve_profile', 'consolidate')
  
  // consolidate -> analyze
  workflow.addEdge('consolidate', 'analyze')
  
  // analyze -> END
  workflow.addEdge('analyze', END)
  
  // Compile the graph
  const compiledGraph = workflow.compile()
  
  logger.info('Workflow graph compiled successfully')
  
  return compiledGraph
}

/**
 * Execute the workflow
 */
export async function executeWorkflow(
  initialState: WorkflowState
): Promise<WorkflowState> {
  const startTime = Date.now()
  
  logger.info('Starting workflow execution', {
    candidateId: initialState.candidate_id,
    rejectedJobId: initialState.rejected_job_id
  })
  
  try {
    const graph = createWorkflowGraph()
    
    // Execute the graph
    const result = await graph.invoke(initialState)
    
    const duration = Date.now() - startTime
    
    logger.info('Workflow execution completed', {
      candidateId: initialState.candidate_id,
      status: result.status,
      duration,
      matchCount: result.consolidated_matches.length
    })
    
    return {
      ...result,
      // Ensure final state
      status: result.error ? 'failed' : 'completed'
    } as WorkflowState
    
  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('Workflow execution failed', {
      error,
      candidateId: initialState.candidate_id,
      duration
    })
    
    return {
      ...initialState,
      status: 'failed',
      error: `Workflow execution failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}
