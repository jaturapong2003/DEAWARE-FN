import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { LogOutIcon } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import DEAWARE from '@/assets/deaware.webp';
import { navigationItems } from '@/lib/itemMenu';
import SettingContent from './SettingContent';

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { keycloak } = useKeycloak();
  const [openSetting, setOpenSetting] = useState(false);
  const user = useAuthStore((state) => state.user);

  const isAdmin =
    keycloak.hasRealmRole('admin') ||
    keycloak.hasResourceRole('admin', import.meta.env.VITE_CLIENT_ID) ||
    keycloak.hasResourceRole('admin', 'DEAWARE') ||
    keycloak.hasResourceRole('admin', 'DFAWARF');

  const isActive = (path: string) => {
    const current = location.pathname.replace(/\/+$/, '') || '/';
    const target = path.replace(/\/+$/, '') || '/';

    if (current === target) return true;
    if (target === '/') return current === '/';
    if (current.startsWith(`${target}/`)) return true;

    return false;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-sidebar-border from-primary/5 via-sidebar to-sidebar border-b bg-linear-to-b">
        <div className="flex items-center justify-center py-3.25 group-data-[collapsible=icon]:hidden">
          <div className="relative">
            <div className="from-primary/10 via-accent/10 to-primary/10 absolute -inset-2 rounded-lg bg-linear-to-r opacity-50 blur-sm"></div>
            <img
              src={DEAWARE}
              alt="deaware logo"
              width={150}
              height={150}
              className="relative"
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-semibold">
            เมนูหลัก
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems
                .filter((item) => item.role !== 'admin')
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                      className="group hover:bg-sidebar-accent/80 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 data-[active=true]:text-primary transition-all data-[active=true]:bg-linear-to-r data-[active=true]:shadow-sm"
                    >
                      <Link to={item.url}>
                        <item.icon className="transition-transform group-hover:scale-110" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin section separated */}
        {isAdmin && navigationItems.some((it) => it.role === 'admin') && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70 font-semibold">
              ผู้ดูแล
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems
                  .filter((item) => item.role === 'admin')
                  .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        tooltip={item.title}
                        className="group hover:bg-sidebar-accent/80 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 data-[active=true]:text-primary transition-all data-[active=true]:bg-linear-to-r data-[active=true]:shadow-sm"
                      >
                        <Link to={item.url}>
                          <item.icon className="transition-transform group-hover:scale-110" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-sidebar-border from-sidebar/50 border-t bg-linear-to-t to-transparent">
        {/* Profile summary above logout */}
        <div className="px-3 py-3">
          <div
            className="hover:bg-sidebar-accent/10 flex cursor-pointer items-center gap-3 rounded-md p-2"
            onClick={() => setOpenSetting(true)}
          >
            <Avatar className="h-10 w-10">
              {user?.url_image ? (
                <AvatarImage
                  src={user.url_image}
                  alt={user?.display_name || user?.username}
                />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {(user?.display_name || user?.username || 'ผู้ใช้')
                    .split(' ')
                    .map((s) => s[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex flex-col truncate">
              <span className="truncate text-sm font-medium">
                {user?.display_name || user?.username || 'ไม่ระบุชื่อ'}
              </span>
              {user?.email && (
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              )}
            </div>
          </div>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                useAuthStore.getState().setLoggingOut(true);
                keycloak.logout({ redirectUri: window.location.origin });
              }}
              tooltip="Logout"
              className="group hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <LogOutIcon className="transition-transform group-hover:scale-110" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
      <SettingContent
        open={openSetting}
        onClose={() => setOpenSetting(false)}
      />
    </Sidebar>
  );
};

export default AppSidebar;
