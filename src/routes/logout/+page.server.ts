import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { MONOKIT_URL } from '$env/static/private';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
  const authToken = cookies.get('Authorization');

  try {
    await fetch(`${MONOKIT_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      } as Record<string, string>
    });
  } catch (error) {
    console.error(error);
  }

  throw redirect(303, '/login');
};
