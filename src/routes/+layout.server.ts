import type { LayoutServerLoad } from './$types';
import type { UserData } from '$lib/types';

import { MONOKIT_URL } from '$env/static/private';

export const load: LayoutServerLoad = async ({ cookies }): Promise<void> => {
  const authToken = cookies.get('Authorization');

  const res = await fetch(`${MONOKIT_URL}/api/v1/auth/me`, {
    headers: { 'Content-Type': 'application/json', Authorization: authToken }
  });

  const userData: UserData = await res.json();

  cookies.set('userData', JSON.stringify(userData), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });
};
