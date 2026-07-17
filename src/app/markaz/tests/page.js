/**
 * /markaz/tests — SERVER GUARD.
 * Sessiya yo'q  -> /markaz (login)
 * Admin sessiya -> /markaz/panel (o'qituvchi paneli)
 * Student      -> testlar ro'yxati (client)
 */
import { redirect } from 'next/navigation';
import { getCenterSession } from '@/lib/center-session';
import TestsClient from './TestsClient';

export const dynamic = 'force-dynamic';

export default async function CenterTestsPage() {
  const session = await getCenterSession();
  if (!session) redirect('/markaz');
  if (session.kind === 'admin') redirect('/markaz/panel');
  return <TestsClient />;
}
