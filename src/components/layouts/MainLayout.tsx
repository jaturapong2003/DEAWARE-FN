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

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-lg font-semibold">
              {navigationItems.find((item) => isActive(item.url))?.title ||
                'DEAWARE'}
            </h1>

            {/* ปุ่มสลับ Dark/Light Mode */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
              title={
                theme === 'dark'
                  ? 'เปลี่ยนเป็น Light Mode'
                  : 'เปลี่ยนเป็น Dark Mode'
              }
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;
