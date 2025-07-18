import type { LayoutServerLoad } from './$types';
import type { UserData, AlertMessage } from '$lib/types';
import { redirect } from '@sveltejs/kit';
const MONOKIT_URL = Bun.env.MONOKIT_URL;

export const load: LayoutServerLoad = async ({ cookies }) => {
  const authToken = cookies.get('Authorization');

  const res = await fetch(`${MONOKIT_URL}/api/v1/auth/me`, {
    headers: { 'Content-Type': 'application/json', Authorization: authToken } as Record<
      string,
      string
    >
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

    return {
      userData,
      alerts: []
    };
  }

  if (!res.ok) {
    cookies.delete('Authorization', { path: '/' });
    cookies.delete('userData', { path: '/' });

    const alerts: AlertMessage[] = [
      {
        type: 'error',
        message: `Authentication failed: ${res.statusText}`
      }
    ];
    return {
      userData: null,
      alerts
    };
  }

  const userData = cookies.get('userData');

  if (userData) {
    return {
      userData: JSON.parse(userData),
      alerts: []
    };
  } else {
    redirect(301, '/login');
    return {
      userData: null,
      alerts: []
    };
  }
};
