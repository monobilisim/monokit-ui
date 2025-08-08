import Config from '$lib/config';
const MONOKIT_URL = Config.MONOKIT_URL;
const AWX_SETUP_TEMPLATE_ID = Number(Config.AWX_SETUP_TEMPLATE_ID);
const AWX_PING_TEMPLATE_ID = Number(Config.AWX_PING_TEMPLATE_ID);
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
      hosts: normalizedHosts,
      awxFreshInstallId: Config.AWX_SETUP_TEMPLATE_ID || null
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
  forceDeleteHosts: async ({ request, fetch, cookies }) => {
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

      const responses = hosts.map(async (host) => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const response = await fetch(`${MONOKIT_URL}/api/v1/hosts/${host}/force`, {
          method: 'DELETE',
          headers: {
            Authorization: auth
          }
        });

        if (!response.ok) {
          return await response.text();
        }
      });

      const failedResults = (await Promise.all(responses)).filter(Boolean);

      if (failedResults.length > 0) {
        throw new Error(failedResults.join(' '));
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

      const payload: Record<string, unknown> = {
        name: hostName,
        ip_address: ipAddress,
        awx_only: true
      };

      if (extraVars?.trim()) {
        try {
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
              message: `A host with the name "${hostName}" already exists in AWX. Please choose a different name.`
            });
          }
        }

        const errorMessage =
          errorData.error ||
          errorData.message ||
          `Failed to create host (${createResponse.status})`;
        return fail(createResponse.status, {
          type: 'error',
          message: `Failed to create host "${hostName}": ${errorMessage}`
        });
      }

      const createdHost = await createResponse.json();
      console.log('Host created successfully:', createdHost);
      console.log('Running ping job...');

      const jobResponse = await fetch(`${MONOKIT_URL}/api/v1/hosts/${hostName}/awx-jobs/execute`, {
        method: 'POST',
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template_id: AWX_PING_TEMPLATE_ID,
          extra_vars: { limit: hostName }
        })
      });

      if (!jobResponse.ok) {
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

        const errorData = await jobResponse.json().catch(() => ({}));
        const errorMessage =
          errorData.error ||
          errorData.message ||
          `Failed to launch ping job (${jobResponse.status})`;

        return fail(jobResponse.status, {
          type: 'error',
          message: `Host "${hostName}" was created but connectivity test failed to start: ${errorMessage}`
        });
      }

      const jobData = await jobResponse.json();
      const jobId = jobData.job_id || jobData.id;
      console.log('Ping job launched with ID:', jobId);

      let attempts = 0;
      const maxAttempts = 30;
      const pollInterval = 2000;

      while (attempts < maxAttempts) {
        attempts++;
        console.log(`Checking job status (attempt ${attempts}/${maxAttempts})...`);

        await new Promise((resolve) => setTimeout(resolve, pollInterval));

        const statusResponse = await fetch(`${MONOKIT_URL}/api/v1/awx/jobs/${jobId}`, {
          headers: { Authorization: auth }
        });

        if (!statusResponse.ok) {
          if (attempts < maxAttempts - 5) {
            console.log('Failed to check job status, retrying...');
            continue;
          }

          return fail(500, {
            type: 'error',
            message: `Host "${hostName}" was created but connectivity test status could not be verified`
          });
        }

        const statusData = await statusResponse.json();
        const status = statusData.status;
        console.log(`Job status: ${status}`);

        if (status === 'successful') {
          let finalMessage = `Host "${hostName}" was successfully added to AWX and connectivity verified`;

          if (runSetupAfterPing) {
            const setupTemplateId = AWX_SETUP_TEMPLATE_ID;
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
                finalMessage = `Host "${hostName}" successfully added to AWX, connectivity verified, and setup workflow started (Job ID: ${setupJobId})`;
              } else {
                const setupErrorData = await setupResponse.json().catch(() => ({}));
                const setupError =
                  setupErrorData.error || setupErrorData.message || 'Unknown error';
                console.error('Setup job failed:', setupError);
                finalMessage = `Host "${hostName}" added to AWX and connectivity verified, but setup workflow failed to start: ${setupError}`;
              }
            } catch (setupErr) {
              console.error('Failed to run setup job:', setupErr);
              const setupErrorMessage =
                setupErr instanceof Error ? setupErr.message : 'Unknown error';
              finalMessage = `Host "${hostName}" added to AWX and connectivity verified, but setup workflow failed to start: ${setupErrorMessage}`;
            }
          }

          return {
            type: 'success',
            message: finalMessage
          };
        } else if (['failed', 'error', 'canceled'].includes(status)) {
          console.log('Ping check failed, deleting host');

          if (createdHost && createdHost.id) {
            try {
              await fetch(`${MONOKIT_URL}/api/v1/hosts/awx/${createdHost.id}`, {
                method: 'DELETE',
                headers: { Authorization: auth }
              });
              console.log('Host deleted after failed ping check');
            } catch (deleteErr) {
              console.error('Failed to delete host after failed ping check:', deleteErr);
            }
          }

          let failureDetails = '';
          try {
            const jobDetailsResponse = await fetch(`${MONOKIT_URL}/api/v1/awx/jobs/${jobId}`, {
              headers: { Authorization: auth }
            });
            if (jobDetailsResponse.ok) {
              const jobDetails = await jobDetailsResponse.json();
              if (jobDetails.job_explanation) {
                failureDetails = ` (${jobDetails.job_explanation})`;
              }
            }
          } catch {
            // Ignore error getting job details
          }

          return fail(400, {
            type: 'error',
            message: `Host "${hostName}" connectivity test failed${failureDetails}. The host could not be reached and has been removed from AWX.`
          });
        } else if (status === 'pending' || status === 'running') {
          continue;
        } else {
          console.log(`Unknown job status: ${status}, continuing to poll...`);
          continue;
        }
      }

      return fail(408, {
        type: 'error',
        message: `Host "${hostName}" connectivity test timed out after ${(maxAttempts * pollInterval) / 1000} seconds. The host may have been created but connectivity could not be verified.`
      });
    } catch (err) {
      console.error('Failed to add AWX host:', err);

      let errorMessage = 'An unexpected error occurred while adding the host';
      if (err instanceof Error) {
        errorMessage = err.message;
      }

      return fail(500, {
        type: 'error',
        message: `Failed to add AWX host: ${errorMessage}`
      });
    }
  }
};
