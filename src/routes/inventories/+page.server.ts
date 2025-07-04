import { MONOKIT_URL } from '$env/static/private';
import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';

interface Inventory {
  name: string;
  hosts?: unknown[];
  createdAt?: string;
  created_at?: string;
}

interface NormalizedInventory {
  id: string;
  name: string;
  hosts: number;
  created_at: string;
}

export const load: PageServerLoad = async ({ fetch, cookies }) => {
  const authToken = cookies.get('Authorization');

  if (!authToken) {
    throw error(401, 'Not authenticated');
  }

  try {
    const response = await fetch(`${MONOKIT_URL}/api/v1/inventory`, {
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

    let inventoriesData: Inventory[] = [];
    if (Array.isArray(data)) {
      inventoriesData = data;
    } else if (typeof data === 'object' && Array.isArray(data.data)) {
      inventoriesData = data.data;
    } else {
      throw error(500, 'Invalid data format from server');
    }

    const normalizedInventories: NormalizedInventory[] = inventoriesData.map(
      (inventory, index) => ({
        id: inventory.name || `inventory-${index}-${Date.now()}`,
        name: inventory.name || 'Unnamed Inventory',
        hosts: Array.isArray(inventory.hosts) ? inventory.hosts.length : 0,
        created_at:
          inventory.createdAt || inventory.created_at
            ? new Date(inventory.createdAt || inventory.created_at!).toLocaleString()
            : 'N/A'
      })
    );

    return {
      inventories: normalizedInventories
    };
  } catch (err: unknown) {
    console.error('Failed to fetch inventories:', err);

    if (err instanceof Error) {
      throw error(500, err.message);
    }
    throw error(500, 'An unknown error occurred while fetching inventories');
  }
};

export const actions: Actions = {
  createInventory: async ({ request, fetch, cookies }) => {
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

      if (!name || typeof name !== 'string') {
        return fail(400, {
          type: 'error',
          message: 'Inventory name is required'
        });
      }

      const response = await fetch(`${MONOKIT_URL}/api/v1/inventory`, {
        method: 'POST',
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create inventory');
      }

      return {
        type: 'success',
        message: `Successfully created inventory "${name}"`
      };
    } catch (err) {
      console.error('Failed to create inventory:', err);
      return fail(500, {
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to create inventory'
      });
    }
  },

  deleteInventories: async ({ request, fetch, cookies }) => {
    const authToken = cookies.get('Authorization');
    if (!authToken) {
      return fail(401, {
        type: 'error',
        message: 'Not authenticated'
      });
    }

    try {
      const formData = await request.formData();
      const inventoryNames = formData.getAll('inventories[]');

      if (inventoryNames.length === 0) {
        return fail(400, {
          type: 'error',
          message: 'No inventories selected for deletion'
        });
      }

      // Delete each inventory one by one
      const errors: string[] = [];
      let successCount = 0;

      for (const name of inventoryNames) {
        try {
          const response = await fetch(`${MONOKIT_URL}/api/v1/inventory/${name}`, {
            method: 'DELETE',
            headers: {
              Authorization: authToken,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            const errorText = await response.text();
            errors.push(`Failed to delete "${name}": ${errorText}`);
          } else {
            successCount++;
          }
        } catch (err) {
          errors.push(
            `Failed to delete "${name}": ${err instanceof Error ? err.message : 'Unknown error'}`
          );
        }
      }

      if (errors.length > 0 && successCount === 0) {
        return fail(500, {
          type: 'error',
          message: `Failed to delete inventories: ${errors.join(', ')}`
        });
      }

      const message =
        successCount > 0
          ? `Successfully deleted ${successCount} inventory${successCount === 1 ? '' : 'ies'}${errors.length > 0 ? ` (${errors.length} failed)` : ''}`
          : 'No inventories were deleted';

      return {
        type: successCount > 0 ? 'success' : 'error',
        message,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (err) {
      console.error('Failed to delete inventories:', err);
      return fail(500, {
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to delete inventories'
      });
    }
  }
};
