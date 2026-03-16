import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import AppSidebar from './Sidebar';
import { navigationItems } from '@/lib/itemMenu';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="relative z-0">
        {/* Subtle Brand Background Glow */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.06] via-background to-background dark:from-primary/[0.12]" />

        <header className="shrink-0 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="h-0.5 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
          <div className="flex h-14 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-sm font-semibold text-foreground">
              {navigationItems.find((item) => isActive(item.url))?.title ||
                'DEAWARE'}
            </h1>

            {/* ปุ่มสลับ Dark/Light Mode */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
              title={
                theme === 'dark'
                  ? 'เปลี่ยนเป็น Light Mode'
                  : 'เปลี่ยนเป็น Dark Mode'
              }
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-yellow-400" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;
