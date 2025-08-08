import { json, type RequestHandler } from '@sveltejs/kit';
import Config from '$lib/config';
const MONOKIT_URL = Config.MONOKIT_URL;

export const GET: RequestHandler = async ({ cookies, fetch }) => {
  const authToken = cookies.get('Authorization');

  const response = await fetch(`${MONOKIT_URL}/api/v1/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    } as Record<string, string>
  });

  if (!response.ok) {
    return json({ logout: false }, { status: response.status });
  }

  cookies.delete('Authorization', { path: '/' });
  cookies.delete('userData', { path: '/' });
  return json({ logout: true });
};
