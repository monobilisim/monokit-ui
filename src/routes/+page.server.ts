import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { MONOKIT_URL } from '$env/static/private';
import type { Host, LogLevel, DashboardData } from '$lib/types';

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
        headers: { Authorization: authToken, 'Content-Type': 'application/json' } as Record<
          string,
          string
        >
      });

      if (!hostsResponse.ok) {
        console.error('Hosts API failed:', await hostsResponse.text());
        throw new Error(`Hosts API failed with status: ${hostsResponse.status}`);
      }

      const hosts: Host[] = await hostsResponse.json();

      const normalizedHosts = hosts.map((host: Host) => ({
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
        online: normalizedHosts.filter((h: Host) => h.status === 'Online').length,
        offline: normalizedHosts.filter((h: Host) => h.status === 'Offline').length,
        deletion: normalizedHosts.filter((h: Host) => h.status === 'Scheduled for deletion').length,
        unknown: normalizedHosts.filter((h: Host) => h.status === 'Unknown').length
      };

      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const logLevels: LogLevel[] = ['info', 'warning', 'error', 'critical'];
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
            } as Record<string, string>,
            body: JSON.stringify(searchParams) // Added proper body handling
          });

          if (!response.ok) {
            console.error(`Log stats API failed for ${level}:`, await response.text());
            continue;
          }

          const responseData = await response.json();
          if (responseData && typeof responseData === 'object') {
            const pagination = responseData.pagination || { total: 0 };
            (logStats as Record<string, number>)[level] = pagination.total;
          }
        } catch (err) {
          console.error(`Failed to fetch ${level} logs:`, err);
          (logStats as Record<string, number>)[level] = 0;
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
          } as Record<string, string>,
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
        headers: { Authorization: authToken, 'Content-Type': 'application/json' } as Record<
          string,
          string
        >
      });

      if (!hostsResponse.ok) {
        console.error('Assigned hosts API failed:', await hostsResponse.text());
        throw new Error(`Assigned hosts API failed with status: ${hostsResponse.status}`);
      }

      const hosts: Host[] = await hostsResponse.json(); // Changed from hostsResponse.data

      const normalizedHosts = hosts.map((host: Host) => ({
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
        online: normalizedHosts.filter((h: Host) => h.status === 'Online').length,
        offline: normalizedHosts.filter((h: Host) => h.status === 'Offline').length,
        deletion: 0,
        unknown: normalizedHosts.filter((h: Host) => h.status === 'Unknown').length
      };
    }

    return {
      userInfo,
      hostStats,
      logStats,
      errorCount
    } satisfies DashboardData;
  } catch (e) {
    console.error('Dashboard data loading failed:', e);
    throw error(500, 'Failed to load dashboard data');
  }
};
