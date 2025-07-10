import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

const MONOKIT_URL = Bun.env.MONOKIT_URL;

const PUBLIC_ROUTES = [
  '/login',
  '/login/route',
  `${MONOKIT_URL}/api/v1/auth/sso/callback`,
  `${MONOKIT_URL}/api/v1/auth/sso/login?redirect_uri=${MONOKIT_URL}/api/v1/auth/sso/callback`,
  `${MONOKIT_URL}/api/v1/auth/sso/login?redirect_uri=${encodeURIComponent(`${MONOKIT_URL}/api/v1/auth/sso/callback`)}`
];

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('Authorization');

  if (!token && !PUBLIC_ROUTES.includes(event.url.pathname)) {
    throw redirect(303, '/login');
  }

  return resolve(event);
};
