import { redirect } from '@sveltejs/kit';
import Config from '$lib/config';
const MONOKIT_URL = Config.MONOKIT_URL;

export const GET = async () => {
  const redirectUri = `${MONOKIT_URL}/api/v1/auth/sso/callback`;
  throw redirect(
    302,
    `${MONOKIT_URL}/api/v1/auth/sso/login?redirect_uri=${encodeURIComponent(redirectUri)}`
  );
};
