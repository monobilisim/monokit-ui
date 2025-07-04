import type { LayoutServerLoad } from './$types';
import type { UserData } from '$lib/types';

import { MONOKIT_URL } from '$env/static/private';

export const load: LayoutServerLoad = async ({ cookies }) => {
  const authToken = cookies.get('Authorization');

  const res = await fetch(`${MONOKIT_URL}/api/v1/auth/me`, {
    headers: { 'Content-Type': 'application/json', Authorization: authToken }
  });

  if (res.ok) {
    const userData: UserData = await res.json();

    cookies.set('userData', JSON.stringify(userData), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
  }

  if (!res.ok) {
    console.error('Failed to fetch user data:', res.statusText);
    return {
      userData: null,
      error: {
        status: res.status,
        message: res.statusText
      }
    };
  }
};
