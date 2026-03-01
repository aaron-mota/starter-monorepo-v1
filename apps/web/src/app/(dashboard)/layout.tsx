import { UserButton } from '@clerk/nextjs';
import { AdminPlanToggle } from '@/components/layout/admin-plan-toggle';
import { MobileHeader } from '@/components/layout/mobile-header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-r bg-sidebar p-4 md:block">
        <SidebarNav />
      </aside>
      <main className="flex-1">
        <header className="flex h-14 items-center justify-between border-b px-6">
          <MobileHeader />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <UserButton />
          </div>
        </header>
        <div className="space-y-4 p-6">{children}</div>
      </main>
      <AdminPlanToggle />
    </div>
  );
}
