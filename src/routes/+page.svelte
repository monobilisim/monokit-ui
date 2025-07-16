<script lang="ts">
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
    CardDescription
  } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import * as Chart from '$lib/components/ui/chart/index.js';
  import { PieChart, Text } from 'layerchart';

  import { onMount } from 'svelte';

  export let data;

  $: userInfo = data.userInfo;
  $: hostStats = data.hostStats;
  $: userRole = userInfo?.role;
  $: logStats = data.logStats;
  $: errorCount = data.errorCount;

  onMount(() => {
    console.log(hostStats);
    console.log(userInfo);
  });

  $: chartData = hostStats
    ? [
        { status: 'online', count: hostStats.online || 0, color: '#3E8635' },
        { status: 'offline', count: hostStats.offline || 0, color: '#C9190B' },
        { status: 'deletion', count: hostStats.deletion || 0, color: '#F0AB00' },
        { status: 'unknown', count: hostStats.unknown || 0, color: '#6A6E73' }
      ]
    : [];

  const chartConfig = {
    count: { label: 'Hosts' },
    online: { label: 'Online', color: '#3E8635' },
    offline: { label: 'Offline', color: '#C9190B' },
    deletion: { label: 'Pending Deletion', color: '#F0AB00' },
    unknown: { label: 'Unknown', color: '#6A6E73' }
  } satisfies Chart.ChartConfig;

  $: totalHosts = hostStats?.total ?? 0;
</script>

<div class="w-full space-y-4 p-4">
  {#if userInfo}
    <Card class="mb-6">
      <CardContent class="pt-2">
        <h2 class="mb-4 text-2xl font-bold">Welcome, {userInfo.username}</h2>
        <div class="flex flex-wrap gap-2">
          <Badge variant="default">{userInfo.role}</Badge>
          {#if userInfo.groups !== 'nil'}
            <Badge variant="secondary">Groups: {userInfo.groups}</Badge>
          {/if}
          {#if userInfo.inventories}
            <Badge variant="secondary">Inventories: {userInfo.inventories}</Badge>
          {/if}
        </div>
      </CardContent>
    </Card>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card class="flex flex-col">
        <CardHeader class="items-center">
          <CardTitle>Host Status</CardTitle>
          <CardDescription>System Overview</CardDescription>
        </CardHeader>

        <CardContent class="flex-1">
          <Chart.Container config={chartConfig} class="mx-auto aspect-square max-h-[250px]">
            <PieChart
              data={chartData}
              key="status"
              value="count"
              c="color"
              innerRadius={60}
              padding={28}
              props={{ pie: { motion: 'tween' } }}
            >
              {#snippet aboveMarks()}
                <Text
                  value={String(totalHosts)}
                  textAnchor="middle"
                  verticalAnchor="middle"
                  class="fill-foreground text-3xl! font-bold"
                  dy={3}
                />

                <Text
                  value="Hosts"
                  textAnchor="middle"
                  verticalAnchor="middle"
                  class="fill-muted-foreground! text-muted-foreground"
                  dy={22}
                />
              {/snippet}
              {#snippet tooltip()}
                <Chart.Tooltip hideLabel />
              {/snippet}
            </PieChart>
          </Chart.Container>
        </CardContent>

        <CardFooter class="flex-col gap-2 text-sm">
          <div class="text-muted-foreground leading-none">Based on current monitored hosts</div>
        </CardFooter>
      </Card>

      <!-- Host Statistics -->
      <Card>
        <CardHeader>
          <CardTitle>Host Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Total Hosts: {hostStats.total}</h3>
            <div class="space-y-2">
              <Badge variant="success">Online: {hostStats.online}</Badge>
              <Badge variant="destructive">Offline: {hostStats.offline}</Badge>
              {#if userRole === 'admin'}
                <Badge variant="warning">Pending Deletion: {hostStats.deletion}</Badge>
              {/if}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <Badge variant="success">API Server: Running</Badge>
            <Badge variant="success">Database: Connected</Badge>
            <Badge variant="destructive">Errors (24h): {errorCount}</Badge>
            <Badge variant="secondary">
              Last Update: {new Date().toLocaleString()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  {/if}
</div>
