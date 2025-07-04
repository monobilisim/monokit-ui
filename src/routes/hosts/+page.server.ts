import { MONOKIT_URL } from '$env/static/private';
import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';

interface Host {
  name: string;
  hostname?: string;
  ipAddress?: string;
  IpAddress?: string;
  ip_address?: string;
  address?: string;
  ip?: string;
  os?: string;
  operating_system?: string;
  status?: string;
  state?: string;
  id?: string;
}

interface NormalizedHost {
  id?: string;
  name: string;
  address: string;
  os: string;
  status: string;
}

export const load: PageServerLoad = async ({ fetch, cookies }) => {
  const authToken = cookies.get('Authorization');

  if (!authToken) {
    throw error(401, 'Not authenticated');
  }

  try {
    const response = await fetch(`${MONOKIT_URL}/api/v1/hosts`, {
      headers: {
        Authorization: authToken
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw error(401, 'Session expired');
      }
      throw error(response.status, await response.text());
    }

    const data = await response.json();

    let hostsData: Host[] = [];
    if (Array.isArray(data)) {
      hostsData = data;
    } else if (typeof data === 'object' && Array.isArray(data.hosts)) {
      hostsData = data.hosts;
    } else {
      throw error(500, 'Invalid data format from server');
    }

    const normalizedHosts: NormalizedHost[] = hostsData.map((host) => ({
      id: host.id,
      name: host.name || host.hostname || 'Unnamed Host',
      address:
        host.ipAddress || host.IpAddress || host.ip_address || host.address || host.ip || 'Unknown',
      os: host.os || host.operating_system || 'Unknown',
      status: (host.status || host.state || 'unknown').toLowerCase()
    }));

    return {
      hosts: normalizedHosts,
      authToken // Pass auth token to the client for form actions
    };
  } catch (err: unknown) {
    console.error('Failed to fetch hosts:', err);

    if (err instanceof Error) {
      throw error(500, err.message);
    }
    throw error(500, 'An unknown error occurred while fetching hosts');
  }
};

export const actions: Actions = {
  deleteHosts: async ({ request, fetch, cookies }) => {
    const auth = cookies.get('Authorization');
    if (!auth) {
      return fail(401, {
        type: 'error',
        message: 'Not authenticated'
      });
    }

    try {
      const formData = await request.formData();
      const hosts = formData.getAll('hosts[]');

      if (hosts.length === 0) {
        return fail(400, {
          type: 'error',
          message: 'No hosts selected for deletion'
        });
      }

      const response = await fetch(`${MONOKIT_URL}/api/v1/hosts`, {
        method: 'DELETE',
        headers: {
          Authorization: auth
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return {
        type: 'success',
        message: `Successfully deleted ${hosts.length} host${hosts.length === 1 ? '' : 's'}`
      };
    } catch (err) {
      console.error('Failed to delete hosts:', err);
      return fail(500, {
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to delete hosts'
      });
    }
  },

  forceDeleteHost: async ({ request, fetch, cookies }) => {
    const auth = cookies.get('Authorization');
    if (!auth) {
      return fail(401, {
        type: 'error',
        message: 'Not authenticated'
      });
    }

    try {
      const formData = await request.formData();
      const hostName = formData.get('hostName');

      if (!hostName) {
        return fail(400, {
          type: 'error',
          message: 'No host name provided for force deletion'
        });
      }

      const response = await fetch(`/api/hosts/${hostName}/force`, {
        method: 'DELETE',
        headers: {
          Authorization: auth
        }
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return {
        type: 'success',
        message: `Successfully force deleted host ${hostName}`
      };
    } catch (err) {
      console.error('Failed to force delete host:', err);
      return fail(500, {
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to force delete host'
      });
    }
  }
};
