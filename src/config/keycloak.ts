import Keycloak from 'keycloak-js';

// ตั้งค่า environment variables
const url = import.meta.env.VITE_KEYCLOAK_URL;
const realm = import.meta.env.VITE_REALM;
const clientId = import.meta.env.VITE_CLIENT_ID;

// การตั้งค่า Keycloak
const keycloakConfig = {
  url: url,
  realm: realm,
  clientId: clientId,
};

// สร้าง Keycloak instance
const keycloak = new Keycloak(keycloakConfig);



export default keycloak;


