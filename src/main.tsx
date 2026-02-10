import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import './index.css';
import App from './App.tsx';
import keycloak from './config/keycloak';
import KeycloakLoading from './components/KeycloakLoading';

// Render แอปพลิเคชันพร้อม ReactKeycloakProvider
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        onLoad: 'login-required', // บังคับ login ก่อนเข้าใช้งาน
        pkceMethod: 'S256', // ใช้ PKCE สำหรับความปลอดภัย
        checkLoginIframe: false, // ปิด iframe check
      }}
      LoadingComponent={<KeycloakLoading />}
    >
      <App />
    </ReactKeycloakProvider>
  </StrictMode>
);
