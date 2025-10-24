// lib/gemini/embeddings.ts
import { geminiClient, MODELS } from './client'
import { logger } from '@/lib/utils/logger'

const embeddingModel = geminiClient.getGenerativeModel({ 
  model: MODELS.EMBEDDINGS 
})

/**
 * Generate a single embedding
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const result = await embeddingModel.embedContent(text)
    return result.embedding.values
  } catch (error) {
    logger.error('Failed to generate embedding', { error, textLength: text.length })
    throw new Error(`Embedding generation failed: ${error}`)
  }
}

/**
 * Generate embeddings in batch (more efficient)
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const batchSize = 100 // Gemini supports up to 100 per batch
    const allEmbeddings: number[][] = []
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize)
      
      const requests = batch.map(text => ({
        content: { parts: [{ text }] }
      }))
      
      const result = await embeddingModel.batchEmbedContents({ requests })
      const embeddings = result.embeddings.map(e => e.values)
      
      allEmbeddings.push(...embeddings)
      
      logger.info(`Generated embeddings batch ${i / batchSize + 1}`, {
        batchSize: batch.length,
        totalProcessed: allEmbeddings.length
      })
    }
    
    return allEmbeddings
  } catch (error) {
    logger.error('Batch embedding generation failed', { error, textCount: texts.length })
    throw new Error(`Batch embedding generation failed: ${error}`)
  }
}

/**
 * Generate job embeddings (full, skills, experience)
 */
export interface JobEmbeddingSet {
  full: number[]
  skills: number[]
  experience: number[]
}

export async function generateJobEmbeddings(job: {
  title: string
  description: string
  required_skills: string[]
  experience_level: string
}): Promise<JobEmbeddingSet> {
  const fullText = `${job.title}\n\n${job.description}\n\nRequired Skills: ${job.required_skills.join(', ')}`
  const skillsText = `${job.title}\n\nSkills: ${job.required_skills.join(', ')}`
  const experienceText = `${job.title}\n\nExperience Level: ${job.experience_level}`
  
  const [full, skills, experience] = await generateEmbeddings([
    fullText,
    skillsText,
    experienceText
  ])
  
  return { full, skills, experience }
}

/**
 * Generate candidate profile embeddings
 */
export interface CandidateEmbeddingSet {
  skills: number[]
  experience: number[]
  full: number[]
}

export async function generateCandidateEmbeddings(parsedCV: {
  summary: string
  skills: string
  work_experience: string
}): Promise<CandidateEmbeddingSet> {
  const fullText = `${parsedCV.summary}\n\nSkills: ${parsedCV.skills}\n\nExperience: ${parsedCV.work_experience}`
  
  const [skills, experience, full] = await generateEmbeddings([
    parsedCV.skills,
    parsedCV.work_experience,
    fullText
  ])
  
  return { skills, experience, full }
}
