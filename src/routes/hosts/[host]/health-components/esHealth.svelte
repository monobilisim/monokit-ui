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

  let { esHealth } = $props();

  // Helper function to determine status color
  function getStatusColor(status: string | number) {
    if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case 'green':
          return 'success';
        case 'yellow':
          return 'warning';
        case 'red':
          return 'destructive';
        default:
          return 'secondary';
      }
    }
    if (typeof status === 'number') {
      if (status >= 90) return 'destructive';
      if (status >= 70) return 'warning';
      return 'success';
    }
    return 'secondary';
  }

  // Calculate memory usage percentage if available
  const memoryUsagePercentage = $derived(
    esHealth.Memory?.UsedPercent ||
    (esHealth.Memory?.Used && esHealth.Memory?.Total ?
     (esHealth.Memory.Used / esHealth.Memory.Total) * 100 : 0)
  );

  // Calculate heap usage percentage if available
  const heapUsagePercentage = $derived(
    esHealth.HeapMemory?.UsedPercent ||
    (esHealth.HeapMemory?.Used && esHealth.HeapMemory?.Max ?
     (esHealth.HeapMemory.Used / esHealth.HeapMemory.Max) * 100 : 0)
  );
</script>

<div class="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <!-- Cluster Status Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Cluster Status</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(esHealth.ClusterStatus?.Status || 'unknown')}>
                {esHealth.ClusterStatus?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Cluster Name</TableCell>
            <TableCell class="text-right">{esHealth.ClusterStatus?.ClusterName || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Nodes</TableCell>
            <TableCell class="text-right">{esHealth.ClusterStatus?.NumberOfNodes || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Data Nodes</TableCell>
            <TableCell class="text-right">{esHealth.ClusterStatus?.NumberOfDataNodes || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Active Shards</TableCell>
            <TableCell class="text-right">{esHealth.ClusterStatus?.ActivePrimaryShards || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Last Updated</TableCell>
            <TableCell class="text-right">
              {esHealth.LastChecked ? new Date(esHealth.LastChecked).toLocaleString() : 'N/A'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Node Information Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Node Information</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Node Name</TableCell>
            <TableCell class="text-right">{esHealth.NodeInfo?.Name || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Version</TableCell>
            <TableCell class="text-right">{esHealth.NodeInfo?.Version || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>JVM Version</TableCell>
            <TableCell class="text-right">{esHealth.NodeInfo?.JVMVersion || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Uptime</TableCell>
            <TableCell class="text-right">{esHealth.NodeInfo?.Uptime || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Available Processors</TableCell>
            <TableCell class="text-right">{esHealth.NodeInfo?.AvailableProcessors || 'N/A'}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Memory Usage Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Memory Usage</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-4">
        {#if esHealth.Memory}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Total Memory</span>
              <Badge variant={getStatusColor(memoryUsagePercentage)}>
                {memoryUsagePercentage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={memoryUsagePercentage} class="h-2" />
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell class="text-right">{esHealth.Memory.Total || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Used</TableCell>
                  <TableCell class="text-right">{esHealth.Memory.Used || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Free</TableCell>
                  <TableCell class="text-right">{esHealth.Memory.Free || 'N/A'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        {/if}

        {#if esHealth.HeapMemory}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Heap Memory</span>
              <Badge variant={getStatusColor(heapUsagePercentage)}>
                {heapUsagePercentage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={heapUsagePercentage} class="h-2" />
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Max Heap</TableCell>
                  <TableCell class="text-right">{esHealth.HeapMemory.Max || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Used Heap</TableCell>
                  <TableCell class="text-right">{esHealth.HeapMemory.Used || 'N/A'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        {/if}
      </div>
    </CardContent>
  </Card>

  <!-- Indices Information Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Indices</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Total Indices</TableCell>
            <TableCell class="text-right">{esHealth.Indices?.Count || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Total Documents</TableCell>
            <TableCell class="text-right">{esHealth.Indices?.DocsCount?.toLocaleString() || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Deleted Documents</TableCell>
            <TableCell class="text-right">{esHealth.Indices?.DocsDeleted?.toLocaleString() || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Store Size</TableCell>
            <TableCell class="text-right">{esHealth.Indices?.StoreSize || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Primary Store Size</TableCell>
            <TableCell class="text-right">{esHealth.Indices?.PrimaryStoreSize || 'N/A'}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Performance Metrics Card -->
  {#if esHealth.Performance}
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Query Total</TableCell>
              <TableCell class="text-right">{esHealth.Performance.QueryTotal?.toLocaleString() || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Query Time</TableCell>
              <TableCell class="text-right">{esHealth.Performance.QueryTimeInMillis || 0}ms</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fetch Total</TableCell>
              <TableCell class="text-right">{esHealth.Performance.FetchTotal?.toLocaleString() || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fetch Time</TableCell>
              <TableCell class="text-right">{esHealth.Performance.FetchTimeInMillis || 0}ms</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Indexing Total</TableCell>
              <TableCell class="text-right">{esHealth.Performance.IndexTotal?.toLocaleString() || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Indexing Time</TableCell>
              <TableCell class="text-right">{esHealth.Performance.IndexTimeInMillis || 0}ms</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  {/if}
</div>
