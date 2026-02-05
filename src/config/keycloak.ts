import Keycloak from 'keycloak-js';

// Keycloak Configuration
// TODO: Update the URL to match your Keycloak server
const keycloakConfig = {
  url: 'http://100.118.228.20:8081',   // Keycloak server URL
  realm: 'DEAWARE',                     // Your realm name
  clientId: 'DEAWARE',                  // Your client ID
};

// Create Keycloak instance
const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
