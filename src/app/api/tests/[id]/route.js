/**
 * GET /api/tests/[id]
 *
 * Returns a SINGLE test with full question data but WITHOUT answers.
 *
 * The `id` parameter can be:
 *   - A numeric position index (e.g. "1", "2") matched by type + order
 *   - The actual test_id string (e.g. "listening-test-1-clarence-house")
 *
 * Query params:
 *   ?type=listening   → required when using numeric ID to identify test position
 *
 * Response: The full test JSON with answer/alternativeAnswers fields REMOVED.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sanitizeTestData } from '@/utils/sanitizeTestData'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'listening' | 'reading'

    const supabase = await createClient()
    let testRow = null

    // ── Strategy 1: numeric ID → fetch by type + position ──
    const numericId = Number(id)
    if (!isNaN(numericId) && numericId > 0 && type) {
      const { data: rows, error } = await supabase
        .from('Tests')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('[API /api/tests/[id]] Supabase error:', error)
        return NextResponse.json({ error: 'Ma\'lumotlarni olishda xatolik' }, { status: 500 })
      }

      // Position is 1-based (id=1 → first test of that type)
      testRow = rows?.[numericId - 1] || null
    }

    // ── Strategy 2: string test_id → direct lookup ──
    if (!testRow) {
      const { data: row, error } = await supabase
        .from('Tests')
        .select('*')
        .eq('test_id', id)
        .single()

      if (!error && row) {
        testRow = row
      }
    }

    if (!testRow) {
      return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 })
    }

    // ── SECURITY: Strip all answers before sending to client ──
    const safeData = sanitizeTestData(testRow.data)

    return NextResponse.json(safeData)
  } catch (err) {
    console.error('[API /api/tests/[id]] Unexpected error:', err)
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 })
  }
}
