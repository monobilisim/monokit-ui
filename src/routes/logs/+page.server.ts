const MONOKIT_URL = Bun.env.MONOKIT_URL;
import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import type {
  Log,
  LogChartData,
  LogSearchParams,
  LogSearchResponse,
  LogsPageData
} from '$lib/types';

const processLogsForChart = (logs: Log[]): LogChartData[] => {
  if (!logs.length) return [];

  // Find latest log timestamp and round up to next 10 minutes
  const latest = new Date(Math.max(...logs.map((l) => new Date(l.timestamp).getTime())));
  latest.setMilliseconds(0);
  latest.setSeconds(0);
  latest.setMinutes(Math.ceil(latest.getMinutes() / 10) * 10);

  // Set start time to one hour before latest, rounded down to nearest 10 minutes
  const start = new Date(latest);
  start.setHours(latest.getHours() - 1);
  start.setMinutes(Math.floor(start.getMinutes() / 10) * 10);

  // Create time slots
  const timeMap: Record<number, LogChartData> = {};
  const currentTime = new Date(start);
  while (currentTime <= latest) {
    timeMap[currentTime.getTime()] = {
      timestamp: currentTime.getTime(),
      info: 0,
      warning: 0,
      error: 0,
      critical: 0
    };
    currentTime.setMinutes(currentTime.getMinutes() + 10);
  }

  const levelMap = {
    info: 'info',
    warning: 'warning',
    error: 'error',
    critical: 'critical'
  } as const;

  logs.forEach((log) => {
    const logTime = new Date(log.timestamp);
    logTime.setMilliseconds(0);
    logTime.setSeconds(0);
    logTime.setMinutes(Math.floor(logTime.getMinutes() / 10) * 10);
    const slotTime = logTime.getTime();

    const level = log.level.toLowerCase();
    const mappedLevel = levelMap[level as keyof typeof levelMap];

    if (mappedLevel && timeMap[slotTime]) {
      timeMap[slotTime][mappedLevel]++;
    }
  });

  return Object.values(timeMap);
};

export const load: PageServerLoad = async ({ fetch, cookies, url }) => {
  const authToken = cookies.get('Authorization');

  if (!authToken) {
    throw error(401, 'Not authenticated');
  }

  const page = parseInt(url.searchParams.get('page') || '1');
  const pageSize = parseInt(url.searchParams.get('page_size') || '10');
  const level = url.searchParams.get('level') || '';
  const host = url.searchParams.get('host') || '';
  const type = url.searchParams.get('type') || '';
  const messageText = url.searchParams.get('message_text') || '';

  const searchParams: LogSearchParams = {
    page,
    page_size: pageSize,
    level: level || undefined,
    host: host || undefined,
    type: type || undefined,
    message_text: messageText || undefined
  };

  try {
    const response = await fetch(`${MONOKIT_URL}/api/v1/logs/search`, {
      method: 'POST',
      headers: {
        Authorization: authToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchParams)
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw error(401, 'Session expired');
      }
      throw error(response.status, await response.text());
    }

    const data: LogSearchResponse = await response.json();
    const logsData = data.logs || [];
    const pagination = data.pagination || { total: 0, page: 1, page_size: 10 };

    // Extract available hosts and types from logs
    const availableHosts = [...new Set(logsData.map((log) => log.host_name).filter(Boolean))];
    const availableTypes = [...new Set(logsData.map((log) => log.type).filter(Boolean))];

    const chartData = processLogsForChart(logsData);

    const pageData: LogsPageData = {
      logs: logsData,
      totalItems: pagination.total,
      availableHosts,
      availableTypes,
      chartData
    };

    return pageData;
  } catch (err: unknown) {
    console.error('Failed to fetch logs:', err);

    if (err instanceof Error) {
      throw error(500, err.message);
    }
    throw error(500, 'An unknown error occurred while fetching logs');
  }
};

export const actions: Actions = {
  deleteSelectedLogs: async ({ request, fetch, cookies }) => {
    const authToken = cookies.get('Authorization');

    if (!authToken) {
      return fail(401, {
        type: 'error',
        message: 'Not authenticated'
      });
    }

    try {
      const formData = await request.formData();
      const logIds = formData.getAll('logIds') as string[];

      if (logIds.length === 0) {
        return fail(400, {
          type: 'error',
          message: 'No logs selected for deletion'
        });
      }

      // Delete logs one by one
      const deletePromises = logIds.map((logId) =>
        fetch(`${MONOKIT_URL}/api/v1/logs/${logId}`, {
          method: 'DELETE',
          headers: {
            Authorization: authToken
          }
        })
      );

      const results = await Promise.allSettled(deletePromises);

      // Check if any deletions failed
      const failedDeletions = results.filter(
        (result) =>
          result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.ok)
      );

      if (failedDeletions.length > 0) {
        return fail(500, {
          type: 'error',
          message: `Failed to delete ${failedDeletions.length} out of ${logIds.length} logs`
        });
      }

      return {
        type: 'success',
        message: `Successfully deleted ${logIds.length} log${logIds.length > 1 ? 's' : ''}`
      };
    } catch (err) {
      console.error('Failed to delete logs:', err);
      return fail(500, {
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to delete logs'
      });
    }
  }
};
