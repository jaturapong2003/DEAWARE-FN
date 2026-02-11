import { HistoryIcon, HomeIcon, UsersIcon } from 'lucide-react';

// Navigation items
export const navigationItems = [
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
  },
  {
    title: 'ประวัติทั้งหมด',
    url: '/history',
    icon: UsersIcon,
  },
];
