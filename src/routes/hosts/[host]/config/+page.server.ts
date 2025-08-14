import type { PageServerLoad, Actions } from './$types';
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

export const actions: Actions = {
  putConfig: async ({ request, params, fetch, cookies }) => {
    const authToken = cookies.get('Authorization');

    if (!authToken) {
      return fail(401, { type: 'error', message: 'Unauthorized' });
    }

    const { host } = params;

    const formData = await request.formData();
    const changedFileName: string = <string>formData.get('changedFileName');
    const changedFileContent: string = <string>formData.get('changedFileContent');
    const configData: string = <string>formData.get('hostConfig');

    const apiCompatibleConfig: Record<string, string> = {};
    JSON.parse(configData).forEach((item: { name: string; content: string }) => {
      if (item.name === changedFileName) {
        item.content = changedFileContent;
      }
      apiCompatibleConfig[item.name] = item.content;
    });

    const response = await fetch(`${MONOKIT_URL}/api/v1/hosts/${host}/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken
      },
      body: JSON.stringify(apiCompatibleConfig)
    });

    if (!response.ok) {
      const data = await response.json();
      console.error('Error updating host configuration:', data);
      return fail(response.status, {
        type: 'error',
        message: data.message || 'Failed to update host configuration'
      });
    }

    return {
      type: 'success',
      message: 'Host configuration updated successfully'
    };
  }
};
