// lib/gemini/analyzer.ts
import { geminiClient, MODELS } from './client'
import { logger } from '@/lib/utils/logger'
import type { ParsedCV, ConsolidatedMatch, Job } from '@/lib/types'

export interface AnalysisResult {
  markdown: string
  summary: string
  recommendations: Array<{
    jobId: string
    reasoning: string
    fitScore: number
  }>
}

/**
 * Generate final match analysis
 */
export async function analyzeMatches(
  candidateName: string,
  parsedCV: ParsedCV,
  rejectedJob: Job,
  topMatches: ConsolidatedMatch[],
  matchedJobs: Job[]
): Promise<AnalysisResult> {
  const model = geminiClient.getGenerativeModel({ model: MODELS.ANALYZER })

  // Build job details
  const jobDetails = matchedJobs.map((job, index) => {
    const match = topMatches[index]
    return `
### Match ${index + 1}: ${job.title}
**Department:** ${job.department || 'Not specified'}
**Experience Level:** ${job.experience_level}
**Match Score:** ${(match.composite_score * 100).toFixed(1)}%
**Match Sources:** ${Object.keys(match.source_scores).join(', ')}

**Job Description:**
${job.description}

**Required Skills:**
${job.required_skills.join(', ')}
`
  }).join('\n\n---\n\n')

  const prompt = `You are a Senior Recruitment Consultant. Analyze potential job matches for a rejected candidate.

# CANDIDATE PROFILE

**Name:** ${candidateName}
**Original Application:** ${rejectedJob.title} (Rejected)

## Professional Summary
${parsedCV.summary}

## Skills
${parsedCV.skills}

## Work Experience
${parsedCV.work_experience}

## Education
${parsedCV.education}

---

# ALTERNATIVE JOB OPPORTUNITIES

Our AI system has identified ${topMatches.length} potential alternative positions that may be a better fit:

${jobDetails}

---

# YOUR TASK

Write a **comprehensive internal recruitment memo** analyzing each alternative position. For each match:

1. **Why This Could Be A Good Fit:** Identify specific overlaps between the candidate's profile and the job requirements
2. **Skill Alignment:** Reference specific skills from the CV that match the role
3. **Experience Relevance:** Explain how their work history prepares them for this position
4. **Potential Concerns:** Be honest about any gaps or areas of concern
5. **Recommendation:** Rate the fit (Excellent/Good/Fair) and suggest next steps

Format your response as a professional memo in Markdown. Be specific, reference actual details from the CV and job descriptions, and be both encouraging and realistic.`

  try {
    const result = await model.generateContent(prompt)
    const markdown = result.response.text()
    
    // Extract summary (first paragraph)
    const lines = markdown.split('\n').filter(l => l.trim())
    const summary = lines.slice(0, 3).join(' ').substring(0, 250) + '...'
    
    // Parse recommendations (simplified - could be enhanced)
    const recommendations = topMatches.map((match, i) => ({
      jobId: match.job_id,
      reasoning: `Based on ${Object.keys(match.source_scores).join(' and ')} matching`,
      fitScore: match.composite_score
    }))
    
    logger.info('Match analysis generated successfully', {
      matchCount: topMatches.length,
      analysisLength: markdown.length
    })
    
    return {
      markdown,
      summary,
      recommendations
    }
    
  } catch (error) {
    logger.error('Match analysis generation failed', { error })
    throw new Error(`Analysis generation failed: ${error}`)
  }
}
