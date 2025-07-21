<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
  } from '$lib/components/ui/table';
  import { Progress } from '$lib/components/ui/progress';
  import { Badge } from '$lib/components/ui/badge';

  let { rmqHealth } = $props();

  // Helper function to determine status color
  function getStatusColor(status: string | number) {
    if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case 'running':
        case 'online':
        case 'connected':
        case 'active':
        case 'healthy':
        case 'up':
        case 'ok':
          return 'default';
        case 'stopped':
        case 'offline':
        case 'disconnected':
        case 'inactive':
        case 'unhealthy':
        case 'down':
        case 'failed':
        case 'error':
          return 'destructive';
        case 'warning':
        case 'slow':
        case 'degraded':
        case 'partial':
          return 'outline';
        default:
          return 'secondary';
      }
    }
    if (typeof status === 'number') {
      if (status >= 90) return 'destructive';
      if (status >= 70) return 'outline';
      return 'default';
    }
    return 'secondary';
  }

  // Calculate memory usage percentage
  const memoryUsagePercentage = $derived(
    rmqHealth.Memory?.UsedPercent ||
      (rmqHealth.Memory?.Used && rmqHealth.Memory?.Total
        ? (rmqHealth.Memory.Used / rmqHealth.Memory.Total) * 100
        : 0)
  );

  // Calculate disk usage percentage
  const diskUsagePercentage = $derived(
    rmqHealth.Disk?.UsedPercent ||
      (rmqHealth.Disk?.Used && rmqHealth.Disk?.Total
        ? (rmqHealth.Disk.Used / rmqHealth.Disk.Total) * 100
        : 0)
  );

  // Calculate connection usage percentage
  const connectionUsagePercentage = $derived(
    rmqHealth.Connections?.Used && rmqHealth.Connections?.Limit
      ? (rmqHealth.Connections.Used / rmqHealth.Connections.Limit) * 100
      : 0
  );

  // Calculate queue health percentage
  const queueHealthPercentage = $derived(
    rmqHealth.Queues?.Running && rmqHealth.Queues?.Total
      ? (rmqHealth.Queues.Running / rmqHealth.Queues.Total) * 100
      : 0
  );
</script>

<div class="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <!-- Server Status Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Server Status</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(rmqHealth.ServerStatus?.Status || 'unknown')}>
                {rmqHealth.ServerStatus?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Version</TableCell>
            <TableCell class="text-right">{rmqHealth.ServerInfo?.Version || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Erlang Version</TableCell>
            <TableCell class="text-right">{rmqHealth.ServerInfo?.ErlangVersion || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Uptime</TableCell>
            <TableCell class="text-right">{rmqHealth.ServerInfo?.Uptime || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Node Name</TableCell>
            <TableCell class="text-right">{rmqHealth.ServerInfo?.NodeName || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Management Port</TableCell>
            <TableCell class="text-right">{rmqHealth.ServerInfo?.ManagementPort || 15672}</TableCell
            >
          </TableRow>
          <TableRow>
            <TableCell>Last Updated</TableCell>
            <TableCell class="text-right">
              {rmqHealth.LastChecked ? new Date(rmqHealth.LastChecked).toLocaleString() : 'N/A'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Memory & Disk Usage Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Resource Usage</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-4">
        {#if rmqHealth.Memory}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Memory Usage</span>
              <Badge variant={getStatusColor(memoryUsagePercentage)}>
                {memoryUsagePercentage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={memoryUsagePercentage} class="h-2" />
          </div>
        {/if}

        {#if rmqHealth.Disk}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Disk Usage</span>
              <Badge variant={getStatusColor(diskUsagePercentage)}>
                {diskUsagePercentage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={diskUsagePercentage} class="h-2" />
          </div>
        {/if}

        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Memory Used</TableCell>
              <TableCell class="text-right">{rmqHealth.Memory?.Used || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Memory Limit</TableCell>
              <TableCell class="text-right">{rmqHealth.Memory?.Limit || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Memory High Watermark</TableCell>
              <TableCell class="text-right">{rmqHealth.Memory?.HighWatermark || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Disk Free Space</TableCell>
              <TableCell class="text-right">{rmqHealth.Disk?.Free || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Disk Free Limit</TableCell>
              <TableCell class="text-right">{rmqHealth.Disk?.FreeLimit || 'N/A'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  <!-- Connections Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Connections</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-4">
        {#if rmqHealth.Connections && connectionUsagePercentage > 0}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Connection Usage</span>
              <Badge variant={getStatusColor(connectionUsagePercentage)}>
                {connectionUsagePercentage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={connectionUsagePercentage} class="h-2" />
          </div>
        {/if}

        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Active Connections</TableCell>
              <TableCell class="text-right">{rmqHealth.Connections?.Active || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Connections</TableCell>
              <TableCell class="text-right">{rmqHealth.Connections?.Total || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Connection Limit</TableCell>
              <TableCell class="text-right">{rmqHealth.Connections?.Limit || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Channels</TableCell>
              <TableCell class="text-right">{rmqHealth.Channels?.Total || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Channel Limit</TableCell>
              <TableCell class="text-right">{rmqHealth.Channels?.Limit || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Consumers</TableCell>
              <TableCell class="text-right">{rmqHealth.Consumers?.Total || 0}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  <!-- Queues Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Queues</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-4">
        {#if rmqHealth.Queues && queueHealthPercentage > 0}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Running Queues</span>
              <Badge variant={getStatusColor(queueHealthPercentage)}>
                {queueHealthPercentage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={queueHealthPercentage} class="h-2" />
          </div>
        {/if}

        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Total Queues</TableCell>
              <TableCell class="text-right">{rmqHealth.Queues?.Total || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Running Queues</TableCell>
              <TableCell class="text-right">{rmqHealth.Queues?.Running || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Durable Queues</TableCell>
              <TableCell class="text-right">{rmqHealth.Queues?.Durable || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Auto-Delete Queues</TableCell>
              <TableCell class="text-right">{rmqHealth.Queues?.AutoDelete || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Messages</TableCell>
              <TableCell class="text-right"
                >{rmqHealth.Messages?.Total?.toLocaleString() || 0}</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Ready Messages</TableCell>
              <TableCell class="text-right"
                >{rmqHealth.Messages?.Ready?.toLocaleString() || 0}</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Unacked Messages</TableCell>
              <TableCell class="text-right"
                >{rmqHealth.Messages?.Unacked?.toLocaleString() || 0}</TableCell
              >
            </TableRow>
          </TableBody>
        </Table>

        {#if rmqHealth.QueueList && rmqHealth.QueueList.length > 0}
          <div class="mt-4">
            <h4 class="mb-2 font-semibold">Top Queues by Messages</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>VHost</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {#each rmqHealth.QueueList.slice(0, 5) as queue (queue.Name)}
                  <TableRow>
                    <TableCell>{queue.Name}</TableCell>
                    <TableCell>{queue.VHost || '/'}</TableCell>
                    <TableCell>{queue.Messages?.toLocaleString() || 0}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(queue.State)}>
                        {queue.State}
                      </Badge>
                    </TableCell>
                  </TableRow>
                {/each}
              </TableBody>
            </Table>
          </div>
        {/if}
      </div>
    </CardContent>
  </Card>

  <!-- Exchanges Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Exchanges</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Total Exchanges</TableCell>
            <TableCell class="text-right">{rmqHealth.Exchanges?.Total || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Durable Exchanges</TableCell>
            <TableCell class="text-right">{rmqHealth.Exchanges?.Durable || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Direct Exchanges</TableCell>
            <TableCell class="text-right">{rmqHealth.Exchanges?.Direct || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Topic Exchanges</TableCell>
            <TableCell class="text-right">{rmqHealth.Exchanges?.Topic || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Fanout Exchanges</TableCell>
            <TableCell class="text-right">{rmqHealth.Exchanges?.Fanout || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Headers Exchanges</TableCell>
            <TableCell class="text-right">{rmqHealth.Exchanges?.Headers || 0}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {#if rmqHealth.ExchangeList && rmqHealth.ExchangeList.length > 0}
        <div class="mt-4">
          <h4 class="mb-2 font-semibold">Exchange Details</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>VHost</TableHead>
                <TableHead>Durable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each rmqHealth.ExchangeList.slice(0, 5) as exchange (exchange.Name)}
                <TableRow>
                  <TableCell>{exchange.Name}</TableCell>
                  <TableCell>{exchange.Type}</TableCell>
                  <TableCell>{exchange.VHost || '/'}</TableCell>
                  <TableCell>
                    <Badge variant={exchange.Durable ? 'default' : 'secondary'}>
                      {exchange.Durable ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                </TableRow>
              {/each}
            </TableBody>
          </Table>
        </div>
      {/if}
    </CardContent>
  </Card>

  <!-- Virtual Hosts Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Virtual Hosts</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Total Virtual Hosts</TableCell>
            <TableCell class="text-right">{rmqHealth.VirtualHosts?.Total || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Active Virtual Hosts</TableCell>
            <TableCell class="text-right">{rmqHealth.VirtualHosts?.Active || 0}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {#if rmqHealth.VirtualHostList && rmqHealth.VirtualHostList.length > 0}
        <div class="mt-4">
          <h4 class="mb-2 font-semibold">Virtual Host Details</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Queues</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each rmqHealth.VirtualHostList as vhost (vhost.Name)}
                <TableRow>
                  <TableCell>{vhost.Name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(vhost.Status)}>
                      {vhost.Status}
                    </Badge>
                  </TableCell>
                  <TableCell>{vhost.Messages?.toLocaleString() || 0}</TableCell>
                  <TableCell>{vhost.Queues || 0}</TableCell>
                </TableRow>
              {/each}
            </TableBody>
          </Table>
        </div>
      {/if}
    </CardContent>
  </Card>

  <!-- Performance Metrics Card -->
  {#if rmqHealth.Performance}
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Publish Rate</TableCell>
              <TableCell class="text-right"
                >{rmqHealth.Performance?.PublishRate?.toFixed(2) || 0} msg/s</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Deliver Rate</TableCell>
              <TableCell class="text-right"
                >{rmqHealth.Performance?.DeliverRate?.toFixed(2) || 0} msg/s</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Ack Rate</TableCell>
              <TableCell class="text-right"
                >{rmqHealth.Performance?.AckRate?.toFixed(2) || 0} msg/s</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Published Messages</TableCell>
              <TableCell class="text-right"
                >{rmqHealth.Performance?.PublishedTotal?.toLocaleString() || 0}</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Delivered Messages</TableCell>
              <TableCell class="text-right"
                >{rmqHealth.Performance?.DeliveredTotal?.toLocaleString() || 0}</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Acknowledged Messages</TableCell>
              <TableCell class="text-right"
                >{rmqHealth.Performance?.AckedTotal?.toLocaleString() || 0}</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Redelivered Messages</TableCell>
              <TableCell class="text-right"
                >{rmqHealth.Performance?.RedeliveredTotal?.toLocaleString() || 0}</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Returned Messages</TableCell>
              <TableCell class="text-right"
                >{rmqHealth.Performance?.ReturnedTotal?.toLocaleString() || 0}</TableCell
              >
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  {/if}

  <!-- Cluster Information Card -->
  {#if rmqHealth.Cluster}
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">Cluster Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cluster Name</TableCell>
              <TableCell class="text-right">{rmqHealth.Cluster?.Name || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Nodes</TableCell>
              <TableCell class="text-right">{rmqHealth.Cluster?.TotalNodes || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Running Nodes</TableCell>
              <TableCell class="text-right">{rmqHealth.Cluster?.RunningNodes || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Partitions</TableCell>
              <TableCell class="text-right">
                {#if (rmqHealth.Cluster?.Partitions || 0) > 0}
                  <Badge variant="destructive">{rmqHealth.Cluster.Partitions}</Badge>
                {:else}
                  0
                {/if}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {#if rmqHealth.ClusterNodes && rmqHealth.ClusterNodes.length > 0}
          <div class="mt-4">
            <h4 class="mb-2 font-semibold">Cluster Nodes</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Node</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Memory</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {#each rmqHealth.ClusterNodes as node (node.Name)}
                  <TableRow>
                    <TableCell>{node.Name}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(node.Status)}>
                        {node.Status}
                      </Badge>
                    </TableCell>
                    <TableCell>{node.Type || 'disk'}</TableCell>
                    <TableCell>{node.Memory || 'N/A'}</TableCell>
                  </TableRow>
                {/each}
              </TableBody>
            </Table>
          </div>
        {/if}
      </CardContent>
    </Card>
  {/if}
</div>
