import type { PageServerLoad } from './$types';
import type { UserPageData } from '$lib/types';
import { fail } from '@sveltejs/kit';
import Config from '$lib/config';
const MONOKIT_URL = Config.MONOKIT_URL;

export const load: PageServerLoad = async ({ cookies, fetch, params }) => {
  const authToken = cookies.get('Authorization');

  if (!authToken) {
    return fail(401, { message: 'Unauthorized' });
  }

  const { user } = params;

  if (!user) {
    return fail(400, { message: 'User parameter is required' });
  }

  const response = await fetch(`${MONOKIT_URL}/api/v1/admin/users/${user}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    return fail(response.status, { message: errorText });
  }

  const data: UserPageData = await response.json();

  return {
    user: data || null
  };
};
