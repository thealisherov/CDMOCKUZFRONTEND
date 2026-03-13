/**
 * Listening Review Page — Server Component
 */
import { createClient } from '@/utils/supabase/server'
import { adaptListeningData } from '@/utils/listeningDataAdapter'
import ReviewTestClient from '@/components/ReviewTestClient'

async function loadTestData(testId) {
  try {
    const supabase = await createClient()
    const numericId = Number(testId)

    let testRow = null

    if (!isNaN(numericId) && numericId > 0) {
      const { data: rows, error } = await supabase
        .from('Tests')
        .select('*')
        .eq('type', 'listening')
        .order('created_at', { ascending: true })

      if (!error && rows) {
        testRow = rows[numericId - 1] || null
      }
    }

    if (!testRow) {
      const { data: row, error } = await supabase
        .from('Tests')
        .select('*')
        .eq('test_id', testId)
        .single()

      if (!error && row) {
        testRow = row
      }
    }

    if (!testRow) return null

    // For review mode, we keep answers in the data (NOT sanitized)
    return adaptListeningData(testRow.data)
  } catch (err) {
    console.error('[ListeningReviewPage] Error loading test:', err)
    return null
  }
}

export default async function ListeningReviewPage({ params }) {
  const { id, attemptId } = await params
  const rawData = await loadTestData(id)

  return (
    <ReviewTestClient 
      testId={id} 
      attemptId={attemptId} 
      rawData={rawData} 
      moduleType="listening" 
    />
  )
}
