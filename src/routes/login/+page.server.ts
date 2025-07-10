import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { UserData } from '$lib/types';

export const load: PageServerLoad = async ({ cookies }): Promise<void> => {
  const authToken = cookies.get('Authorization');

  if (authToken) {
    redirect(301, '/');
  }
};

const MONOKIT_URL = Bun.env.MONOKIT_URL;

export const actions: Actions = {
  login: async ({ request, cookies, fetch }) => {
    const form = await request.formData();
    const username = form.get('username');
    const password = form.get('password');

    if (!username || !password) {
      return fail(400, {
        type: 'error',
        error: 'Username and password are required.'
      });
    }

    const res = await fetch(`${MONOKIT_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return fail(res.status, {
        type: 'error',
        error: data.error || 'Login failed.'
      });
    }

    type LoginData = {
      token: string;
      user: UserData;
    };

    const data: LoginData = await res.json();
    const token = data.token;
    const userData = data.user;

    if (!token) {
      return fail(400, {
        type: 'error',
        error: 'No token received from server.'
      });
    }

    cookies.set('Authorization', `${token}`, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    cookies.set('userData', JSON.stringify(userData), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    throw redirect(303, '/');
  }
  // keycloak: async () => {
  //   const redirectUri = encodeURIComponent(`${MONOKIT_URL}/api/v1/auth/sso/callback`);
  //   redirect(302, `${MONOKIT_URL}/api/v1/auth/sso/login?redirect_uri=${redirectUri}`);
  // }
};
