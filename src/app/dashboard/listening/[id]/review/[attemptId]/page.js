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

    // Strategy 1: numeric ID → fetch single target test using SQL offset
    if (!isNaN(numericId) && numericId > 0) {
      const { data: row, error } = await supabase
        .from('Tests')
        .select('*')
        .eq('type', 'listening')
        .is('center_id', null)
        .order('created_at', { ascending: true })
        .range(numericId - 1, numericId - 1)
        .maybeSingle()

      if (!error && row) {
        testRow = row
      }
    }

    if (!testRow) {
      const { data: row, error } = await supabase
        .from('Tests')
        .select('*')
        .eq('test_id', testId)
        .is('center_id', null)
        .maybeSingle()

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
