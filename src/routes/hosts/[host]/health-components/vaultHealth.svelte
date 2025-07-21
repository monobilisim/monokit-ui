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

  let { vaultHealth } = $props();

  // Helper function to determine status color
  function getStatusColor(status: string | number) {
    if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case 'unsealed':
        case 'active':
        case 'healthy':
        case 'enabled':
        case 'online':
        case 'running':
        case 'valid':
        case 'success':
          return 'default';
        case 'sealed':
        case 'standby':
        case 'inactive':
        case 'disabled':
        case 'offline':
        case 'stopped':
        case 'invalid':
        case 'failed':
        case 'error':
        case 'unhealthy':
          return 'destructive';
        case 'warning':
        case 'degraded':
        case 'partial':
        case 'initializing':
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

  // Calculate seal progress percentage
  const sealProgressPercentage = $derived(
    vaultHealth.SealStatus?.Progress && vaultHealth.SealStatus?.Threshold
      ? (vaultHealth.SealStatus.Progress / vaultHealth.SealStatus.Threshold) * 100
      : 0
  );

  // Calculate storage usage if available
  const storageUsagePercentage = $derived(vaultHealth.Storage?.UsedPercent || 0);

  // Calculate token usage if available
  const tokenUsagePercentage = $derived(
    vaultHealth.Tokens?.Used && vaultHealth.Tokens?.Limit
      ? (vaultHealth.Tokens.Used / vaultHealth.Tokens.Limit) * 100
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
            <TableCell>Health Status</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(vaultHealth.HealthStatus?.Status || 'unknown')}>
                {vaultHealth.HealthStatus?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Seal Status</TableCell>
            <TableCell class="text-right">
              <Badge
                variant={getStatusColor(vaultHealth.SealStatus?.Sealed ? 'sealed' : 'unsealed')}
              >
                {vaultHealth.SealStatus?.Sealed ? 'Sealed' : 'Unsealed'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>HA Status</TableCell>
            <TableCell class="text-right">
              <Badge
                variant={getStatusColor(vaultHealth.HAStatus?.IsActive ? 'active' : 'standby')}
              >
                {vaultHealth.HAStatus?.IsActive ? 'Active' : 'Standby'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Version</TableCell>
            <TableCell class="text-right">{vaultHealth.ServerInfo?.Version || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Cluster Name</TableCell>
            <TableCell class="text-right">{vaultHealth.ServerInfo?.ClusterName || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Cluster ID</TableCell>
            <TableCell class="text-right">{vaultHealth.ServerInfo?.ClusterId || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Last Updated</TableCell>
            <TableCell class="text-right">
              {vaultHealth.LastChecked ? new Date(vaultHealth.LastChecked).toLocaleString() : 'N/A'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Seal Status Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Seal Information</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-4">
        {#if vaultHealth.SealStatus && !vaultHealth.SealStatus.Sealed && sealProgressPercentage > 0}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Unseal Progress</span>
              <Badge variant={getStatusColor(sealProgressPercentage)}>
                {sealProgressPercentage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={sealProgressPercentage} class="h-2" />
          </div>
        {/if}

        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Seal Type</TableCell>
              <TableCell class="text-right">{vaultHealth.SealStatus?.Type || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Threshold</TableCell>
              <TableCell class="text-right">{vaultHealth.SealStatus?.Threshold || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Shares</TableCell>
              <TableCell class="text-right">{vaultHealth.SealStatus?.N || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Progress</TableCell>
              <TableCell class="text-right">{vaultHealth.SealStatus?.Progress || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Nonce</TableCell>
              <TableCell class="text-right">{vaultHealth.SealStatus?.Nonce || 'None'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Migration</TableCell>
              <TableCell class="text-right">
                <Badge variant={vaultHealth.SealStatus?.Migration ? 'outline' : 'default'}>
                  {vaultHealth.SealStatus?.Migration ? 'In Progress' : 'None'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Recovery Seal</TableCell>
              <TableCell class="text-right">
                <Badge variant={vaultHealth.SealStatus?.RecoverySeal ? 'default' : 'secondary'}>
                  {vaultHealth.SealStatus?.RecoverySeal ? 'Enabled' : 'Disabled'}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  <!-- Auth Methods Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Authentication Methods</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Total Auth Methods</TableCell>
            <TableCell class="text-right">{vaultHealth.AuthMethods?.Total || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Enabled Methods</TableCell>
            <TableCell class="text-right">{vaultHealth.AuthMethods?.Enabled || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Token Auth</TableCell>
            <TableCell class="text-right">
              <Badge variant={vaultHealth.AuthMethods?.TokenEnabled ? 'default' : 'secondary'}>
                {vaultHealth.AuthMethods?.TokenEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>LDAP Auth</TableCell>
            <TableCell class="text-right">
              <Badge variant={vaultHealth.AuthMethods?.LdapEnabled ? 'default' : 'secondary'}>
                {vaultHealth.AuthMethods?.LdapEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>AWS Auth</TableCell>
            <TableCell class="text-right">
              <Badge variant={vaultHealth.AuthMethods?.AwsEnabled ? 'default' : 'secondary'}>
                {vaultHealth.AuthMethods?.AwsEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {#if vaultHealth.AuthMethodList && vaultHealth.AuthMethodList.length > 0}
        <div class="mt-4">
          <h4 class="mb-2 font-semibold">Auth Method Details</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Path</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each vaultHealth.AuthMethodList as method (method.Path)}
                <TableRow>
                  <TableCell>{method.Path}</TableCell>
                  <TableCell>{method.Type}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(method.Status)}>
                      {method.Status}
                    </Badge>
                  </TableCell>
                  <TableCell>{method.Version || 'N/A'}</TableCell>
                </TableRow>
              {/each}
            </TableBody>
          </Table>
        </div>
      {/if}
    </CardContent>
  </Card>

  <!-- Secret Engines Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Secret Engines</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Total Secret Engines</TableCell>
            <TableCell class="text-right">{vaultHealth.SecretEngines?.Total || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Enabled Engines</TableCell>
            <TableCell class="text-right">{vaultHealth.SecretEngines?.Enabled || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>KV v1</TableCell>
            <TableCell class="text-right">{vaultHealth.SecretEngines?.KvV1 || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>KV v2</TableCell>
            <TableCell class="text-right">{vaultHealth.SecretEngines?.KvV2 || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>PKI</TableCell>
            <TableCell class="text-right">{vaultHealth.SecretEngines?.Pki || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Database</TableCell>
            <TableCell class="text-right">{vaultHealth.SecretEngines?.Database || 0}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {#if vaultHealth.SecretEngineList && vaultHealth.SecretEngineList.length > 0}
        <div class="mt-4">
          <h4 class="mb-2 font-semibold">Secret Engine Details</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Path</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each vaultHealth.SecretEngineList as engine (engine.Path)}
                <TableRow>
                  <TableCell>{engine.Path}</TableCell>
                  <TableCell>{engine.Type}</TableCell>
                  <TableCell>{engine.Version || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(engine.Status)}>
                      {engine.Status}
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

  <!-- Policies & Tokens Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Policies & Tokens</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-4">
        {#if vaultHealth.Tokens && tokenUsagePercentage > 0}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Token Usage</span>
              <Badge variant={getStatusColor(tokenUsagePercentage)}>
                {tokenUsagePercentage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={tokenUsagePercentage} class="h-2" />
          </div>
        {/if}

        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Total Policies</TableCell>
              <TableCell class="text-right">{vaultHealth.Policies?.Total || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>ACL Policies</TableCell>
              <TableCell class="text-right">{vaultHealth.Policies?.Acl || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>RGP Policies</TableCell>
              <TableCell class="text-right">{vaultHealth.Policies?.Rgp || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>EGP Policies</TableCell>
              <TableCell class="text-right">{vaultHealth.Policies?.Egp || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Active Tokens</TableCell>
              <TableCell class="text-right">{vaultHealth.Tokens?.Active || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Root Tokens</TableCell>
              <TableCell class="text-right">{vaultHealth.Tokens?.Root || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Service Tokens</TableCell>
              <TableCell class="text-right">{vaultHealth.Tokens?.Service || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Batch Tokens</TableCell>
              <TableCell class="text-right">{vaultHealth.Tokens?.Batch || 0}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  <!-- Storage & Performance Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Storage & Performance</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-4">
        {#if vaultHealth.Storage && storageUsagePercentage > 0}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Storage Usage</span>
              <Badge variant={getStatusColor(storageUsagePercentage)}>
                {storageUsagePercentage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={storageUsagePercentage} class="h-2" />
          </div>
        {/if}

        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Storage Backend</TableCell>
              <TableCell class="text-right">{vaultHealth.Storage?.Backend || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Storage Path</TableCell>
              <TableCell class="text-right">{vaultHealth.Storage?.Path || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>HA Enabled</TableCell>
              <TableCell class="text-right">
                <Badge variant={vaultHealth.Storage?.HAEnabled ? 'default' : 'secondary'}>
                  {vaultHealth.Storage?.HAEnabled ? 'Yes' : 'No'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Storage Version</TableCell>
              <TableCell class="text-right">{vaultHealth.Storage?.Version || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Request Rate</TableCell>
              <TableCell class="text-right"
                >{vaultHealth.Performance?.RequestRate || 0} req/s</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Average Request Time</TableCell>
              <TableCell class="text-right"
                >{vaultHealth.Performance?.AvgRequestTime || 0}ms</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Total Requests</TableCell>
              <TableCell class="text-right"
                >{vaultHealth.Performance?.TotalRequests?.toLocaleString() || 0}</TableCell
              >
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  <!-- Audit Devices Card -->
  {#if vaultHealth.AuditDevices}
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">Audit Devices</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Total Audit Devices</TableCell>
              <TableCell class="text-right">{vaultHealth.AuditDevices?.Total || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Enabled Devices</TableCell>
              <TableCell class="text-right">{vaultHealth.AuditDevices?.Enabled || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>File Devices</TableCell>
              <TableCell class="text-right">{vaultHealth.AuditDevices?.File || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Syslog Devices</TableCell>
              <TableCell class="text-right">{vaultHealth.AuditDevices?.Syslog || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Socket Devices</TableCell>
              <TableCell class="text-right">{vaultHealth.AuditDevices?.Socket || 0}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {#if vaultHealth.AuditDeviceList && vaultHealth.AuditDeviceList.length > 0}
          <div class="mt-4">
            <h4 class="mb-2 font-semibold">Audit Device Details</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Path</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {#each vaultHealth.AuditDeviceList as device (device.Path)}
                  <TableRow>
                    <TableCell>{device.Path}</TableCell>
                    <TableCell>{device.Type}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(device.Status)}>
                        {device.Status}
                      </Badge>
                    </TableCell>
                    <TableCell>{device.Description || 'N/A'}</TableCell>
                  </TableRow>
                {/each}
              </TableBody>
            </Table>
          </div>
        {/if}
      </CardContent>
    </Card>
  {/if}

  <!-- High Availability Card -->
  {#if vaultHealth.HAStatus}
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">High Availability</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>HA Mode</TableCell>
              <TableCell class="text-right">
                <Badge variant={vaultHealth.HAStatus?.HAEnabled ? 'default' : 'secondary'}>
                  {vaultHealth.HAStatus?.HAEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Is Active</TableCell>
              <TableCell class="text-right">
                <Badge variant={vaultHealth.HAStatus?.IsActive ? 'default' : 'outline'}>
                  {vaultHealth.HAStatus?.IsActive ? 'Yes' : 'No'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Active Time</TableCell>
              <TableCell class="text-right">{vaultHealth.HAStatus?.ActiveTime || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Leader Address</TableCell>
              <TableCell class="text-right"
                >{vaultHealth.HAStatus?.LeaderAddress || 'N/A'}</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Leader Cluster Address</TableCell>
              <TableCell class="text-right"
                >{vaultHealth.HAStatus?.LeaderClusterAddress || 'N/A'}</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Performance Standby</TableCell>
              <TableCell class="text-right">
                <Badge variant={vaultHealth.HAStatus?.PerformanceStandby ? 'default' : 'secondary'}>
                  {vaultHealth.HAStatus?.PerformanceStandby ? 'Yes' : 'No'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Raft Applied Index</TableCell>
              <TableCell class="text-right"
                >{vaultHealth.HAStatus?.RaftAppliedIndex || 'N/A'}</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Raft Committed Index</TableCell>
              <TableCell class="text-right"
                >{vaultHealth.HAStatus?.RaftCommittedIndex || 'N/A'}</TableCell
              >
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  {/if}
</div>
