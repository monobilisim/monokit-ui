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

  let { mysqlHealth } = $props();

  // Helper function to determine status color
  function getStatusColor(status: string | number) {
    if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case 'online':
        case 'connected':
        case 'running':
        case 'active':
        case 'yes':
          return 'default';
        case 'offline':
        case 'disconnected':
        case 'stopped':
        case 'no':
          return 'destructive';
        case 'warning':
        case 'slow':
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

  // Calculate connection usage percentage
  const connectionUsagePercentage = $derived(
    mysqlHealth.Connections?.Used && mysqlHealth.Connections?.MaxConnections
      ? (mysqlHealth.Connections.Used / mysqlHealth.Connections.MaxConnections) * 100
      : 0
  );

  // Calculate buffer pool usage percentage
  const bufferPoolUsagePercentage = $derived(mysqlHealth.BufferPool?.UsedPercent || 0);

  // Calculate query cache hit ratio
  const queryCacheHitRatio = $derived(mysqlHealth.QueryCache?.HitRatio || 0);
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
              <Badge variant={getStatusColor(mysqlHealth.ServerStatus?.Status || 'unknown')}>
                {mysqlHealth.ServerStatus?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Version</TableCell>
            <TableCell class="text-right">{mysqlHealth.ServerInfo?.Version || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Uptime</TableCell>
            <TableCell class="text-right">{mysqlHealth.ServerInfo?.Uptime || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Port</TableCell>
            <TableCell class="text-right">{mysqlHealth.ServerInfo?.Port || 3306}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Data Directory</TableCell>
            <TableCell class="text-right">{mysqlHealth.ServerInfo?.DataDir || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Last Updated</TableCell>
            <TableCell class="text-right">
              {mysqlHealth.LastChecked ? new Date(mysqlHealth.LastChecked).toLocaleString() : 'N/A'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Connections Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Connections</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-4">
        {#if mysqlHealth.Connections}
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
              <TableCell class="text-right">{mysqlHealth.Connections?.Used || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Max Connections</TableCell>
              <TableCell class="text-right"
                >{mysqlHealth.Connections?.MaxConnections || 'N/A'}</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Total Connections</TableCell>
              <TableCell class="text-right"
                >{mysqlHealth.Connections?.Total?.toLocaleString() || 0}</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Aborted Connections</TableCell>
              <TableCell class="text-right"
                >{mysqlHealth.Connections?.Aborted?.toLocaleString() || 0}</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Running Queries</TableCell>
              <TableCell class="text-right">{mysqlHealth.Connections?.Running || 0}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  <!-- Database Information Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Database Information</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Total Databases</TableCell>
            <TableCell class="text-right">{mysqlHealth.Databases?.Count || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Total Tables</TableCell>
            <TableCell class="text-right"
              >{mysqlHealth.Tables?.Count?.toLocaleString() || 0}</TableCell
            >
          </TableRow>
          <TableRow>
            <TableCell>Total Size</TableCell>
            <TableCell class="text-right">{mysqlHealth.Databases?.TotalSize || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Data Size</TableCell>
            <TableCell class="text-right">{mysqlHealth.Databases?.DataSize || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Index Size</TableCell>
            <TableCell class="text-right">{mysqlHealth.Databases?.IndexSize || 'N/A'}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {#if mysqlHealth.DatabaseList && mysqlHealth.DatabaseList.length > 0}
        <div class="mt-4">
          <h4 class="mb-2 font-semibold">Database Details</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Tables</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each mysqlHealth.DatabaseList as database (database.Name)}
                <TableRow>
                  <TableCell>{database.Name}</TableCell>
                  <TableCell>{database.Size || 'N/A'}</TableCell>
                  <TableCell>{database.TableCount || 0}</TableCell>
                </TableRow>
              {/each}
            </TableBody>
          </Table>
        </div>
      {/if}
    </CardContent>
  </Card>

  <!-- Performance Metrics Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Performance</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Queries/sec</TableCell>
            <TableCell class="text-right"
              >{mysqlHealth.Performance?.QueriesPerSecond?.toFixed(2) || 0}</TableCell
            >
          </TableRow>
          <TableRow>
            <TableCell>Questions</TableCell>
            <TableCell class="text-right"
              >{mysqlHealth.Performance?.Questions?.toLocaleString() || 0}</TableCell
            >
          </TableRow>
          <TableRow>
            <TableCell>Slow Queries</TableCell>
            <TableCell class="text-right"
              >{mysqlHealth.Performance?.SlowQueries?.toLocaleString() || 0}</TableCell
            >
          </TableRow>
          <TableRow>
            <TableCell>Select Operations</TableCell>
            <TableCell class="text-right"
              >{mysqlHealth.Performance?.ComSelect?.toLocaleString() || 0}</TableCell
            >
          </TableRow>
          <TableRow>
            <TableCell>Insert Operations</TableCell>
            <TableCell class="text-right"
              >{mysqlHealth.Performance?.ComInsert?.toLocaleString() || 0}</TableCell
            >
          </TableRow>
          <TableRow>
            <TableCell>Update Operations</TableCell>
            <TableCell class="text-right"
              >{mysqlHealth.Performance?.ComUpdate?.toLocaleString() || 0}</TableCell
            >
          </TableRow>
          <TableRow>
            <TableCell>Delete Operations</TableCell>
            <TableCell class="text-right"
              >{mysqlHealth.Performance?.ComDelete?.toLocaleString() || 0}</TableCell
            >
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Buffer Pool & Cache Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Buffer Pool & Cache</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-4">
        {#if mysqlHealth.BufferPool}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Buffer Pool Usage</span>
              <Badge variant={getStatusColor(bufferPoolUsagePercentage)}>
                {bufferPoolUsagePercentage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={bufferPoolUsagePercentage} class="h-2" />
          </div>
        {/if}

        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Buffer Pool Size</TableCell>
              <TableCell class="text-right">{mysqlHealth.BufferPool?.Size || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Buffer Pool Pages</TableCell>
              <TableCell class="text-right"
                >{mysqlHealth.BufferPool?.TotalPages?.toLocaleString() || 0}</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Free Pages</TableCell>
              <TableCell class="text-right"
                >{mysqlHealth.BufferPool?.FreePages?.toLocaleString() || 0}</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Hit Rate</TableCell>
              <TableCell class="text-right"
                >{mysqlHealth.BufferPool?.HitRate?.toFixed(2) || 0}%</TableCell
              >
            </TableRow>
          </TableBody>
        </Table>

        {#if mysqlHealth.QueryCache}
          <div class="mt-4">
            <h4 class="mb-2 font-semibold">Query Cache</h4>
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span>Cache Hit Ratio</span>
                <Badge variant={getStatusColor(queryCacheHitRatio)}>
                  {queryCacheHitRatio.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={queryCacheHitRatio} class="h-2" />
            </div>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Cache Size</TableCell>
                  <TableCell class="text-right">{mysqlHealth.QueryCache.Size || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Cached Queries</TableCell>
                  <TableCell class="text-right"
                    >{mysqlHealth.QueryCache.QueriesInCache?.toLocaleString() || 0}</TableCell
                  >
                </TableRow>
                <TableRow>
                  <TableCell>Cache Hits</TableCell>
                  <TableCell class="text-right"
                    >{mysqlHealth.QueryCache.Hits?.toLocaleString() || 0}</TableCell
                  >
                </TableRow>
              </TableBody>
            </Table>
          </div>
        {/if}
      </div>
    </CardContent>
  </Card>

  <!-- Replication Status Card -->
  {#if mysqlHealth.Replication}
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">Replication</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Slave IO Running</TableCell>
              <TableCell class="text-right">
                <Badge variant={getStatusColor(mysqlHealth.Replication.SlaveIORunning || 'no')}>
                  {mysqlHealth.Replication.SlaveIORunning || 'No'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Slave SQL Running</TableCell>
              <TableCell class="text-right">
                <Badge variant={getStatusColor(mysqlHealth.Replication.SlaveSQLRunning || 'no')}>
                  {mysqlHealth.Replication.SlaveSQLRunning || 'No'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Master Host</TableCell>
              <TableCell class="text-right">{mysqlHealth.Replication.MasterHost || 'N/A'}</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Master Port</TableCell>
              <TableCell class="text-right">{mysqlHealth.Replication.MasterPort || 'N/A'}</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Seconds Behind Master</TableCell>
              <TableCell class="text-right">
                {#if mysqlHealth.Replication.SecondsBehindMaster !== undefined}
                  <Badge
                    variant={mysqlHealth.Replication.SecondsBehindMaster > 60
                      ? 'outline'
                      : 'default'}
                  >
                    {mysqlHealth.Replication.SecondsBehindMaster}s
                  </Badge>
                {:else}
                  N/A
                {/if}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Last Error</TableCell>
              <TableCell class="text-right">
                {#if mysqlHealth.Replication.LastError}
                  <Badge variant="destructive">Error</Badge>
                {:else}
                  <Badge variant="default">Master</Badge>
                {/if}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  {/if}
</div>
