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

    let data;
    try {
      data = await response.json();

      if (data === null) {
        data = [];
      }
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      throw error(500, 'Invalid JSON response from server');
    }

    let hostsData: Host[] = [];
    if (data === null || data === undefined) {
      hostsData = [];
    } else if (Array.isArray(data)) {
      hostsData = data;
    } else if (typeof data === 'object' && data !== null && Array.isArray(data.hosts)) {
      hostsData = data.hosts;
    } else if (typeof data === 'object' && data !== null) {
      hostsData = [];
    } else {
      hostsData = [];
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
      hosts: normalizedHosts
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
  },

  addAwxHost: async ({ request, fetch, cookies }) => {
    const auth = cookies.get('Authorization');
    if (!auth) {
      return fail(401, {
        type: 'error',
        message: 'Not authenticated'
      });
    }

    try {
      const formData = await request.formData();
      const hostName = formData.get('hostName')?.toString();
      const ipAddress = formData.get('ipAddress')?.toString();
      const extraVars = formData.get('extraVars')?.toString();
      const runSetupAfterPing = formData.get('runSetupAfterPing') === 'true';

      if (!hostName || !ipAddress) {
        return fail(400, {
          type: 'error',
          message: 'Host name and IP address are required'
        });
      }

      // Prepare request payload
      const payload: Record<string, unknown> = {
        name: hostName,
        ip_address: ipAddress,
        awx_only: true
      };

      // Add extra variables if provided
      if (extraVars?.trim()) {
        try {
          // Parse YAML-like variables into object
          const vars: Record<string, string> = {};
          const lines = extraVars.trim().split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
              const [key, ...valueParts] = trimmed.split(':');
              if (key && valueParts.length > 0) {
                vars[key.trim()] = valueParts.join(':').trim();
              }
            }
          }
          if (Object.keys(vars).length > 0) {
            payload.extra_vars = vars;
          }
        } catch {
          return fail(400, {
            type: 'error',
            message: 'Invalid YAML format in extra variables'
          });
        }
      }

      console.log('Creating AWX host with payload:', payload);

      // Step 1: Create host in AWX
      const createResponse = await fetch(`${MONOKIT_URL}/api/v1/hosts/awx`, {
        method: 'POST',
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json().catch(() => ({}));
        if (createResponse.status === 400 && errorData.__all__) {
          const errorMsg = errorData.__all__[0];
          if (errorMsg === 'Host with this Name and Inventory already exists.') {
            return fail(400, {
              type: 'error',
              message: `A host with the name "${hostName}" already exists in AWX.`
            });
          }
        }
        throw new Error(errorData.error || `Failed to create host: ${createResponse.status}`);
      }

      const createdHost = await createResponse.json();
      console.log('Host created successfully:', createdHost);

      // Step 2: Run ping job with hardcoded template ID
      const pingTemplateId = 107; // manual-check-ping
      console.log('Running ping job...');

      const jobResponse = await fetch(`${MONOKIT_URL}/api/v1/hosts/${hostName}/awx-jobs/execute`, {
        method: 'POST',
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template_id: pingTemplateId,
          extra_vars: { limit: hostName }
        })
      });

      if (!jobResponse.ok) {
        // Clean up by deleting the host
        if (createdHost && createdHost.id) {
          try {
            await fetch(`${MONOKIT_URL}/api/v1/hosts/awx/${createdHost.id}`, {
              method: 'DELETE',
              headers: { Authorization: auth }
            });
          } catch (deleteErr) {
            console.error('Failed to delete host after job launch failure:', deleteErr);
          }
        }
        throw new Error('Failed to launch ping job');
      }

      const jobData = await jobResponse.json();
      const jobId = jobData.job_id || jobData.id;
      console.log('Ping job launched with ID:', jobId);

      // Step 3: Poll for job status
      let attempts = 0;
      const maxAttempts = 20;

      while (attempts < maxAttempts) {
        attempts++;
        console.log(`Checking job status (attempt ${attempts}/${maxAttempts})...`);

        // Wait 3 seconds between checks
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const statusResponse = await fetch(`${MONOKIT_URL}/api/v1/awx/jobs/${jobId}`, {
          headers: { Authorization: auth }
        });

        if (!statusResponse.ok) {
          throw new Error('Failed to check job status');
        }

        const statusData = await statusResponse.json();
        const status = statusData.status;
        console.log(`Job status: ${status}`);

        if (status === 'successful') {
          let finalMessage = `Host "${hostName}" was successfully added to AWX`;

          // If setup toggle is enabled, run setup workflow
          if (runSetupAfterPing) {
            const setupTemplateId = 95; // workflow-manual-setup-fresh
            console.log('Ping successful! Now running setup workflow...');

            try {
              const setupResponse = await fetch(
                `${MONOKIT_URL}/api/v1/hosts/${hostName}/awx-workflow-jobs/execute`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: auth,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    workflow_template_id: setupTemplateId,
                    extra_vars: { limit: hostName },
                    format: 'yaml'
                  })
                }
              );

              if (setupResponse.ok) {
                const setupData = await setupResponse.json();
                const setupJobId = setupData.job_id || setupData.id;
                console.log('Setup job launched with ID:', setupJobId);
                finalMessage = `Host "${hostName}" successfully added to AWX and setup job launched`;
              } else {
                finalMessage = `Host "${hostName}" added to AWX, but setup job failed to launch`;
              }
            } catch (setupErr) {
              console.error('Failed to run setup job:', setupErr);
              finalMessage = `Host "${hostName}" added to AWX, but setup job failed to launch`;
            }
          }

          return {
            type: 'success',
            message: finalMessage
          };
        } else if (['failed', 'error', 'canceled'].includes(status)) {
          // Job failed, delete the host
          console.log('Ping check failed, deleting host');

          if (createdHost && createdHost.id) {
            try {
              await fetch(`${MONOKIT_URL}/api/v1/hosts/awx/${createdHost.id}`, {
                method: 'DELETE',
                headers: { Authorization: auth }
              });
            } catch (deleteErr) {
              console.error('Failed to delete host after failed ping check:', deleteErr);
            }
          }

          return fail(400, {
            type: 'error',
            message: `Host validation failed. The host could not be reached. Job status: ${status}`
          });
        }
      }

      // Timeout
      return fail(408, {
        type: 'error',
        message: 'Validation timed out after multiple attempts'
      });
    } catch (err) {
      console.error('Failed to add AWX host:', err);
      return fail(500, {
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to add AWX host'
      });
    }
  }
};
