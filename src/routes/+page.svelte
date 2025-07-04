<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
  import { Chart, type ChartData, type ChartOptions } from 'chart.js/auto';

  import { onMount } from 'svelte';

  export let data;

  $: userInfo = data.userInfo;
  $: hostStats = data.hostStats;
  $: userRole = userInfo?.role;
  $: logStats = data.logStats;
  $: errorCount = data.errorCount;

  let hostStatusChart: Chart | null = null;
  let logSeverityChart: Chart | null = null;
  let hostChartCanvas: HTMLCanvasElement;
  let logChartCanvas: HTMLCanvasElement;

  function createHostStatusChart() {
    if (hostChartCanvas) {
      const ctx = hostChartCanvas.getContext('2d');
      if (ctx) {
        const data: ChartData = {
          labels: ['Online', 'Offline', 'Pending Deletion', 'Unknown'],
          datasets: [
            {
              data: [
                hostStats.online || 0,
                hostStats.offline || 0,
                hostStats.deletion || 0,
                hostStats.unknown || 0
              ],
              backgroundColor: ['#3E8635', '#C9190B', '#F0AB00', '#6A6E73'],
              borderWidth: 0
            }
          ]
        };

        const options: ChartOptions = {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false }
          }
        };

        hostStatusChart = new Chart(ctx, {
          type: 'doughnut',
          data,
          options
        });
      }
    }
  }

  function createLogSeverityChart() {
    if (userRole === 'user') {
      const ctx = logChartCanvas.getContext('2d');
      if (ctx) {
        const data: ChartData = {
          labels: ['Info', 'Warning', 'Error', 'Critical'],
          datasets: [
            {
              data: [
                logStats.info || 0,
                logStats.warning || 0,
                logStats.error || 0,
                logStats.critical || 0
              ],
              backgroundColor: ['#0066CC', '#F0AB00', '#C9190B', '#A30000'],
              borderWidth: 0
            }
          ]
        };

        const options: ChartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20
              }
            }
          }
        };

        logSeverityChart = new Chart(ctx, {
          type: 'doughnut',
          data,
          options
        });
      }
    }
  }

  onMount(() => {
    createHostStatusChart();
    createLogSeverityChart();

    return () => {
      // Cleanup charts on component destruction
      if (hostStatusChart) hostStatusChart.destroy();
      if (logSeverityChart) logSeverityChart.destroy();
    };
  });
</script>

<div class="container mx-auto p-6">
  <h1 class="mb-8 text-4xl font-bold">Dashboard</h1>

  {#if userInfo}
    <Card class="mb-6">
      <CardContent class="pt-6">
        <h2 class="mb-4 text-2xl font-bold">Welcome, {userInfo.username}</h2>
        <div class="flex flex-wrap gap-2">
          <Badge variant="default">{userInfo.role}</Badge>
          {#if userInfo.groups !== 'nil'}
            <Badge variant="secondary">Groups: {userInfo.groups}</Badge>
          {/if}
          {#if userInfo.inventories !== 'nil'}
            <Badge variant="secondary">Inventories: {userInfo.inventories}</Badge>
          {/if}
        </div>
      </CardContent>
    </Card>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Host Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="relative mx-auto h-[200px] w-[200px]">
            <canvas bind:this={hostChartCanvas}></canvas>
          </div>
          <div class="mt-4 text-center">
            <span class="text-2xl font-bold">{hostStats.total}</span>
            <span class="text-base">hosts</span>
          </div>
        </CardContent>
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
