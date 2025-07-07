import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { MONOKIT_URL } from '$env/static/private';
import { alerts } from '$lib/stores/alerts';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
  try {
    const authToken = cookies.get('Authorization');
    const response = await fetch(`${MONOKIT_URL}/api/v1/groups`, {
      headers: {
        Authorization: authToken
      } as Record<string, string>
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      alerts.add({ type: 'error', message: data.error || 'Failed to load groups.' });
      return {
        groups: [],
        error: 'Failed to load groups. Please try again later.'
      };
    }

    const data = await response.json();

    return { groups: data, error: null };
  } catch (error: any) {
    alerts.add({ type: 'error', message: error.message || 'Failed to load groups.' });
    console.error('Error fetching groups:', error);
    return {
      groups: [],
      error: 'Failed to load groups. Please try again later.'
    };
  }
};

export const actions: Actions = {
  createGroup: async ({ request, fetch, cookies }) => {
    const formData = await request.formData();
    const groupName = formData.get('name')?.toString();

    if (!groupName) {
      return fail(400, { error: 'Group name is required' });
    }

    try {
      const authToken = cookies.get('Authorization');
      const response = await fetch(`${MONOKIT_URL}/api/v1/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken || ''
        },
        body: JSON.stringify({ name: groupName })
      });

      if (!response.ok) {
        const errorData = await response.json().catch((error) => console.error(error));
        alerts.add({ type: 'error', message: errorData.error || 'Failed to create group.' });
        return fail(response.status, { error: errorData.error || 'Failed to create group' });
      }

      alerts.add({ type: 'success', message: 'Group created successfully.' });
      return { success: true, message: 'Group created successfully' };
    } catch (error: any) {
      alerts.add({ type: 'error', message: error.message || 'Failed to create group.' });
      console.error('Error creating group:', error);
      return fail(500, { error: 'Failed to create group' });
    }
  },
  deleteGroup: async ({ request, fetch, cookies }) => {
    const formData = await request.formData();
    const groupName = formData.get('name')?.toString();

    if (!groupName) {
      return fail(400, { error: 'Group name is required' });
    }

    try {
      const authToken = cookies.get('Authorization');
      const response = await fetch(`${MONOKIT_URL}/api/v1/groups/${groupName}`, {
        method: 'DELETE',
        headers: {
          Authorization: authToken || ''
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alerts.add({ type: 'error', message: errorData.error || 'Failed to delete group.' });
        return fail(response.status, { error: errorData.error || 'Failed to delete group' });
      }
      alerts.add({ type: 'success', message: 'Group deleted successfully.' });
      return { success: true, message: 'Group deleted successfully' };
    } catch (error: any) {
      alerts.add({ type: 'error', message: error.message || 'Failed to delete group.' });
      console.error('Error deleting group:', error);
      return fail(500, { error: 'Failed to delete group' });
    }
  }
};
