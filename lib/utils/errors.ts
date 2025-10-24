// Custom error classes
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'INTERNAL_ERROR',
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'NOT_FOUND', 404, details)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'UNAUTHORIZED', 401, details)
    this.name = 'UnauthorizedError'
  }
}

export class WorkflowError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'WORKFLOW_ERROR', 500, details)
    this.name = 'WorkflowError'
  }
}

export class EmbeddingError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'EMBEDDING_ERROR', 500, details)
    this.name = 'EmbeddingError'
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, 'INTERNAL_ERROR', 500, { originalError: error.stack })
  }
  
  return new AppError('An unknown error occurred', 'UNKNOWN_ERROR', 500)
}
