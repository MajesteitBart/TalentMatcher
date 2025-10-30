import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/client'
import { z } from 'zod'
import type { APIResponse } from '@/lib/types'
import type { Database } from '@/lib/types/database'

const UpdateApplicationStatusSchema = z.object({
  status: z.enum(['applied', 'under_review', 'interview_scheduled', 'offer_extended', 'hired', 'rejected']),
  rejection_reason: z.string().optional()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<APIResponse>> {
  try {
    const applicationId = params.id
    const body = await request.json()
    const { status, rejection_reason } = UpdateApplicationStatusSchema.parse(body)

    // Get authenticated user
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED'
        }
      }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Get current application status for history tracking
    const { data: currentApplication, error: fetchError } = await adminClient
      .from('applications')
      .select('status')
      .eq('id', applicationId)
      .single()

    if (fetchError || !currentApplication) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Application not found',
          code: 'NOT_FOUND'
        }
      }, { status: 404 })
    }

    // Don't update if status is the same
    if (currentApplication.status === status) {
      return NextResponse.json({
        success: true,
        data: {
          message: 'Status is already set to ' + status,
          status: status
        }
      })
    }

    // Start a transaction-like operation
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    }

    // Add rejection-specific fields if rejecting
    if (status === 'rejected') {
      updates.rejected_at = new Date().toISOString()
      updates.rejection_reason = rejection_reason || null
    } else {
      // Clear rejection fields if not rejected
      updates.rejected_at = null
      updates.rejection_reason = null
    }

    // Update application status
    const { error: updateError } = await adminClient
      .from('applications')
      .update(updates)
      .eq('id', applicationId)

    if (updateError) {
      throw updateError
    }

    // Record status change in history
    const { error: historyError } = await (adminClient
      .from('application_status_history') as any)
      .insert({
        application_id: applicationId,
        old_status: currentApplication.status,
        new_status: status,
        changed_by: user.id,
        rejection_reason: status === 'rejected' ? rejection_reason : null,
        changed_at: new Date().toISOString()
      })

    if (historyError) {
      // Log the error but don't fail the request
      console.error('Failed to record status history:', historyError)
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Application status updated to ${status}`,
        status: status,
        previous_status: currentApplication.status
      }
    })

  } catch (error) {
    console.error('Application status update error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Invalid request data',
          code: 'VALIDATION_ERROR',
          details: error.errors
        }
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<APIResponse>> {
  try {
    const applicationId = params.id

    const adminClient = createAdminClient()

    // Get application with status history
    const { data: application, error: appError } = await adminClient
      .from('applications')
      .select(`
        *,
        candidate:candidates(
          id,
          name,
          email,
          phone
        ),
        job:jobs(
          id,
          title,
          department,
          location
        )
      `)
      .eq('id', applicationId)
      .single()

    if (appError || !application) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Application not found',
          code: 'NOT_FOUND'
        }
      }, { status: 404 })
    }

    // Get status history
    const { data: history, error: historyError } = await (adminClient
      .from('application_status_history') as any)
      .select(`
        *,
        changer:auth.users(
          email,
          raw_user_meta_data->>'name'
        )
      `)
      .eq('application_id', applicationId)
      .order('changed_at', { ascending: false })

    return NextResponse.json({
      success: true,
      data: {
        application,
        status_history: history || []
      }
    })

  } catch (error) {
    console.error('Application fetch error:', error)

    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    }, { status: 500 })
  }
}