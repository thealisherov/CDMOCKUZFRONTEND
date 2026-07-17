/**
 * /markaz/panel — SERVER GUARD.
 * Sessiya yo'q    -> /markaz (login)
 * Student sessiya -> /markaz/tests (testlar ro'yxati)
 * Admin           -> o'qituvchi paneli (client)
 */
import { redirect } from 'next/navigation';
import { getCenterSession } from '@/lib/center-session';
import PanelClient from './PanelClient';

export const dynamic = 'force-dynamic';

export default async function CenterPanelPage() {
  const session = await getCenterSession();
  if (!session) redirect('/markaz');
  if (session.kind !== 'admin') redirect('/markaz/tests');
  return <PanelClient />;
}
