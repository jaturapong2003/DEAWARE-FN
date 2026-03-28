import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useKeycloak } from '@react-keycloak/web';

export interface LiveActivity {
  id: string;
  employeeId: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  action: 'check_in' | 'check_out';
  time: string; // ISO string
  device: string | null;
}

import { showAttendanceToast } from '@/components/ui/attendance-toast';

/**
 * Hook สำหรับจัดการ WebSocket เพื่อรับข้อมูล Attendance แบบ Real-time
 * จะอัปเดตข้อมูลเข้าไปใน React Query Cache ('live-activity') ทันทีที่ได้รับ Event
 */
export const useAttendanceSocket = () => {
  const queryClient = useQueryClient();
  const { keycloak } = useKeycloak();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let isMounted = true;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    
    // 1. ตรวจสอบสิทธิ์ (Admin เท่านั้น)
    const isAdmin =
      keycloak.hasRealmRole('admin') ||
      keycloak.hasResourceRole('admin', import.meta.env.VITE_CLIENT_ID);
    
    if (!isAdmin || !keycloak.authenticated) return;

    // 2. กำหนด WebSocket URL
    const wsUrl = import.meta.env.VITE_WS_URL || 
                 (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + 
                 window.location.host + '/ws/attendance';

    // 3. เริ่มการเชื่อมต่อ
    const connect = () => {
      if (!isMounted) return;

      // ปิดอันเก่าก่อนเปิดอันใหม่เสมอ
      if (socketRef.current) {
        socketRef.current.close();
      }

      const socket = new WebSocket(`${wsUrl}?token=${keycloak.token}`);
      socketRef.current = socket;

      socket.onopen = () => {
        if (!isMounted) return;
        console.log('✅ Attendance WebSocket Connected');
      };

      socket.onmessage = async (event) => {
        if (!isMounted) return;
        try {
          const data = JSON.parse(event.data);
          const { user_name, status, checked_at, record_id } = data;

          if (!user_name || !status || !checked_at) return;

          const action: 'check_in' | 'check_out' =
            status === 'update_check_in' ? 'check_in' : 'check_out';

          const todayStr = new Date().toISOString().split('T')[0];
          const isoTime = `${todayStr}T${checked_at}`;

          queryClient.setQueryData<LiveActivity[]>(['live-activity'], (old = []) => {
            const newActivity: LiveActivity = {
              id: record_id || `ws-${Date.now()}`,
              employeeId: 'ai-detected',
              displayName: user_name,
              email: '',
              avatarUrl: undefined,
              action,
              time: isoTime,
              device: 'AI',
            };

            showAttendanceToast(user_name, action);

            const combined = [newActivity, ...old];
            return combined.sort(
              (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
            );
          });
        } catch (error) {
          console.error('❌ WS Message Error:', error);
        }
      };

      socket.onclose = (e) => {
        if (!isMounted) return;
        console.log('⚠️ Attendance WebSocket Closed. Reconnecting...', e.reason);
        reconnectTimeout = setTimeout(connect, 5000); 
      };

      socket.onerror = (err) => {
        console.error('❌ WebSocket Error:', err);
        socket.close();
      };
    };

    connect();

    // 4. Cleanup เมื่อปิด Component
    return () => {
      isMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socketRef.current) {
        socketRef.current.onclose = null; // ป้องกันไม่ให้ onclose ยิง connect ซ้ำตอนเราจงใจปิด
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [keycloak.authenticated, keycloak.token]);

  return null;
};
