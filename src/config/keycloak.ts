import Keycloak from 'keycloak-js';

// Key environments config.
const url = import.meta.env.KEYCLOAK_URL;
const realm = import.meta.env.REALM;
const clientId = import.meta.env.KEYCLOAK_URL;

// Keycloak Configuration.
const keycloakConfig = {
  url: url || 'http://localhost:8080',
  realm: realm || 'your-realm',
  clientId: clientId || 'your-client-id',
};

// Create Keycloak instance.
const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
