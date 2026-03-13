import { createClient } from '@/utils/supabase/server'
import WritingTestClient from '../../WritingTestClient'
import { redirect } from 'next/navigation'

async function loadTestData(testId) {
  try {
    const supabase = await createClient()
    const numericId = Number(testId)
    let testRow = null

    if (!isNaN(numericId) && numericId > 0) {
      const { data: rows, error } = await supabase
        .from('Tests')
        .select('*')
        .eq('type', 'writing')
        .order('created_at', { ascending: true })

      if (!error && rows) testRow = rows[numericId - 1] || null
    }

    if (!testRow) {
      const { data: row, error } = await supabase
        .from('Tests')
        .select('*')
        .eq('test_id', testId)
        .single()

      if (!error && row) testRow = row
    }

    return testRow ? testRow.data : null
  } catch (err) {
    console.error('[WritingReviewPage] Error loading test:', err)
    return null
  }
}

async function loadAttemptData(attemptId) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('TestAttempts')
      .select('*')
      .eq('id', attemptId)
      .single()

    if (error || !data) return null
    return data
  } catch (err) {
    console.error('[WritingReviewPage] Error loading attempt:', err)
    return null
  }
}

export default async function WritingReviewPage({ params }) {
  const { id, attemptId } = await params
  
  const [rawData, attemptData] = await Promise.all([
    loadTestData(id),
    loadAttemptData(attemptId)
  ])

  if (!rawData || !attemptData) {
    return redirect(`/dashboard/writing/${id}`)
  }

  // Pre-populate evaluation and essays
  const initialEssays = attemptData.user_answers || {}
  const initialEvaluation = attemptData.server_results || null

  return (
    <WritingTestClient 
      id={id} 
      rawData={rawData} 
      isReviewMode={true}
      initialEssays={initialEssays}
      initialEvaluation={initialEvaluation}
    />
  )
}
