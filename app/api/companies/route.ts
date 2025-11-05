import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await (supabase
      .from('companies') as any)
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: { message: 'Failed to fetch companies', code: 'FETCH_FAILED' } },
        { status: 400 }
      )
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const { data, error } = await (supabase
      .from('companies') as any)
      .insert({
        name: body.name,
        domain: body.domain || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating company:', error)
      return NextResponse.json(
        { error: { message: 'Failed to create company', code: 'CREATE_FAILED' } },
        { status: 400 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    )
  }
}