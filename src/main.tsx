import { createRoot } from 'react-dom/client';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import './index.css';
import App from './App.tsx';

// Polyfill crypto.randomUUID สำหรับ non-secure context (HTTP + IP)
// crypto.getRandomValues ใช้ได้ทุก context แต่ crypto.randomUUID ต้องใช้ HTTPS
if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  crypto.randomUUID =
    function (): `${string}-${string}-${string}-${string}-${string}` {
      return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
        (
          +c ^
          (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
        ).toString(16)
      ) as `${string}-${string}-${string}-${string}-${string}`;
    };
}

import keycloak from './config/keycloak';

// Render ReactKeycloakProvider
createRoot(document.getElementById('root')!).render(
  <ReactKeycloakProvider
    authClient={keycloak}
    initOptions={{
      onLoad: 'login-required', // บังคับ login ก่อนเข้าใช้งาน
      checkLoginIframe: false, // ปิด iframe check
      pkceMethod: false, // ปิด PKCE เพราะ HTTP ไม่มี crypto.subtle — เปลี่ยนเป็น 'S256' เมื่อใช้ HTTPS
    }}
  >
    <App />
  </ReactKeycloakProvider>
);
