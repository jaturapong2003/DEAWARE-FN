import keycloak from './keycloak';

export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  if (!keycloak.authenticated) {
    throw new Error('Not authenticated');
  }

  // refresh token if expiring in 30s
  await keycloak.updateToken(30);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${keycloak.token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
