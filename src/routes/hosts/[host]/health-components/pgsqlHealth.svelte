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

  let { pgsqlHealth } = $props();

  // Helper function to determine status color
  function getStatusColor(status: string | number) {
    if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case 'online':
        case 'connected':
        case 'running':
        case 'active':
        case 'up':
        case 'available':
          return 'success';
        case 'offline':
        case 'disconnected':
        case 'stopped':
        case 'down':
        case 'unavailable':
          return 'destructive';
        case 'warning':
        case 'slow':
        case 'degraded':
          return 'warning';
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

  // Calculate connection usage percentage
  const connectionUsagePercentage = $derived(
    pgsqlHealth.Connections?.Active && pgsqlHealth.Connections?.MaxConnections ?
    (pgsqlHealth.Connections.Active / pgsqlHealth.Connections.MaxConnections) * 100 : 0
  );

  // Calculate buffer cache hit ratio
  const bufferCacheHitRatio = $derived(
    pgsqlHealth.BufferCache?.HitRatio || 0
  );

  // Calculate shared buffer usage
  const sharedBufferUsage = $derived(
    pgsqlHealth.SharedBuffers?.UsedPercent || 0
  );

  // Calculate WAL usage
  const walUsage = $derived(
    pgsqlHealth.WAL?.UsedPercent || 0
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
              <Badge variant={getStatusColor(pgsqlHealth.ServerStatus?.Status || 'unknown')}>
                {pgsqlHealth.ServerStatus?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Version</TableCell>
            <TableCell class="text-right">{pgsqlHealth.ServerInfo?.Version || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Uptime</TableCell>
            <TableCell class="text-right">{pgsqlHealth.ServerInfo?.Uptime || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Port</TableCell>
            <TableCell class="text-right">{pgsqlHealth.ServerInfo?.Port || 5432}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Data Directory</TableCell>
            <TableCell class="text-right">{pgsqlHealth.ServerInfo?.DataDirectory || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Recovery Mode</TableCell>
            <TableCell class="text-right">
              <Badge variant={pgsqlHealth.ServerInfo?.IsInRecovery ? 'warning' : 'success'}>
                {pgsqlHealth.ServerInfo?.IsInRecovery ? 'Yes' : 'No'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Last Updated</TableCell>
            <TableCell class="text-right">
              {pgsqlHealth.LastChecked ? new Date(pgsqlHealth.LastChecked).toLocaleString() : 'N/A'}
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
        {#if pgsqlHealth.Connections}
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
              <TableCell class="text-right">{pgsqlHealth.Connections?.Active || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Idle Connections</TableCell>
              <TableCell class="text-right">{pgsqlHealth.Connections?.Idle || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Idle in Transaction</TableCell>
              <TableCell class="text-right">{pgsqlHealth.Connections?.IdleInTransaction || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Max Connections</TableCell>
              <TableCell class="text-right">{pgsqlHealth.Connections?.MaxConnections || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Used</TableCell>
              <TableCell class="text-right">{pgsqlHealth.Connections?.Total || 0}</TableCell>
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
            <TableCell class="text-right">{pgsqlHealth.Databases?.Count || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Total Size</TableCell>
            <TableCell class="text-right">{pgsqlHealth.Databases?.TotalSize || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Largest Database</TableCell>
            <TableCell class="text-right">{pgsqlHealth.Databases?.LargestDatabase || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Total Tables</TableCell>
            <TableCell class="text-right">{pgsqlHealth.Tables?.Count?.toLocaleString() || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Total Indexes</TableCell>
            <TableCell class="text-right">{pgsqlHealth.Indexes?.Count?.toLocaleString() || 0}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {#if pgsqlHealth.DatabaseList && pgsqlHealth.DatabaseList.length > 0}
        <div class="mt-4">
          <h4 class="mb-2 font-semibold">Database Details</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Connections</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each pgsqlHealth.DatabaseList as database}
                <TableRow>
                  <TableCell>{database.Name}</TableCell>
                  <TableCell>{database.Size || 'N/A'}</TableCell>
                  <TableCell>{database.Connections || 0}</TableCell>
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
            <TableCell>Transactions/sec</TableCell>
            <TableCell class="text-right">{pgsqlHealth.Performance?.TransactionsPerSecond?.toFixed(2) || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Commits</TableCell>
            <TableCell class="text-right">{pgsqlHealth.Performance?.Commits?.toLocaleString() || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Rollbacks</TableCell>
            <TableCell class="text-right">{pgsqlHealth.Performance?.Rollbacks?.toLocaleString() || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Blocks Read</TableCell>
            <TableCell class="text-right">{pgsqlHealth.Performance?.BlocksRead?.toLocaleString() || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Blocks Hit</TableCell>
            <TableCell class="text-right">{pgsqlHealth.Performance?.BlocksHit?.toLocaleString() || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Tuples Returned</TableCell>
            <TableCell class="text-right">{pgsqlHealth.Performance?.TuplesReturned?.toLocaleString() || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Tuples Fetched</TableCell>
            <TableCell class="text-right">{pgsqlHealth.Performance?.TuplesFetched?.toLocaleString() || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Tuples Inserted</TableCell>
            <TableCell class="text-right">{pgsqlHealth.Performance?.TuplesInserted?.toLocaleString() || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Tuples Updated</TableCell>
            <TableCell class="text-right">{pgsqlHealth.Performance?.TuplesUpdated?.toLocaleString() || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Tuples Deleted</TableCell>
            <TableCell class="text-right">{pgsqlHealth.Performance?.TuplesDeleted?.toLocaleString() || 0}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Buffer Cache & Memory Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Buffer Cache & Memory</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-4">
        {#if pgsqlHealth.BufferCache}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Buffer Cache Hit Ratio</span>
              <Badge variant={getStatusColor(bufferCacheHitRatio)}>
                {bufferCacheHitRatio.toFixed(2)}%
              </Badge>
            </div>
            <Progress value={bufferCacheHitRatio} class="h-2" />
          </div>
        {/if}

        {#if pgsqlHealth.SharedBuffers}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Shared Buffers Usage</span>
              <Badge variant={getStatusColor(sharedBufferUsage)}>
                {sharedBufferUsage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={sharedBufferUsage} class="h-2" />
          </div>
        {/if}

        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Shared Buffers</TableCell>
              <TableCell class="text-right">{pgsqlHealth.SharedBuffers?.Size || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Effective Cache Size</TableCell>
              <TableCell class="text-right">{pgsqlHealth.Memory?.EffectiveCacheSize || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Work Memory</TableCell>
              <TableCell class="text-right">{pgsqlHealth.Memory?.WorkMem || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Maintenance Work Memory</TableCell>
              <TableCell class="text-right">{pgsqlHealth.Memory?.MaintenanceWorkMem || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Buffer Alloc</TableCell>
              <TableCell class="text-right">{pgsqlHealth.BufferCache?.BuffersAlloc?.toLocaleString() || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Buffer Backend</TableCell>
              <TableCell class="text-right">{pgsqlHealth.BufferCache?.BuffersBackend?.toLocaleString() || 0}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  <!-- WAL & I/O Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">WAL & I/O</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-4">
        {#if pgsqlHealth.WAL}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>WAL Usage</span>
              <Badge variant={getStatusColor(walUsage)}>
                {walUsage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={walUsage} class="h-2" />
          </div>
        {/if}

        <Table>
          <TableBody>
            <TableRow>
              <TableCell>WAL Files</TableCell>
              <TableCell class="text-right">{pgsqlHealth.WAL?.Files || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>WAL Size</TableCell>
              <TableCell class="text-right">{pgsqlHealth.WAL?.Size || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>WAL Bytes</TableCell>
              <TableCell class="text-right">{pgsqlHealth.WAL?.Bytes?.toLocaleString() || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Checkpoints Timed</TableCell>
              <TableCell class="text-right">{pgsqlHealth.Checkpoints?.Timed?.toLocaleString() || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Checkpoints Requested</TableCell>
              <TableCell class="text-right">{pgsqlHealth.Checkpoints?.Requested?.toLocaleString() || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Checkpoint Write Time</TableCell>
              <TableCell class="text-right">{pgsqlHealth.Checkpoints?.WriteTime || 0}ms</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Checkpoint Sync Time</TableCell>
              <TableCell class="text-right">{pgsqlHealth.Checkpoints?.SyncTime || 0}ms</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  <!-- Locks & Activity Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Locks & Activity</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Active Queries</TableCell>
            <TableCell class="text-right">{pgsqlHealth.Activity?.ActiveQueries || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Waiting Queries</TableCell>
            <TableCell class="text-right">{pgsqlHealth.Activity?.WaitingQueries || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Long Running Queries</TableCell>
            <TableCell class="text-right">
              {#if (pgsqlHealth.Activity?.LongRunningQueries || 0) > 0}
                <Badge variant="warning">{pgsqlHealth.Activity.LongRunningQueries}</Badge>
              {:else}
                0
              {/if}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Deadlocks</TableCell>
            <TableCell class="text-right">
              {#if (pgsqlHealth.Locks?.Deadlocks || 0) > 0}
                <Badge variant="destructive">{pgsqlHealth.Locks.Deadlocks}</Badge>
              {:else}
                0
              {/if}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Lock Waits</TableCell>
            <TableCell class="text-right">{pgsqlHealth.Locks?.Waits || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Granted Locks</TableCell>
            <TableCell class="text-right">{pgsqlHealth.Locks?.Granted?.toLocaleString() || 0}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Replication Status Card -->
  {#if pgsqlHealth.Replication}
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">Replication</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Replication Role</TableCell>
              <TableCell class="text-right">
                <Badge variant={pgsqlHealth.Replication.IsMaster ? 'success' : 'secondary'}>
                  {pgsqlHealth.Replication.IsMaster ? 'Master' : 'Slave'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Active Replicas</TableCell>
              <TableCell class="text-right">{pgsqlHealth.Replication.ActiveReplicas || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Replication Lag</TableCell>
              <TableCell class="text-right">
                {#if pgsqlHealth.Replication.LagSeconds !== undefined}
                  <Badge variant={pgsqlHealth.Replication.LagSeconds > 60 ? 'warning' : 'success'}>
                    {pgsqlHealth.Replication.LagSeconds}s
                  </Badge>
                {:else}
                  N/A
                {/if}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>WAL Sent Location</TableCell>
              <TableCell class="text-right">{pgsqlHealth.Replication.WalSentLocation || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>WAL Flush Location</TableCell>
              <TableCell class="text-right">{pgsqlHealth.Replication.WalFlushLocation || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Sync State</TableCell>
              <TableCell class="text-right">
                <Badge variant={getStatusColor(pgsqlHealth.Replication.SyncState || 'unknown')}>
                  {pgsqlHealth.Replication.SyncState || 'Unknown'}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {#if pgsqlHealth.ReplicationSlots && pgsqlHealth.ReplicationSlots.length > 0}
          <div class="mt-4">
            <h4 class="mb-2 font-semibold">Replication Slots</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slot Name</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Lag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {#each pgsqlHealth.ReplicationSlots as slot}
                  <TableRow>
                    <TableCell>{slot.SlotName}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(slot.State)}>
                        {slot.State}
                      </Badge>
                    </TableCell>
                    <TableCell>{slot.Lag || 'N/A'}</TableCell>
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
