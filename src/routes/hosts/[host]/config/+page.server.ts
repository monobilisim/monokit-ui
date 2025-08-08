import type { PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import Config from '$lib/config';
const MONOKIT_URL = Config.MONOKIT_URL;

export const load: PageServerLoad = async ({ params, fetch, cookies }) => {
  const auth = cookies.get('Authorization');

  if (!auth) {
    return fail(401, { type: 'error', message: 'Unauthorized' });
  }

  const { host } = params;

  const reponse = await fetch(`${MONOKIT_URL}/api/v1/hosts/${host}/config`, {
    headers: {
      Authorization: auth
    }
  });

  if (!reponse.ok) {
    const data = await reponse.json();
    return fail(reponse.status, {
      type: 'error',
      message: data.message || 'Failed to fetch host configuration'
    });
  }

  const hostConfig: Record<string, string> = await reponse.json();

  return {
    hostConfig
  };
};
