import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sanitizeTestData } from '@/utils/sanitizeTestData';
import { adaptReadingData } from '@/utils/readingDataAdapter';

export async function GET(request) {
  try {
    const supabase = await createClient()
    const numericId = 1
    let testRow = null
    const { data: rows, error } = await supabase
      .from('Tests')
      .select('*')
      .eq('type', 'reading')
      .order('created_at', { ascending: true })

    if (!error && rows) {
      testRow = rows[numericId - 1] || null
    }

    if (!testRow) return NextResponse.json({ error: 'No testRow' }, { status: 404 });

    const safeData = sanitizeTestData(testRow.data)
    const finalData = adaptReadingData(safeData)
    return NextResponse.json(finalData);
  } catch (err) {
    return NextResponse.json({ 
      error: 'CRASH', 
      message: err.message, 
      stack: err.stack 
    }, { status: 500 });
  }
}
