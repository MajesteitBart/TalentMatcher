// lib/langgraph/nodes/parse-cv.ts
import { parseCV, validateParsedCV } from '@/lib/gemini/parser'
import { saveParsedCV } from '@/lib/supabase/queries/candidates'
import { logger } from '@/lib/utils/logger'
import type { WorkflowState } from '@/lib/types'

export async function parseCVNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  logger.info('Node: parse-cv started', { 
    candidateId: state.candidate_id,
    attempt: state.attempt_count + 1
  })
  
  try {
    // Parse CV with Gemini
    const parsed = await parseCV(state.raw_cv)
    
    // Validate quality
    const validation = validateParsedCV(parsed)
    
    // Save to database
    const savedParsedCV = await saveParsedCV({
      candidate_id: state.candidate_id,
      ...parsed,
      parser_version: 'gemini-2.0-flash',
      validation_status: validation.status
    })
    
    logger.info('CV parsed successfully', {
      candidateId: state.candidate_id,
      validationStatus: validation.status,
      issues: validation.issues
    })
    
    return {
      parsed_cv: savedParsedCV,
      status: 'parsing',
      current_node: 'parse-cv',
      attempt_count: state.attempt_count + 1
    }
    
  } catch (error) {
    logger.error('CV parsing failed', { 
      error,
      candidateId: state.candidate_id 
    })
    
    return {
      status: 'failed',
      error: `CV parsing failed: ${error instanceof Error ? error.message : String(error)}`,
      current_node: 'parse-cv'
    }
  }
}
