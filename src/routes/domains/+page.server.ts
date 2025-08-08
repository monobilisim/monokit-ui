import Config from '$lib/config';
const MONOKIT_URL = Config.MONOKIT_URL;
import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';

interface DomainResponse {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  settings?: object;
  created_at: string;
  updated_at: string;
}

interface NormalizedDomain {
  id: string;
  name: string;
  description: string;
  active: boolean;
  settings?: object;
  created_at: string;
  updated_at: string;
}

export const load: PageServerLoad = async ({ fetch, cookies }) => {
  const authToken = cookies.get('Authorization');

  if (!authToken) {
    throw error(401, 'Not authenticated');
  }

  try {
    const response = await fetch(`${MONOKIT_URL}/api/v1/domains`, {
      headers: {
        Authorization: authToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw error(401, 'Session expired');
      }
      throw error(response.status, await response.text());
    }

    const data = await response.json();

    return {
      domains: data
    };
  } catch (err: unknown) {
    console.error('Failed to fetch domains:', err);

    if (err instanceof Error) {
      throw error(500, err.message);
    }
    throw error(500, 'An unknown error occurred while fetching domains');
  }
};

export const actions: Actions = {
  createDomain: async ({ request, fetch, cookies }) => {
    const authToken = cookies.get('Authorization');
    if (!authToken) {
      return fail(401, {
        type: 'error',
        message: 'Not authenticated'
      });
    }

    try {
      const formData = await request.formData();
      const name = formData.get('name');
      const description = formData.get('description');
      const settings = formData.get('settings');

      if (!name || typeof name !== 'string') {
        return fail(400, {
          type: 'error',
          message: 'Domain name is required'
        });
      }

      const requestBody: { name: string; description?: string; settings?: object } = {
        name: name.trim()
      };

      if (description && typeof description === 'string' && description.trim()) {
        requestBody.description = description.trim();
      }

      if (settings && typeof settings === 'string' && settings.trim()) {
        try {
          requestBody.settings = JSON.parse(settings);
        } catch {
          return fail(400, {
            type: 'error',
            message: 'Invalid JSON format for settings'
          });
        }
      }

      const response = await fetch(`${MONOKIT_URL}/api/v1/domains`, {
        method: 'POST',
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create domain');
      }

      return {
        type: 'success',
        message: `Successfully created domain "${name}"`
      };
    } catch (err) {
      console.error('Failed to create domain:', err);
      return fail(500, {
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to create domain'
      });
    }
  },

  updateDomain: async ({ request, fetch, cookies }) => {
    const authToken = cookies.get('Authorization');
    if (!authToken) {
      return fail(401, {
        type: 'error',
        message: 'Not authenticated'
      });
    }

    try {
      const formData = await request.formData();
      const domainId = formData.get('domainId');
      const name = formData.get('name');
      const description = formData.get('description');
      const active = formData.get('active');
      const settings = formData.get('settings');

      if (!domainId || typeof domainId !== 'string') {
        return fail(400, {
          type: 'error',
          message: 'Domain ID is required'
        });
      }

      const requestBody: {
        name?: string;
        description?: string;
        active?: boolean;
        settings?: object;
      } = {};

      if (name && typeof name === 'string' && name.trim()) {
        requestBody.name = name.trim();
      }

      if (description !== null && typeof description === 'string') {
        requestBody.description = description.trim();
      }

      if (active !== null) {
        requestBody.active = active === 'true';
      }

      if (settings && typeof settings === 'string' && settings.trim()) {
        try {
          requestBody.settings = JSON.parse(settings);
        } catch {
          return fail(400, {
            type: 'error',
            message: 'Invalid JSON format for settings'
          });
        }
      }

      const response = await fetch(`${MONOKIT_URL}/api/v1/domains/${domainId}`, {
        method: 'PUT',
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update domain');
      }

      return {
        type: 'success',
        message: `Successfully updated domain`
      };
    } catch (err) {
      console.error('Failed to update domain:', err);
      return fail(500, {
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update domain'
      });
    }
  },

  deleteDomains: async ({ request, fetch, cookies }) => {
    const authToken = cookies.get('Authorization');
    if (!authToken) {
      return fail(401, {
        type: 'error',
        message: 'Not authenticated'
      });
    }

    try {
      const formData = await request.formData();
      const domainIds = formData.getAll('domains[]');

      if (domainIds.length === 0) {
        return fail(400, {
          type: 'error',
          message: 'No domains selected for deletion'
        });
      }

      // Delete each domain one by one
      const errors: string[] = [];
      let successCount = 0;

      for (const domainId of domainIds) {
        try {
          const response = await fetch(`${MONOKIT_URL}/api/v1/domains/${domainId}`, {
            method: 'DELETE',
            headers: {
              Authorization: authToken,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            const errorText = await response.text();
            errors.push(`Failed to delete domain "${domainId}": ${errorText}`);
          } else {
            successCount++;
          }
        } catch (err) {
          errors.push(
            `Failed to delete domain "${domainId}": ${err instanceof Error ? err.message : 'Unknown error'}`
          );
        }
      }

      if (errors.length > 0 && successCount === 0) {
        return fail(500, {
          type: 'error',
          message: `Failed to delete domains: ${errors.join(', ')}`
        });
      }

      const message =
        successCount > 0
          ? `Successfully deleted ${successCount} domain${successCount === 1 ? '' : 's'}${errors.length > 0 ? ` (${errors.length} failed)` : ''}`
          : 'No domains were deleted';

      return {
        type: successCount > 0 ? 'success' : 'error',
        message,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (err) {
      console.error('Failed to delete domains:', err);
      return fail(500, {
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to delete domains'
      });
    }
  }
};
