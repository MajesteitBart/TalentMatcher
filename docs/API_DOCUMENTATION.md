# Talent Matcher API Documentation

## Overview

The Talent Matcher API provides RESTful endpoints for managing candidates, jobs, applications, and workflow operations. This document outlines the available endpoints, request/response formats, and validation rules.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API uses Supabase authentication. Include your Supabase auth token in the Authorization header:

```http
Authorization: Bearer <your-supabase-token>
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true|false,
  "data": {...}, // Only present when success: true
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": [...] // Optional validation error details
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request data validation failed |
| `NOT_FOUND` | Resource not found |
| `DATABASE_ERROR` | Database operation failed |
| `INTERNAL_ERROR` | Internal server error |
| `UNAUTHORIZED` | Authentication required |

## Endpoints

### Jobs

#### Create Job

```http
POST /api/jobs
```

**Request Body:**
```json
{
  "company_id": "00000000-0000-0000-0000-000000000001",
  "title": "Software Engineer",
  "description": "Job description with detailed requirements...",
  "required_skills": ["JavaScript", "React", "Node.js"],
  "experience_level": "mid",
  "department": "Engineering",
  "location": "Remote",
  "job_type": "full-time",
  "status": "active"
}
```

**Validation Rules:**
- `company_id`: Must be a valid UUID (regex: `^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)
- `title`: Required, max 200 characters
- `description`: Required, max 20,000 characters
- `required_skills`: Optional array, max 20 items, each max 100 characters
- `experience_level`: Required enum: `entry`, `mid`, `senior`, `lead`, `executive`
- `department`: Optional, max 100 characters
- `location`: Optional, max 200 characters
- `job_type`: Required enum: `full-time`, `part-time`, `contract`, `internship`
- `status`: Optional enum: `active`, `closed`, `draft` (default: `active`)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "job-uuid",
    "company_id": "company-uuid",
    "title": "Software Engineer",
    "description": "...",
    "required_skills": ["JavaScript", "React"],
    "experience_level": "mid",
    "department": "Engineering",
    "location": "Remote",
    "job_type": "full-time",
    "status": "active",
    "created_at": "2025-01-01T00:00:00Z",
    "company": {
      "id": "company-uuid",
      "name": "Tech Company",
      "domain": "techcompany.com"
    }
  }
}
```

#### Index Jobs for Vector Search

```http
POST /api/jobs/index
```

**Request Body:**
```json
{
  "company_id": "00000000-0000-0000-0000-000000000001",
  "job_ids": ["job-uuid-1", "job-uuid-2"] // Optional - indexes all active jobs if omitted
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "indexed_count": 25,
    "message": "Successfully indexed jobs for vector search"
  }
}
```

### Candidates

#### Reject Candidate & Trigger Matching

```http
POST /api/candidates/reject
```

**Request Body:**
```json
{
  "candidate_id": "candidate-uuid",
  "application_id": "application-uuid",
  "rejection_reason": "Not enough experience"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workflow_execution_id": "workflow-uuid",
    "message": "Candidate rejection processing started"
  }
}
```

### Applications

#### Update Application Status

```http
PATCH /api/applications/{id}/status
```

**Request Body:**
```json
{
  "status": "rejected",
  "rejection_reason": "Not a good fit for the role"
}
```

**Validation Rules:**
- `status`: Required enum: `applied`, `under_review`, `interview_scheduled`, `offer_extended`, `hired`, `rejected`
- `rejection_reason`: Optional string, required when status is `rejected`

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Application status updated to rejected",
    "status": "rejected",
    "previous_status": "under_review"
  }
}
```

#### Get Application Status

```http
GET /api/applications/{id}/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "application": {
      "id": "app-uuid",
      "status": "rejected",
      "candidate": {
        "id": "candidate-uuid",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "job": {
        "id": "job-uuid",
        "title": "Software Engineer",
        "department": "Engineering"
      }
    },
    "status_history": [
      {
        "old_status": "under_review",
        "new_status": "rejected",
        "rejection_reason": "Not a good fit",
        "changed_at": "2025-01-01T12:00:00Z"
      }
    ]
  }
}
```

### Workflow

#### Get Workflow Status

```http
GET /api/workflow/status/{workflow_execution_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "workflow-uuid",
    "status": "completed",
    "candidate_id": "candidate-uuid",
    "started_at": "2025-01-01T12:00:00Z",
    "completed_at": "2025-01-01T12:00:15Z",
    "match_results": [
      {
        "job_id": "job-uuid",
        "title": "Senior Developer",
        "match_score": 0.85,
        "match_reasons": ["Strong skills match", "Relevant experience"]
      }
    ]
  }
}
```

## Validation Error Examples

### Job Creation Validation Error

```json
{
  "success": false,
  "error": {
    "message": "Invalid request data",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "path": ["company_id"],
        "message": "Invalid company ID format"
      },
      {
        "path": ["experience_level"],
        "message": "Invalid enum value"
      }
    ]
  }
}
```

## Recent Updates (November 2025)

### Validation Fixes
- Fixed company ID validation to accept proper UUID format
- Updated experience level enum validation
- Increased job description character limit from 5,000 to 20,000
- Fixed TypeScript errors with ZodError handling

### New Features
- Added comprehensive Claude Code development infrastructure
- Enhanced error handling with detailed validation messages
- Added application status history tracking
- Improved authentication checks in status endpoints

## Development Tools

The project now includes comprehensive Claude Code agents for:

- **Code Analysis**: Deep code review and bug detection
- **Testing**: Automated test execution and analysis
- **Documentation**: Automatic documentation generation
- **Project Management**: Epic and issue tracking
- **Design Review**: UI/UX consistency verification

See the [Developer Guide](./DEVELOPER_GUIDE.md) for more information on using these tools.