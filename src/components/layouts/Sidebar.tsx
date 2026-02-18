import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { SettingsIcon, LogOutIcon } from 'lucide-react';
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

const settingsItems = [
  {
    title: 'Settings',
    url: '/settings',
    icon: SettingsIcon,
  },
];

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { keycloak } = useKeycloak();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-sidebar-border from-sidebar/50 border-b bg-linear-to-b to-transparent">
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
              {navigationItems.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-semibold">
            ตั้งค่า
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="group hover:bg-sidebar-accent/80 data-[active=true]:from-accent/20 data-[active=true]:to-accent/5 data-[active=true]:text-accent transition-all data-[active=true]:bg-linear-to-r data-[active=true]:shadow-sm"
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
      </SidebarContent>
      <SidebarFooter className="border-sidebar-border from-sidebar/50 border-t bg-linear-to-t to-transparent">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
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
    </Sidebar>
  );
};

export default AppSidebar;
