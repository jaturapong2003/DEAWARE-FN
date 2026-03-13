import type { LucideIcon } from 'lucide-react';
import { HistoryIcon, HomeIcon, UsersIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  role?: string;
}

// Navigation items
export const navigationItems: NavItem[] = [
  {
    title: 'หน้าหลัก',
    url: '/',
    icon: HomeIcon,
  },
  {
    title: 'เข้า-ออกงาน',
    url: '/attendance',
    icon: HistoryIcon,
  },
  {
    title: 'พนักงาน',
    url: '/employees',
    icon: UsersIcon,
    role: 'admin',
  },
  // {
  //   title: 'ประวัติทั้งหมด',
  //   url: '/history',
  //   icon: UsersIcon,
  // },
];
