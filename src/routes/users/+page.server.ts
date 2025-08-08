import Config from '$lib/config';
const MONOKIT_URL = Config.MONOKIT_URL;
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { UserData, AlertMessage } from '$lib/types';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
  const authToken = cookies.get('Authorization');

  if (!authToken) {
    throw redirect(302, '/login');
  }

  const alerts: AlertMessage[] = [];

  try {
    // Fetch users
    const res = await fetch(`${MONOKIT_URL}/api/v1/admin/users`, {
      headers: {
        Authorization: authToken
      }
    });

    let users: UserData[] = [];
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      alerts.push({
        type: 'error',
        message: errorData.error || 'Failed to fetch users from server'
      });
    } else {
      users = await res.json();
    }

    // Fetch domains
    const domainsResponse = await fetch(`${MONOKIT_URL}/api/v1/admin/domains`, {
      headers: {
        Authorization: authToken
      }
    });

    let domains = [];
    if (!domainsResponse.ok) {
      const errorData = await domainsResponse.json().catch(() => ({}));
      alerts.push({
        type: 'error',
        message: errorData.error || 'Failed to fetch domains'
      });
    } else {
      domains = await domainsResponse.json();
    }

    // Fetch inventories
    // const inventoriesResponse = await fetch(`${MONOKIT_URL}/api/v1/admin/inventories`, {
    //   headers: {
    //     Authorization: authToken
    //   }
    // });

    // let inventories = [];
    // if (!inventoriesResponse.ok) {
    //   const errorData = await inventoriesResponse.json().catch(() => ({}));
    //   alerts.push({
    //     type: 'warn',
    //     message: errorData.error || 'Failed to fetch inventories'
    //   });
    // } else {
    //   inventories = await inventoriesResponse.json();
    // }

    return {
      users,
      domains,
      // inventories,
      alerts: alerts.length > 0 ? alerts : undefined
    };
  } catch {
    alerts.push({
      type: 'error',
      message: 'Network error: Failed to connect to server'
    });

    return {
      users: [] as UserData[],
      domains: [],
      // inventories: [],
      alerts
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
