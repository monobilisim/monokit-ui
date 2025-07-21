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

  let { redisHealth } = $props();

  // Helper function to determine status color
  function getStatusColor(status: string | number) {
    if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case 'online':
        case 'connected':
        case 'running':
        case 'active':
        case 'master':
        case 'up':
        case 'ok':
          return 'success';
        case 'offline':
        case 'disconnected':
        case 'stopped':
        case 'down':
        case 'failed':
          return 'destructive';
        case 'slave':
        case 'replica':
        case 'warning':
        case 'slow':
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

  // Calculate memory usage percentage
  const memoryUsagePercentage = $derived(
    redisHealth.Memory?.UsedPercent ||
    (redisHealth.Memory?.UsedMemory && redisHealth.Memory?.MaxMemory ?
     (redisHealth.Memory.UsedMemory / redisHealth.Memory.MaxMemory) * 100 : 0)
  );

  // Calculate connection usage percentage
  const connectionUsagePercentage = $derived(
    redisHealth.Clients?.Connected && redisHealth.Clients?.MaxClients ?
    (redisHealth.Clients.Connected / redisHealth.Clients.MaxClients) * 100 : 0
  );

  // Calculate hit ratio
  const hitRatio = $derived(
    redisHealth.Stats?.KeyspaceHitRatio ||
    (redisHealth.Stats?.KeyspaceHits && redisHealth.Stats?.KeyspaceMisses ?
     (redisHealth.Stats.KeyspaceHits / (redisHealth.Stats.KeyspaceHits + redisHealth.Stats.KeyspaceMisses)) * 100 : 0)
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
              <Badge variant={getStatusColor(redisHealth.ServerStatus?.Status || 'unknown')}>
                {redisHealth.ServerStatus?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Version</TableCell>
            <TableCell class="text-right">{redisHealth.ServerInfo?.Version || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Role</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(redisHealth.ServerInfo?.Role || 'unknown')}>
                {redisHealth.ServerInfo?.Role || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Uptime</TableCell>
            <TableCell class="text-right">{redisHealth.ServerInfo?.Uptime || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Port</TableCell>
            <TableCell class="text-right">{redisHealth.ServerInfo?.Port || 6379}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Process ID</TableCell>
            <TableCell class="text-right">{redisHealth.ServerInfo?.ProcessId || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Last Updated</TableCell>
            <TableCell class="text-right">
              {redisHealth.LastChecked ? new Date(redisHealth.LastChecked).toLocaleString() : 'N/A'}
            </TableCell>
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
        {#if redisHealth.Memory}
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

        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Used Memory</TableCell>
              <TableCell class="text-right">{redisHealth.Memory?.UsedMemory || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Used Memory Human</TableCell>
              <TableCell class="text-right">{redisHealth.Memory?.UsedMemoryHuman || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Used Memory RSS</TableCell>
              <TableCell class="text-right">{redisHealth.Memory?.UsedMemoryRss || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Used Memory Peak</TableCell>
              <TableCell class="text-right">{redisHealth.Memory?.UsedMemoryPeak || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Max Memory</TableCell>
              <TableCell class="text-right">{redisHealth.Memory?.MaxMemory || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Memory Fragmentation Ratio</TableCell>
              <TableCell class="text-right">
                {#if redisHealth.Memory?.FragmentationRatio}
                  <Badge variant={redisHealth.Memory.FragmentationRatio > 1.5 ? 'warning' : 'success'}>
                    {redisHealth.Memory.FragmentationRatio.toFixed(2)}
                  </Badge>
                {:else}
                  N/A
                {/if}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  <!-- Client Connections Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Client Connections</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-4">
        {#if redisHealth.Clients && connectionUsagePercentage > 0}
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
              <TableCell>Connected Clients</TableCell>
              <TableCell class="text-right">{redisHealth.Clients?.Connected || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Client Longest Output List</TableCell>
              <TableCell class="text-right">{redisHealth.Clients?.LongestOutputList || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Client Biggest Input Buffer</TableCell>
              <TableCell class="text-right">{redisHealth.Clients?.BiggestInputBuffer || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Blocked Clients</TableCell>
              <TableCell class="text-right">{redisHealth.Clients?.Blocked || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Max Clients</TableCell>
              <TableCell class="text-right">{redisHealth.Clients?.MaxClients || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Connections Received</TableCell>
              <TableCell class="text-right">{redisHealth.Clients?.TotalConnectionsReceived?.toLocaleString() || 0}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  <!-- Performance Stats Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Performance</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-4">
        {#if redisHealth.Stats && hitRatio > 0}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Keyspace Hit Ratio</span>
              <Badge variant={getStatusColor(hitRatio)}>
                {hitRatio.toFixed(2)}%
              </Badge>
            </div>
            <Progress value={hitRatio} class="h-2" />
          </div>
        {/if}

        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Total Commands Processed</TableCell>
              <TableCell class="text-right">{redisHealth.Stats?.TotalCommandsProcessed?.toLocaleString() || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Instantaneous Ops/sec</TableCell>
              <TableCell class="text-right">{redisHealth.Stats?.InstantaneousOpsPerSec || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Keyspace Hits</TableCell>
              <TableCell class="text-right">{redisHealth.Stats?.KeyspaceHits?.toLocaleString() || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Keyspace Misses</TableCell>
              <TableCell class="text-right">{redisHealth.Stats?.KeyspaceMisses?.toLocaleString() || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Evicted Keys</TableCell>
              <TableCell class="text-right">{redisHealth.Stats?.EvictedKeys?.toLocaleString() || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Expired Keys</TableCell>
              <TableCell class="text-right">{redisHealth.Stats?.ExpiredKeys?.toLocaleString() || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Rejected Connections</TableCell>
              <TableCell class="text-right">{redisHealth.Stats?.RejectedConnections?.toLocaleString() || 0}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  <!-- Keyspace Information Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Keyspace</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Total Databases</TableCell>
            <TableCell class="text-right">{redisHealth.Keyspace?.DatabaseCount || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Total Keys</TableCell>
            <TableCell class="text-right">{redisHealth.Keyspace?.TotalKeys?.toLocaleString() || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Keys with Expiry</TableCell>
            <TableCell class="text-right">{redisHealth.Keyspace?.KeysWithExpiry?.toLocaleString() || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Average TTL</TableCell>
            <TableCell class="text-right">{redisHealth.Keyspace?.AverageTtl || 'N/A'}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {#if redisHealth.DatabaseInfo && redisHealth.DatabaseInfo.length > 0}
        <div class="mt-4">
          <h4 class="mb-2 font-semibold">Database Details</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DB</TableHead>
                <TableHead>Keys</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Avg TTL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each redisHealth.DatabaseInfo as db}
                <TableRow>
                  <TableCell>db{db.Database}</TableCell>
                  <TableCell>{db.Keys?.toLocaleString() || 0}</TableCell>
                  <TableCell>{db.Expires?.toLocaleString() || 0}</TableCell>
                  <TableCell>{db.AvgTtl || 'N/A'}</TableCell>
                </TableRow>
              {/each}
            </TableBody>
          </Table>
        </div>
      {/if}
    </CardContent>
  </Card>

  <!-- Persistence Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Persistence</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>RDB Status</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(redisHealth.Persistence?.RdbLastBgsaveStatus || 'unknown')}>
                {redisHealth.Persistence?.RdbLastBgsaveStatus || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>RDB Last Save Time</TableCell>
            <TableCell class="text-right">
              {redisHealth.Persistence?.RdbLastSaveTime ?
               new Date(redisHealth.Persistence.RdbLastSaveTime * 1000).toLocaleString() : 'N/A'}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>RDB Changes Since Last Save</TableCell>
            <TableCell class="text-right">{redisHealth.Persistence?.RdbChangesSinceLastSave?.toLocaleString() || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>RDB Current Bgsave Time</TableCell>
            <TableCell class="text-right">{redisHealth.Persistence?.RdbCurrentBgsaveTimeSec || 0}s</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>AOF Enabled</TableCell>
            <TableCell class="text-right">
              <Badge variant={redisHealth.Persistence?.AofEnabled ? 'success' : 'secondary'}>
                {redisHealth.Persistence?.AofEnabled ? 'Yes' : 'No'}
              </Badge>
            </TableCell>
          </TableRow>
          {#if redisHealth.Persistence?.AofEnabled}
            <TableRow>
              <TableCell>AOF Last Rewrite Status</TableCell>
              <TableCell class="text-right">
                <Badge variant={getStatusColor(redisHealth.Persistence?.AofLastRewriteStatus || 'unknown')}>
                  {redisHealth.Persistence?.AofLastRewriteStatus || 'Unknown'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>AOF Last Write Status</TableCell>
              <TableCell class="text-right">
                <Badge variant={getStatusColor(redisHealth.Persistence?.AofLastWriteStatus || 'unknown')}>
                  {redisHealth.Persistence?.AofLastWriteStatus || 'Unknown'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>AOF Current Size</TableCell>
              <TableCell class="text-right">{redisHealth.Persistence?.AofCurrentSize || 'N/A'}</TableCell>
            </TableRow>
          {/if}
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Replication Card -->
  {#if redisHealth.Replication}
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">Replication</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Role</TableCell>
              <TableCell class="text-right">
                <Badge variant={getStatusColor(redisHealth.Replication?.Role || 'unknown')}>
                  {redisHealth.Replication?.Role || 'Unknown'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Connected Slaves</TableCell>
              <TableCell class="text-right">{redisHealth.Replication?.ConnectedSlaves || 0}</TableCell>
            </TableRow>
            {#if redisHealth.Replication?.Role === 'slave'}
              <TableRow>
                <TableCell>Master Host</TableCell>
                <TableCell class="text-right">{redisHealth.Replication?.MasterHost || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Master Port</TableCell>
                <TableCell class="text-right">{redisHealth.Replication?.MasterPort || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Master Link Status</TableCell>
                <TableCell class="text-right">
                  <Badge variant={getStatusColor(redisHealth.Replication?.MasterLinkStatus || 'unknown')}>
                    {redisHealth.Replication?.MasterLinkStatus || 'Unknown'}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Master Last IO Seconds Ago</TableCell>
                <TableCell class="text-right">{redisHealth.Replication?.MasterLastIoSecondsAgo || 0}s</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Master Sync in Progress</TableCell>
                <TableCell class="text-right">
                  <Badge variant={redisHealth.Replication?.MasterSyncInProgress ? 'warning' : 'success'}>
                    {redisHealth.Replication?.MasterSyncInProgress ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
              </TableRow>
            {/if}
            <TableRow>
              <TableCell>Repl Backlog Active</TableCell>
              <TableCell class="text-right">
                <Badge variant={redisHealth.Replication?.ReplBacklogActive ? 'success' : 'secondary'}>
                  {redisHealth.Replication?.ReplBacklogActive ? 'Yes' : 'No'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Repl Backlog Size</TableCell>
              <TableCell class="text-right">{redisHealth.Replication?.ReplBacklogSize || 'N/A'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {#if redisHealth.SlaveInfo && redisHealth.SlaveInfo.length > 0}
          <div class="mt-4">
            <h4 class="mb-2 font-semibold">Slave Details</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>IP:Port</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Offset</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {#each redisHealth.SlaveInfo as slave}
                  <TableRow>
                    <TableCell>{slave.Id}</TableCell>
                    <TableCell>{slave.Ip}:{slave.Port}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(slave.State)}>
                        {slave.State}
                      </Badge>
                    </TableCell>
                    <TableCell>{slave.Offset}</TableCell>
                  </TableRow>
                {/each}
              </TableBody>
            </Table>
          </div>
        {/if}
      </CardContent>
    </Card>
  {/if}

  <!-- CPU Usage Card -->
  {#if redisHealth.CPU}
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">CPU Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Used CPU Sys</TableCell>
              <TableCell class="text-right">{redisHealth.CPU?.UsedCpuSys?.toFixed(2) || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Used CPU User</TableCell>
              <TableCell class="text-right">{redisHealth.CPU?.UsedCpuUser?.toFixed(2) || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Used CPU Sys Children</TableCell>
              <TableCell class="text-right">{redisHealth.CPU?.UsedCpuSysChildren?.toFixed(2) || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Used CPU User Children</TableCell>
              <TableCell class="text-right">{redisHealth.CPU?.UsedCpuUserChildren?.toFixed(2) || 0}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  {/if}
</div>
