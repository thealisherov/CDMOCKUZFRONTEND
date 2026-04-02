/**
 * Listening Test Page — Server Component
 *
 * Fetches SANITISED test data from Supabase (via internal API or direct query),
 * then passes it to the Client Component for rendering.
 *
 * The data adapter runs CLIENT-SIDE (in ListeningTestClient) so that
 * all interactivity remains intact.
 */
import { createClient } from '@/utils/supabase/server'
import { sanitizeTestData } from '@/utils/sanitizeTestData'
import { adaptListeningData } from '@/utils/listeningDataAdapter'
import ListeningTestClient from './ListeningTestClient'

async function loadTestData(testId) {
  try {
    const supabase = await createClient()
    const numericId = Number(testId)

    let testRow = null

    // Strategy 1: numeric ID → fetch by type + position
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

    // Strategy 2: string test_id → direct lookup
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

    // SECURITY: Strip answers before sending to client
    const safeData = sanitizeTestData(testRow.data)

    // Apply adapter to transform into internal format
    return adaptListeningData(safeData)
  } catch (err) {
    console.error('[ListeningTestPage] Error loading test:', err)
    return null
  }
}

import { generateTestMetadata } from '@/utils/seoTestMetadata';

export async function generateMetadata({ params }) {
  const resolvedParams = await Promise.resolve(params);
  return generateTestMetadata({ id: resolvedParams?.id, type: 'listening' });
}

export default async function ListeningTestPage({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;
  const rawData = await loadTestData(id)

  return <ListeningTestClient id={id} rawData={rawData} />
}