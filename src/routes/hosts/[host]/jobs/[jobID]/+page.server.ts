import type { ServerPageLoad } from './$types';
import { fail } from '@sveltejs/kit';
const MONOKIT_URL = Bun.env.MONOKIT_URL;

export const load: ServerPageLoad = async ({ fetch, cookies, params }) => {
  const auth = cookies.get('Authorization');

  if (!auth) {
    return fail(401, { type: 'error', message: 'Unauthorized' });
  }

  const { jobID, host } = params;

  if (!jobID) {
    return fail(400, { type: 'info', message: 'Job ID is required' });
  }

  const response = await fetch(`${MONOKIT_URL}/api/v1/hosts/${host}/awx-jobs/${jobID}/logs`, {
    headers: {
      Authorization: auth
    }
  });

  const data = await response.json();

  if (!response.ok) {
    return fail(response.status, {
      type: 'error',
      message: data.message || 'Failed to fetch logs'
    });
  }

  return {
    jobData: data,
    jobID
  };
};
