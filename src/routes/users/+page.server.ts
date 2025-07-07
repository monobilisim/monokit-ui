const MONOKIT_URL = Bun.env.MONOKIT_URL;
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { UserData, InventoryData } from '$lib/types';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
  const authToken = cookies.get('Authorization');

  if (!authToken) {
    return {
      users: [] as UserData[],
      error: 'Not authenticated'
    };
  }

  try {
    const res = await fetch(`${MONOKIT_URL}/api/v1/admin/users`, {
      headers: {
        Authorization: authToken
      }
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        users: [] as UserData[],
        error: data.error || 'Failed to fetch users'
      };
    }

    const users: UserData[] = await res.json();

    const inventoriesResponse = await fetch(`${MONOKIT_URL}/api/v1/inventory`, {
      headers: {
        Authorization: authToken
      }
    });

    if (!inventoriesResponse.ok) {
      const data = await inventoriesResponse.json().catch(() => ({}));
      return {
        users: [] as UserData[],
        inventories: [],
        error: data.error || 'Failed to fetch inventories'
      };
    }

    const inventories: InventoryData[] = await inventoriesResponse.json();

    return {
      users,
      inventories,
      error: undefined
    };
  } catch {
    return {
      users: [] as UserData[],
      inventories: [],
      error: 'Failed to fetch users'
    };
  }
};

export const actions: Actions = {
  deleteUsers: async ({ request, cookies, fetch }) => {
    const authToken = cookies.get('Authorization');

    if (!authToken) {
      return fail(401, {
        type: 'error',
        error: 'Not authenticated'
      });
    }

    const data = await request.formData();
    const usernames = data.getAll('usernames') as string[];

    if (!usernames || usernames.length === 0) {
      return fail(400, {
        type: 'error',
        error: 'No users selected for deletion'
      });
    }

    try {
      const deletePromises = usernames.map((username) =>
        fetch(`${MONOKIT_URL}/api/v1/admin/users/${username}`, {
          method: 'DELETE',
          headers: {
            Authorization: authToken
          }
        })
      );

      const results = await Promise.allSettled(deletePromises);
      const failures = results.filter(
        (result) =>
          result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.ok)
      );

      if (failures.length > 0) {
        return fail(500, {
          type: 'error',
          error: `Failed to delete ${failures.length} user(s)`
        });
      }

      return {
        type: 'success',
        message: `Successfully deleted ${usernames.length} user(s)`
      };
    } catch {
      return fail(500, {
        type: 'error',
        error: 'Failed to delete selected users'
      });
    }
  },

  createUser: async ({ request, cookies, fetch }) => {
    const authToken = cookies.get('Authorization');

    if (!authToken) {
      return fail(401, {
        type: 'error',
        error: 'Not authenticated'
      });
    }

    const data = await request.formData();
    const username = data.get('username') as string;
    const password = data.get('password') as string;
    const email = data.get('email') as string;
    const role = data.get('role') as string;
    const groups = data.get('groups') as string;
    const inventory = data.get('inventory') as string;

    if (!username || !password || !email || !role) {
      return fail(400, {
        type: 'error',
        error: 'Username, password, email, and role are required'
      });
    }

    try {
      const res = await fetch(`${MONOKIT_URL}/api/v1/admin/users`, {
        method: 'POST',
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password,
          email,
          role,
          groups: groups || '',
          inventory: inventory || ''
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return fail(res.status, {
          type: 'error',
          error: data.error || 'Failed to create user'
        });
      }

      return {
        type: 'success',
        message: `Successfully created user "${username}"`
      };
    } catch {
      return fail(500, {
        type: 'error',
        error: 'Failed to create user'
      });
    }
  }
};
