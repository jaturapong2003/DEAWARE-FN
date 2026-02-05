import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useAuthStore } from './stores/authStore'
import { ReactKeycloakProvider } from '@react-keycloak/web'
import keycloak from './config/keycloak'

// Event handler to sync Keycloak with Zustand store
const eventHandler = (event: string) => {
  
  if (event === 'onAuthSuccess' || event === 'onReady') {
    if (keycloak.authenticated) {
      useAuthStore.setState({
        isAuthenticated: true,
        isLoading: false,
        token: keycloak.token || null,
      })
      // Load user profile
      keycloak.loadUserProfile().then((profile) => {
        useAuthStore.setState({
          user: {
            id: profile.id,
            username: profile.username,
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
          },
        })
      }).catch(console.error)
    } else {
      useAuthStore.setState({
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }
  
  if (event === 'onAuthLogout') {
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      token: null,
    })
  }
}

// Token handler to update token in store
const tokenHandler = (tokens: { token?: string }) => {
  if (tokens.token) {
    useAuthStore.setState({ token: tokens.token })
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReactKeycloakProvider
      authClient={keycloak}
      onEvent={eventHandler}
      onTokens={tokenHandler}
      initOptions={{
        onLoad: 'login-required',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      }}
    >
      <App />
    </ReactKeycloakProvider>
  </StrictMode>,
)
