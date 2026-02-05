import Keycloak from 'keycloak-js';

// Keycloak Configuration
// TODO: Update these values to match your Keycloak server
const keycloakConfig = {
  url: 'http://localhost:8080',        // Keycloak server URL
  realm: 'your-realm',                  // Your realm name
  clientId: 'your-client-id',          // Your client ID
};

// Create Keycloak instance
const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
