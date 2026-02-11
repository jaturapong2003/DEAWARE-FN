import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

/**
 * Hook สำหรับสลับ Dark/Light Mode
 * - จำค่าที่เลือกไว้ใน localStorage
 * - เพิ่ม/ลบ class "dark" บน <html>
 */
export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // อ่านจาก localStorage ก่อน
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored) return stored;
    // ถ้าไม่มี ดูจากระบบ
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  // อัปเดต class บน <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // สลับ theme
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // ตั้งค่า theme ตรงๆ
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return { theme, toggleTheme, setTheme, isDark: theme === 'dark' };
};

export default useTheme;
