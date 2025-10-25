// lib/gemini/parser.ts
import { geminiClient, MODELS } from './client'
import { logger } from '@/lib/utils/logger'
import { z } from 'zod'
import type { CVParseSchema } from '@/lib/types'

// Import the proper SchemaType from Google AI SDK
import { SchemaType } from '@google/generative-ai'

// Zod schema for validation
const CVSchema = z.object({
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  skills: z.string().min(5, 'Skills must be provided'),
  work_experience: z.string().min(10, 'Work experience must be provided'),
  education: z.string().min(5, 'Education must be provided'),
  languages: z.array(z.string()).optional().default([]),
  certifications: z.array(z.string()).optional().default([])
})

/**
 * Parse CV with structured output and retries
 */
export async function parseCV(
  cvText: string,
  maxRetries: number = 3
): Promise<CVParseSchema> {
  const model = geminiClient.getGenerativeModel({ 
    model: MODELS.PARSER,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          summary: {
            type: SchemaType.STRING,
            description: "A 2-3 sentence professional summary of the candidate"
          },
          skills: {
            type: SchemaType.STRING,
            description: "Comma-separated list of technical and soft skills"
          },
          work_experience: {
            type: SchemaType.STRING,
            description: "Detailed work history with companies, roles, and durations"
          },
          education: {
            type: SchemaType.STRING,
            description: "Educational background including degrees and institutions"
          },
          languages: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Languages spoken"
          },
          certifications: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Professional certifications"
          }
        },
        required: ["summary", "skills", "work_experience", "education"]
      }
    }
  })

  const prompt = `You are an expert HR assistant specializing in CV analysis. 
Extract structured information from the following CV.

INSTRUCTIONS:
- summary: Write a professional 2-3 sentence summary highlighting key strengths
- skills: List ALL technical and soft skills as a comma-separated string
- work_experience: Describe work history chronologically, include company names, roles, durations, and key responsibilities
- education: List degrees, institutions, and graduation years
- languages: Array of languages the candidate speaks
- certifications: Array of professional certifications

CV TEXT:
${cvText}

Return ONLY valid JSON matching the schema.`

  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Parsing CV (attempt ${attempt}/${maxRetries})`, { 
        cvLength: cvText.length 
      })
      
      const result = await model.generateContent(prompt)
      const responseText = result.response.text()
      
      // Parse JSON
      const parsed = JSON.parse(responseText)
      
      // Validate with Zod
      const validated = CVSchema.parse(parsed)
      
      logger.info('CV parsed successfully', { attempt })
      
      return validated
      
    } catch (error) {
      lastError = error as Error
      logger.warn(`CV parsing attempt ${attempt} failed`, { 
        error: error instanceof Error ? error.message : String(error),
        attempt 
      })
      
      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }
  
  logger.error('CV parsing failed after all retries', { 
    error: lastError,
    maxRetries 
  })
  
  throw new Error(`CV parsing failed after ${maxRetries} attempts: ${lastError?.message}`)
}

/**
 * Validate parsed CV quality
 */
export function validateParsedCV(parsed: CVParseSchema): {
  isValid: boolean
  issues: string[]
  status: 'valid' | 'needs_review' | 'invalid'
} {
  const issues: string[] = []
  
  // Check summary quality
  if (parsed.summary.length < 50) {
    issues.push('Summary is too short')
  }
  
  // Check skills
  const skillsArray = parsed.skills.split(',').map(s => s.trim()).filter(Boolean)
  if (skillsArray.length < 3) {
    issues.push('Too few skills extracted')
  }
  
  // Check work experience
  if (parsed.work_experience.length < 50) {
    issues.push('Work experience is too brief')
  }
  
  // Check education
  if (parsed.education.length < 10) {
    issues.push('Education information is incomplete')
  }
  
  // Determine status
  let status: 'valid' | 'needs_review' | 'invalid'
  if (issues.length === 0) {
    status = 'valid'
  } else if (issues.length <= 2) {
    status = 'needs_review'
  } else {
    status = 'invalid'
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    status
  }
}
