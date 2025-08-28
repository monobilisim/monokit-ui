<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';
  import { alerts, handleFormResponse } from '$lib/stores/alerts';
  import type { LogsPageData, FormResponse, LogLevel, LogChartData } from '$lib/types';

  import * as Card from '$lib/components/ui/card';
  import * as Table from '$lib/components/ui/table';
  import * as Select from '$lib/components/ui/select';
  import * as AlertDialog from '$lib/components/ui/alert-dialog';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Badge } from '$lib/components/ui/badge';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import Trash2 from '@lucide/svelte/icons/trash-2';

  let {
    data,
    form
  }: {
    data: LogsPageData;
    form: FormResponse | null;
  } = $props();

  import { LineChart } from 'layerchart';
  import { scaleUtc } from 'd3-scale';
  import { curveNatural } from 'd3-shape';
  import * as Chart from '$lib/components/ui/chart/index.js';

  const chartData: LogChartData[] = data.chartData || [];

  let tmpDate = new Date(Date.now() - 60 * 60 * 1000); // subtract 1 hour
  const dataCompatibleWithCharts = chartData.map((item: LogChartData) => {
    const date = new Date(tmpDate);
    tmpDate = new Date(tmpDate.getTime() + 5 * 60 * 1000); // add 5 minutes
    return {
      date: date,
      info: item.info,
      warning: item.warning,
      error: item.error,
      critical: item.critical
    };
  });

  const chartConfig = {
    info: { label: 'Info', color: 'var(--chart-1)' },
    warning: { label: 'Warning', color: 'var(--chart-2)' },
    error: { label: 'Error', color: 'var(--chart-3)' },
    critical: { label: 'Critical', color: 'var(--chart-4)' }
  } satisfies Chart.ChartConfig;

  // Search and filter state
  let searchValue = $state('');
  let levelFilter = $state('');
  let hostFilter = $state('');
  let typeFilter = $state('');
  let page_num = $state(1);
  let pageSize = $state(10);

  // Selection state
  let selectedLogs = $state<string[]>([]);
  let showDeleteDialog = $state(false);
  let isDeleting = $state(false);

  // Loading state
  let isLoading = $state(false);

  const logLevels: LogLevel[] = ['info', 'warning', 'error', 'critical'];

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'critical':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const updateFilters = (filters: {
    search?: string;
    level?: string;
    host?: string;
    type?: string;
    page?: number;
    page_size?: number;
  }) => {
    const url = new URL($page.url);

    if (filters.search !== undefined) {
      if (filters.search) {
        url.searchParams.set('message_text', filters.search);
      } else {
        url.searchParams.delete('message_text');
      }
    }

    if (filters.level !== undefined) {
      if (filters.level) {
        url.searchParams.set('level', filters.level);
      } else {
        url.searchParams.delete('level');
      }
    }

    if (filters.host !== undefined) {
      if (filters.host) {
        url.searchParams.set('host', filters.host);
      } else {
        url.searchParams.delete('host');
      }
    }

    if (filters.type !== undefined) {
      if (filters.type) {
        url.searchParams.set('type', filters.type);
      } else {
        url.searchParams.delete('type');
      }
    }

    if (filters.page !== undefined) {
      url.searchParams.set('page', filters.page.toString());
    }

    if (filters.page_size !== undefined) {
      url.searchParams.set('page_size', filters.page_size.toString());
    }

    // Reset to page 1 when filters change (except when explicitly setting page)
    if (
      filters.page === undefined &&
      (filters.search !== undefined ||
        filters.level !== undefined ||
        filters.host !== undefined ||
        filters.type !== undefined)
    ) {
      url.searchParams.set('page', '1');
    }

    goto(url.toString(), { keepFocus: true, noScroll: true });
  };

  const handleSearch = (event: Event) => {
    const target = event.target as HTMLInputElement;
    searchValue = target.value;
    updateFilters({ search: searchValue });
  };

  const handleLevelFilter = (value: string) => {
    levelFilter = value;
    updateFilters({ level: value });
  };

  const handleHostFilter = (value: string) => {
    hostFilter = value;
    updateFilters({ host: value });
  };

  const handleTypeFilter = (value: string) => {
    typeFilter = value;
    updateFilters({ type: value });
  };

  const handlePageChange = (newPage: number) => {
    page_num = newPage;
    updateFilters({ page: newPage });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    pageSize = newPageSize;
    updateFilters({ page_size: newPageSize, page: 1 });
  };

  const handleSelectLog = (logId: string, checked: boolean) => {
    if (checked) {
      selectedLogs = [...selectedLogs, logId];
    } else {
      selectedLogs = selectedLogs.filter((id) => id !== logId);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      selectedLogs = data.logs.map((log) => log.id);
    } else {
      selectedLogs = [];
    }
  };

  const openDeleteDialog = () => {
    if (selectedLogs.length === 0) {
      alerts.add({
        type: 'info',
        message: 'Please select at least one log to delete.'
      });
      return;
    }
    showDeleteDialog = true;
  };

  const closeDeleteDialog = () => {
    showDeleteDialog = false;
  };

  // Initialize filters from URL params
  $effect(() => {
    searchValue = $page.url.searchParams.get('message_text') || '';
    levelFilter = $page.url.searchParams.get('level') || '';
    hostFilter = $page.url.searchParams.get('host') || '';
    typeFilter = $page.url.searchParams.get('type') || '';
    page_num = parseInt($page.url.searchParams.get('page') || '1');
    pageSize = parseInt($page.url.searchParams.get('page_size') || '10');
  });

  // Handle form responses
  $effect(() => {
    handleFormResponse(form);
    if (form?.type === 'success') {
      selectedLogs = [];
    }

    console.log(data.chartData);
  });

  const totalPages = $derived(Math.ceil(data.totalItems / pageSize));
</script>

<svelte:head>
  <title>System Logs</title>
</svelte:head>

<div class="w-full space-y-4 p-4">
  <!-- <div class="flex items-center justify-between">
    <h1 class="text-3xl font-bold">System Logs</h1>
  </div> -->

  <Card.Root class="h-128">
    <Card.Header>
      <Card.Title>Log Activity (Last Hour)</Card.Title>
    </Card.Header>
    <Card.Content>
      <Chart.Container class="h-100 w-full" config={chartConfig}>
        <LineChart
          data={dataCompatibleWithCharts}
          x="date"
          xScale={scaleUtc()}
          axis="x"
          series={[
            {
              key: 'info',
              label: 'Info',
              color: chartConfig.info.color
            },
            {
              key: 'warning',
              label: 'Warning',
              color: chartConfig.warning.color
            },
            {
              key: 'error',
              label: 'Error',
              color: chartConfig.error.color
            },
            {
              key: 'critical',
              label: 'Critical',
              color: chartConfig.critical.color
            }
          ]}
          props={{
            spline: { curve: curveNatural, motion: 'tween', strokeWidth: 2 },
            xAxis: {
              // @ts-expect-error hii this is correct, don't touch
              format: (v: Date = new Date(new Date() - 60 * 60 * 1000)) =>
                new Date(v.getTime() + 5 * 60 * 1000).getMinutes().toString()
            },
            highlight: { points: { r: 4 } }
          }}
        >
          {#snippet tooltip()}
            <Chart.Tooltip hideLabel />
          {/snippet}
        </LineChart>
      </Chart.Container>
    </Card.Content>
  </Card.Root>

  <!-- Main Content Card -->
  <Card.Root>
    <Card.Header>
      <Card.Title>System Logs</Card.Title>
      <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <!-- Search -->
        <div class="max-w-sm flex-1">
          <Input
            type="text"
            placeholder="Search logs..."
            bind:value={searchValue}
            oninput={handleSearch}
          />
        </div>

        <!-- Delete Button -->
        <Button
          variant="destructive"
          size="sm"
          disabled={selectedLogs.length === 0}
          onclick={openDeleteDialog}
        >
          <Trash2 class="mr-2 h-4 w-4" />
          Delete Selected ({selectedLogs.length})
        </Button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4">
        <!-- Level Filter -->
        <Select.Root
          type="single"
          onValueChange={(value: string) => {
            handleLevelFilter(value);
          }}
        >
          <Select.Trigger class="w-[180px]">
            <span
              >{levelFilter
                ? levelFilter.charAt(0).toUpperCase() + levelFilter.slice(1)
                : 'All Levels'}</span
            >
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="">All Levels</Select.Item>
            {#each logLevels as level (level)}
              <Select.Item value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>

        <!-- Host Filter -->
        <Select.Root
          type="single"
          onValueChange={(value: string) => {
            handleHostFilter(value);
          }}
        >
          <Select.Trigger class="w-[180px]">
            <span>{hostFilter || 'All Hosts'}</span>
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="">All Hosts</Select.Item>
            {#each data.availableHosts as host (host)}
              <Select.Item value={host}>{host}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>

        <!-- Type Filter -->
        <Select.Root
          type="single"
          onValueChange={(value: string) => {
            handleTypeFilter(value);
          }}
        >
          <Select.Trigger class="w-[180px]">
            <span>{typeFilter || 'All Types'}</span>
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="">All Types</Select.Item>
            {#each data.availableTypes as type (type)}
              <Select.Item value={type}>{type}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
    </Card.Header>

    <Card.Content>
      {#if isLoading}
        <div class="space-y-4">
          {#each Array(5) as item, i (i)}
            <Skeleton class="h-12 w-full" />
          {/each}
        </div>
      {:else if data.logs.length === 0}
        <div class="py-8 text-center">
          <p class="text-muted-foreground">
            {levelFilter || hostFilter || typeFilter
              ? 'No logs found with the current filters. Try adjusting your search criteria.'
              : 'No logs found.'}
          </p>
        </div>
      {:else}
        <div class="space-y-4">
          <!-- Table -->
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head class="w-12">
                  <Checkbox
                    checked={selectedLogs.length > 0 && selectedLogs.length === data.logs.length}
                    indeterminate={selectedLogs.length > 0 &&
                      selectedLogs.length < data.logs.length}
                    onCheckedChange={handleSelectAll}
                  />
                </Table.Head>
                <Table.Head>Timestamp</Table.Head>
                <Table.Head>Level</Table.Head>
                <Table.Head>Component</Table.Head>
                <Table.Head>Host</Table.Head>
                <Table.Head>Message</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each data.logs as log (log.id)}
                <Table.Row>
                  <Table.Cell>
                    <Checkbox
                      checked={selectedLogs.includes(log.id)}
                      onCheckedChange={(checked) => handleSelectLog(log.id, checked)}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <div class="text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge class={getLevelColor(log.level)}>
                      {log.level.toUpperCase()}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{log.component}</Table.Cell>
                  <Table.Cell>{log.host_name}</Table.Cell>
                  <Table.Cell>
                    <div class="max-w-md truncate" title={log.message}>
                      {log.message}
                    </div>
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>

          <!-- Pagination -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <p class="text-muted-foreground text-sm">
                Showing {(page_num - 1) * pageSize + 1} to {Math.min(
                  page_num * pageSize,
                  data.totalItems
                )} of {data.totalItems} logs
              </p>
            </div>

            <div class="flex items-center space-x-2">
              <Select.Root
                type="single"
                onValueChange={(value: string) => {
                  if (value) handlePageSizeChange(parseInt(value));
                }}
              >
                <Select.Trigger class="w-[130px]">
                  <span>{pageSize} per page</span>
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="10">10 per page</Select.Item>
                  <Select.Item value="25">25 per page</Select.Item>
                  <Select.Item value="50">50 per page</Select.Item>
                  <Select.Item value="100">100 per page</Select.Item>
                </Select.Content>
              </Select.Root>

              <Button
                variant="outline"
                size="sm"
                disabled={page_num <= 1}
                onclick={() => handlePageChange(page_num - 1)}
              >
                Previous
              </Button>

              <div class="flex items-center space-x-1">
                <span class="text-muted-foreground text-sm">
                  Page {page_num} of {totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={page_num >= totalPages}
                onclick={() => handlePageChange(page_num + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      {/if}
    </Card.Content>
  </Card.Root>
</div>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={showDeleteDialog}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete Logs</AlertDialog.Title>
      <AlertDialog.Description>
        Are you sure you want to delete {selectedLogs.length} selected log{selectedLogs.length !== 1
          ? 's'
          : ''}? This action cannot be undone.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel onclick={closeDeleteDialog}>Cancel</AlertDialog.Cancel>
      <form
        method="POST"
        action="?/deleteSelectedLogs"
        use:enhance={() => {
          isDeleting = true;
          return async ({ update }) => {
            await update();
            isDeleting = false;
            showDeleteDialog = false;
          };
        }}
      >
        {#each selectedLogs as logId (logId)}
          <input type="hidden" name="logIds" value={logId} />
        {/each}
        <AlertDialog.Action
          type="submit"
          disabled={isDeleting}
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </AlertDialog.Action>
      </form>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
