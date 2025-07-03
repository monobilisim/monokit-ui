import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { MONOKIT_URL } from '$env/static/private';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
  const authToken = cookies.get('Authorization');

  try {
    const userInfo = JSON.parse(cookies.get('userData') || '{}');
    if (!userInfo) {
      throw error(401, 'Unauthorized');
    }

    let hostStats;
    const logStats = {
      info: 0,
      warning: 0,
      error: 0,
      critical: 0
    };
    let errorCount = 0;

    if (userInfo.role === 'admin') {
      const hostsResponse = await fetch(`${MONOKIT_URL}/api/v1/hosts`, {
        headers: { Authorization: authToken, 'Content-Type': 'application/json' }
      });

      if (!hostsResponse.ok) {
        console.error('Hosts API failed:', await hostsResponse.text());
        throw new Error(`Hosts API failed with status: ${hostsResponse.status}`);
      }

      const hosts = await hostsResponse.json(); // Changed from hostsResponse.data

      const normalizedHosts = hosts.map((host) => ({
        ...host,
        status:
          host.status?.toLowerCase() === 'scheduled for deletion'
            ? 'Scheduled for deletion'
            : host.status?.toLowerCase() === 'online'
              ? 'Online'
              : host.status?.toLowerCase() === 'offline'
                ? 'Offline'
                : 'Unknown'
      }));

      hostStats = {
        total: normalizedHosts.length,
        online: normalizedHosts.filter((h) => h.status === 'Online').length,
        offline: normalizedHosts.filter((h) => h.status === 'Offline').length,
        deletion: normalizedHosts.filter((h) => h.status === 'Scheduled for deletion').length,
        unknown: normalizedHosts.filter((h) => h.status === 'Unknown').length
      };

      // Fetch log stats for the last 7 days
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Fetch log statistics for each level
      const logLevels = ['info', 'warning', 'error', 'critical'];
      for (const level of logLevels) {
        const searchParams = {
          page: 1,
          page_size: 1,
          level: level,
          start_time: lastWeek.toISOString(),
          end_time: now.toISOString()
        };

        try {
          const response = await fetch(`${MONOKIT_URL}/api/v1/logs/search`, {
            method: 'POST', // Changed from 'post' to 'POST'
            headers: {
              Authorization: authToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchParams) // Added proper body handling
          });

          if (!response.ok) {
            console.error(`Log stats API failed for ${level}:`, await response.text());
            continue;
          }

          const responseData = await response.json();
          if (responseData && typeof responseData === 'object') {
            const pagination = responseData.pagination || { total: 0 };
            logStats[level] = pagination.total;
          }
        } catch (err) {
          console.error(`Failed to fetch ${level} logs:`, err);
          logStats[level] = 0;
        }
      }

      // Fetch error count for the last 24 hours
      const errorSearchParams = {
        page: 1,
        page_size: 1,
        level: 'error',
        start_time: yesterday.toISOString(),
        end_time: now.toISOString()
      };

      try {
        const errorResponse = await fetch(`${MONOKIT_URL}/api/v1/logs/search`, {
          method: 'POST',
          headers: {
            Authorization: authToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(errorSearchParams)
        });

        if (!errorResponse.ok) {
          console.error('Error count API failed:', await errorResponse.text());
          throw new Error(`Error count API failed with status: ${errorResponse.status}`);
        }

        const responseData = await errorResponse.json();
        if (responseData && typeof responseData === 'object') {
          const pagination = responseData.pagination || { total: 0 };
          errorCount = pagination.total;
        }
      } catch (err) {
        console.error('Failed to fetch error count:', err);
      }
    } else {
      // For non-admin users, fetch only assigned hosts
      const hostsResponse = await fetch(`${MONOKIT_URL}/api/v1/hosts/assigned`, {
        headers: { Authorization: authToken, 'Content-Type': 'application/json' }
      });

      if (!hostsResponse.ok) {
        console.error('Assigned hosts API failed:', await hostsResponse.text());
        throw new Error(`Assigned hosts API failed with status: ${hostsResponse.status}`);
      }

      const hosts = await hostsResponse.json(); // Changed from hostsResponse.data

      const normalizedHosts = hosts.map((host) => ({
        ...host,
        status:
          host.status?.toLowerCase() === 'online'
            ? 'Online'
            : host.status?.toLowerCase() === 'offline'
              ? 'Offline'
              : 'Unknown'
      }));

      hostStats = {
        total: normalizedHosts.length,
        online: normalizedHosts.filter((h) => h.status === 'Online').length,
        offline: normalizedHosts.filter((h) => h.status === 'Offline').length,
        deletion: 0,
        unknown: normalizedHosts.filter((h) => h.status === 'Unknown').length
      };
    }

    return {
      userInfo,
      hostStats,
      logStats,
      errorCount
    };
  } catch (e) {
    console.error('Dashboard data loading failed:', e);
    throw error(500, 'Failed to load dashboard data');
  }
};
