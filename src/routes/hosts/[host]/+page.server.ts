import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
const MONOKIT_URL = Bun.env.MONOKIT_URL;

interface HostResponse {
  id?: string;
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
  awxHostId?: string;
  awxHostUrl?: string;
  monokitVersion?: string;
  wantsUpdateTo?: string;
  groups?: string;
  inventory?: string;
  installedComponents?: string;
  disabledComponents?: string;
  cpuCores?: number;
  ram?: string;
}

interface AwxJob {
  id: number;
  name: string;
  status: string;
  started: string;
  finished: string;
  url?: string;
}

export const load: PageServerLoad = async ({ params, fetch, cookies }) => {
  const auth = cookies.get('Authorization');
  const { host } = params;

  if (!auth) {
    throw error(401, 'Not authenticated');
  }

  try {
    // Fetch host details
    const hostResponse = await fetch(`${MONOKIT_URL}/api/v1/hosts/${host}`, {
      headers: {
        Authorization: auth
      }
    });

    if (!hostResponse.ok) {
      if (hostResponse.status === 401) {
        throw error(401, 'Session expired');
      }
      throw error(hostResponse.status, await hostResponse.text());
    }

    const hostData: HostResponse = await hostResponse.json();

    // Fetch AWX jobs if host has AWX ID
    let awxJobs: AwxJob[] = [];
    if (hostData.awxHostId) {
      const awxResponse = await fetch(`${MONOKIT_URL}/api/v1/hosts/${host}/awx-jobs`, {
        headers: {
          Authorization: auth
        }
      });

      if (awxResponse.ok) {
        awxJobs = await awxResponse.json();
      }
    }

    // Fetch health tools
    const healthToolsResponse = await fetch(`${MONOKIT_URL}/api/v1/health/tools`, {
      headers: {
        Authorization: auth
      }
    });

    const healthTools = healthToolsResponse.ok ? await healthToolsResponse.json() : [];

    // Fetch OS health data
    let osHealth = null;
    if (healthTools.includes('osHealth')) {
      const osHealthResponse = await fetch(`${MONOKIT_URL}/api/v1/hosts/${host}/health/osHealth`, {
        headers: {
          Authorization: auth
        }
      });

      if (osHealthResponse.ok) {
        osHealth = await osHealthResponse.json();
      }
    }

    // Fetch Postal health data
    let postalHealth = null;
    if (healthTools.includes('postalHealth')) {
      const postalHealthResponse = await fetch(
        `${MONOKIT_URL}/api/v1/hosts/${host}/health/postalHealth`,
        {
          headers: {
            Authorization: auth
          }
        }
      );

      if (postalHealthResponse.ok) {
        postalHealth = await postalHealthResponse.json();
      }
    }

    // Fetch Pritunl health data
    let pritunlHealth = null;
    if (healthTools.includes('pritunlHealth')) {
      const pritunlHealthResponse = await fetch(
        `${MONOKIT_URL}/api/v1/hosts/${host}/health/pritunlHealth`,
        {
          headers: {
            Authorization: auth
          }
        }
      );

      if (pritunlHealthResponse.ok) {
        pritunlHealth = await pritunlHealthResponse.json();
      }
    }

    // Fetch Vault health data
    let vaultHealth = null;
    if (healthTools.includes('vaultHealth')) {
      const vaultHealthResponse = await fetch(
        `${MONOKIT_URL}/api/v1/hosts/${host}/health/vaultHealth`,
        {
          headers: {
            Authorization: auth
          }
        }
      );

      if (vaultHealthResponse.ok) {
        vaultHealth = await vaultHealthResponse.json();
      }
    }

    // Fetch WppConnect health data
    let wppconnectHealth = null;
    if (healthTools.includes('wppconnectHealth')) {
      const wppconnectHealthResponse = await fetch(
        `${MONOKIT_URL}/api/v1/hosts/${host}/health/wppconnectHealth`,
        {
          headers: {
            Authorization: auth
          }
        }
      );

      if (wppconnectHealthResponse.ok) {
        wppconnectHealth = await wppconnectHealthResponse.json();
      }
    }

    // Fetch Zimbra health data
    let zimbraHealth = null;
    if (healthTools.includes('zimbraHealth')) {
      const zimbraHealthResponse = await fetch(
        `${MONOKIT_URL}/api/v1/hosts/${host}/health/zimbraHealth`,
        {
          headers: {
            Authorization: auth
          }
        }
      );

      if (zimbraHealthResponse.ok) {
        zimbraHealth = await zimbraHealthResponse.json();
      }
    }

    return {
      host: hostData,
      awxJobs,
      healthTools,
      osHealth,
      postalHealth,
      pritunlHealth,
      vaultHealth,
      wppconnectHealth,
      zimbraHealth,
      auth,
      hostName: host
    };
  } catch (err) {
    console.error('Failed to fetch host details:', err);
    //throw error(500, err instanceof Error ? err.message : 'An unknown error occurred');
  }
};

export const actions: Actions = {
  forceDelete: async ({ params, fetch, cookies }) => {
    const auth = cookies.get('Authorization');
    const { host } = params;

    if (!auth) {
      return fail(401, {
        type: 'error',
        message: 'Not authenticated'
      });
    }

    try {
      const response = await fetch(`${MONOKIT_URL}/api/v1/hosts/${host}/force`, {
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
        message: `Successfully force deleted host ${host}`
      };
    } catch (err) {
      console.error('Failed to force delete host:', err);
      return fail(500, {
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to force delete host'
      });
    }
  },

  updateComponents: async ({ request, params, fetch, cookies }) => {
    const auth = cookies.get('Authorization');
    const { host } = params;

    if (!auth) {
      return fail(401, {
        type: 'error',
        message: 'Not authenticated'
      });
    }

    try {
      const formData = await request.formData();
      const response = await fetch(`${MONOKIT_URL}/api/v1/hosts/${host}/components`, {
        method: 'PUT',
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          components: formData.getAll('components[]')
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return {
        type: 'success',
        message: 'Successfully updated components'
      };
    } catch (err) {
      console.error('Failed to update components:', err);
      return fail(500, {
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update components'
      });
    }
  }
};
