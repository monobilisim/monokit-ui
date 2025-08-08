import type { PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import Config from '$lib/config';
const MONOKIT_URL = Config.MONOKIT_URL;

export const load: PageServerLoad = async ({ fetch, cookies, params }) => {
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

  const jobResponse = await fetch(`${MONOKIT_URL}/api/v1/awx/jobs/${jobID}`, {
    headers: {
      Authorization: auth
    }
  });

  if (!jobResponse.ok) {
    return fail(jobResponse.status, {
      type: 'error',
      message: 'Failed to fetch job details'
    });
  }

  const job: { job_env: { AWX_HOST: string } } = await jobResponse.json();

  return {
    jobData: data,
    jobID,
    job
  };
};
