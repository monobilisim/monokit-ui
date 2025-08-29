import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import Config from '$lib/config';

const MONOKIT_URL = Config.MONOKIT_URL;

const PUBLIC_ROUTES = [
  '/login',
  '/login/route',
  `${MONOKIT_URL}/api/v1/auth/sso/callback`,
  `${MONOKIT_URL}/api/v1/auth/sso/login?redirect_uri=${MONOKIT_URL}/api/v1/auth/sso/callback`,
  `${MONOKIT_URL}/api/v1/auth/sso/login?redirect_uri=${encodeURIComponent(`${MONOKIT_URL}/api/v1/auth/sso/callback`)}`
];

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('Authorization');

  const ALLOWED_ORIGINS = Config.ORIGINS;

  if (!token && !PUBLIC_ROUTES.includes(event.url.pathname)) {
    throw redirect(303, '/login');
  }

  const origin = event.request.headers.get('origin');
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new Response('Forbidden: Invalid Origin', {
      status: 403
    });
  }

  const response = await resolve(event);
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  return response;
};
