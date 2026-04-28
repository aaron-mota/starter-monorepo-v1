/**
 * TEMPLATE — Server-rendered sidebar entry for this entity.
 *
 * Lives in `server/` so it can be rendered in the dashboard layout without the 'use client'
 * bundle cost. Real implementation should compose with the dashboard's existing nav primitives
 * (e.g. shadcn's sidebar) and use TYPE.icon / TYPE.path from the entity's _config.
 */

import Link from 'next/link';
import { TYPE } from '../client/_config';

export function SidebarMenuItem() {
  return (
    <Link href={`/${TYPE.path}`} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted">
      {TYPE.display.plural}
    </Link>
  );
}
