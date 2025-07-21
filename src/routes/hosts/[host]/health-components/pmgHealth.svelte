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

  let { pmgHealth } = $props();

  // Helper function to determine status color
  function getStatusColor(status: string | number) {
    if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case 'running':
        case 'online':
        case 'active':
        case 'healthy':
        case 'up':
        case 'ok':
        case 'enabled':
          return 'success';
        case 'stopped':
        case 'offline':
        case 'inactive':
        case 'unhealthy':
        case 'down':
        case 'failed':
        case 'error':
        case 'disabled':
          return 'destructive';
        case 'warning':
        case 'slow':
        case 'degraded':
        case 'partial':
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

  // Calculate resource usage percentages
  const cpuUsagePercentage = $derived(pmgHealth.Resources?.CPU?.Usage || 0);
  const memoryUsagePercentage = $derived(pmgHealth.Resources?.Memory?.UsedPercent || 0);
  const diskUsagePercentage = $derived(pmgHealth.Resources?.Disk?.UsedPercent || 0);

  // Calculate queue usage
  const queueUsagePercentage = $derived(
    pmgHealth.Queue?.Active && pmgHealth.Queue?.MaxSize ?
    (pmgHealth.Queue.Active / pmgHealth.Queue.MaxSize) * 100 : 0
  );

  // Calculate spam detection rate
  const spamDetectionRate = $derived(
    pmgHealth.MailStats?.SpamDetected && pmgHealth.MailStats?.TotalProcessed ?
    (pmgHealth.MailStats.SpamDetected / pmgHealth.MailStats.TotalProcessed) * 100 : 0
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
              <Badge variant={getStatusColor(pmgHealth.ServerStatus?.Status || 'unknown')}>
                {pmgHealth.ServerStatus?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Version</TableCell>
            <TableCell class="text-right">{pmgHealth.ServerInfo?.Version || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Kernel</TableCell>
            <TableCell class="text-right">{pmgHealth.ServerInfo?.Kernel || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Uptime</TableCell>
            <TableCell class="text-right">{pmgHealth.ServerInfo?.Uptime || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Node Name</TableCell>
            <TableCell class="text-right">{pmgHealth.ServerInfo?.NodeName || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Load Average</TableCell>
            <TableCell class="text-right">{pmgHealth.ServerInfo?.LoadAverage || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Last Updated</TableCell>
            <TableCell class="text-right">
              {pmgHealth.LastChecked ? new Date(pmgHealth.LastChecked).toLocaleString() : 'N/A'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Resource Usage Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Resource Usage</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-4">
        {#if pmgHealth.Resources?.CPU}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>CPU Usage</span>
              <Badge variant={getStatusColor(cpuUsagePercentage)}>
                {cpuUsagePercentage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={cpuUsagePercentage} class="h-2" />
          </div>
        {/if}

        {#if pmgHealth.Resources?.Memory}
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

        {#if pmgHealth.Resources?.Disk}
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
              <TableCell>Total Memory</TableCell>
              <TableCell class="text-right">{pmgHealth.Resources?.Memory?.Total || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Used Memory</TableCell>
              <TableCell class="text-right">{pmgHealth.Resources?.Memory?.Used || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Disk</TableCell>
              <TableCell class="text-right">{pmgHealth.Resources?.Disk?.Total || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Used Disk</TableCell>
              <TableCell class="text-right">{pmgHealth.Resources?.Disk?.Used || 'N/A'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  <!-- Mail Statistics Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Mail Statistics</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-4">
        {#if pmgHealth.MailStats && spamDetectionRate > 0}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Spam Detection Rate</span>
              <Badge variant="secondary">
                {spamDetectionRate.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={spamDetectionRate} class="h-2" />
          </div>
        {/if}

        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Total Processed</TableCell>
              <TableCell class="text-right">{pmgHealth.MailStats?.TotalProcessed?.toLocaleString() || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Spam Detected</TableCell>
              <TableCell class="text-right">
                {#if (pmgHealth.MailStats?.SpamDetected || 0) > 0}
                  <Badge variant="warning">{pmgHealth.MailStats.SpamDetected.toLocaleString()}</Badge>
                {:else}
                  0
                {/if}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Virus Detected</TableCell>
              <TableCell class="text-right">
                {#if (pmgHealth.MailStats?.VirusDetected || 0) > 0}
                  <Badge variant="destructive">{pmgHealth.MailStats.VirusDetected.toLocaleString()}</Badge>
                {:else}
                  0
                {/if}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bounced</TableCell>
              <TableCell class="text-right">{pmgHealth.MailStats?.Bounced?.toLocaleString() || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Greylisted</TableCell>
              <TableCell class="text-right">{pmgHealth.MailStats?.Greylisted?.toLocaleString() || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Accepted</TableCell>
              <TableCell class="text-right">{pmgHealth.MailStats?.Accepted?.toLocaleString() || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bytes Processed</TableCell>
              <TableCell class="text-right">{pmgHealth.MailStats?.BytesProcessed || 'N/A'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  <!-- Services Status Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Services</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Postfix</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(pmgHealth.Services?.Postfix || 'unknown')}>
                {pmgHealth.Services?.Postfix || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>ClamAV</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(pmgHealth.Services?.ClamAV || 'unknown')}>
                {pmgHealth.Services?.ClamAV || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>SpamAssassin</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(pmgHealth.Services?.SpamAssassin || 'unknown')}>
                {pmgHealth.Services?.SpamAssassin || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Amavis</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(pmgHealth.Services?.Amavis || 'unknown')}>
                {pmgHealth.Services?.Amavis || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Freshclam</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(pmgHealth.Services?.Freshclam || 'unknown')}>
                {pmgHealth.Services?.Freshclam || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>PMG API</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(pmgHealth.Services?.API || 'unknown')}>
                {pmgHealth.Services?.API || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Web Interface</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(pmgHealth.Services?.WebUI || 'unknown')}>
                {pmgHealth.Services?.WebUI || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Mail Queue Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Mail Queue</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-4">
        {#if pmgHealth.Queue && queueUsagePercentage > 0}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Queue Usage</span>
              <Badge variant={getStatusColor(queueUsagePercentage)}>
                {queueUsagePercentage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={queueUsagePercentage} class="h-2" />
          </div>
        {/if}

        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Active Queue</TableCell>
              <TableCell class="text-right">{pmgHealth.Queue?.Active || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Deferred Queue</TableCell>
              <TableCell class="text-right">{pmgHealth.Queue?.Deferred || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Hold Queue</TableCell>
              <TableCell class="text-right">{pmgHealth.Queue?.Hold || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Maildrop Queue</TableCell>
              <TableCell class="text-right">{pmgHealth.Queue?.Maildrop || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Incoming Queue</TableCell>
              <TableCell class="text-right">{pmgHealth.Queue?.Incoming || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Queue Size</TableCell>
              <TableCell class="text-right">{pmgHealth.Queue?.Total || 0}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  <!-- Security & Filtering Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Security & Filtering</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Virus Definitions</TableCell>
            <TableCell class="text-right">{pmgHealth.Security?.VirusDefinitions || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Last Virus DB Update</TableCell>
            <TableCell class="text-right">
              {pmgHealth.Security?.LastVirusUpdate ?
               new Date(pmgHealth.Security.LastVirusUpdate).toLocaleString() : 'N/A'}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Spam Rules Version</TableCell>
            <TableCell class="text-right">{pmgHealth.Security?.SpamRulesVersion || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Last Rules Update</TableCell>
            <TableCell class="text-right">
              {pmgHealth.Security?.LastRulesUpdate ?
               new Date(pmgHealth.Security.LastRulesUpdate).toLocaleString() : 'N/A'}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Greylisting Status</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(pmgHealth.Security?.GreylistEnabled ? 'enabled' : 'disabled')}>
                {pmgHealth.Security?.GreylistEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>RBL Checks</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(pmgHealth.Security?.RBLEnabled ? 'enabled' : 'disabled')}>
                {pmgHealth.Security?.RBLEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>TLS Policy</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(pmgHealth.Security?.TLSPolicy || 'unknown')}>
                {pmgHealth.Security?.TLSPolicy || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Configuration Status Card -->
  {#if pmgHealth.Configuration}
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Relay Mode</TableCell>
              <TableCell class="text-right">{pmgHealth.Configuration?.RelayMode || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Max Message Size</TableCell>
              <TableCell class="text-right">{pmgHealth.Configuration?.MaxMessageSize || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Backup MX</TableCell>
              <TableCell class="text-right">
                <Badge variant={pmgHealth.Configuration?.BackupMX ? 'success' : 'secondary'}>
                  {pmgHealth.Configuration?.BackupMX ? 'Enabled' : 'Disabled'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>LDAP Authentication</TableCell>
              <TableCell class="text-right">
                <Badge variant={pmgHealth.Configuration?.LDAPAuth ? 'success' : 'secondary'}>
                  {pmgHealth.Configuration?.LDAPAuth ? 'Enabled' : 'Disabled'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Quarantine</TableCell>
              <TableCell class="text-right">
                <Badge variant={pmgHealth.Configuration?.QuarantineEnabled ? 'success' : 'secondary'}>
                  {pmgHealth.Configuration?.QuarantineEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Archive</TableCell>
              <TableCell class="text-right">
                <Badge variant={pmgHealth.Configuration?.ArchiveEnabled ? 'success' : 'secondary'}>
                  {pmgHealth.Configuration?.ArchiveEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  {/if}

  <!-- Network & Connections Card -->
  {#if pmgHealth.Network}
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">Network & Connections</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Active Connections</TableCell>
              <TableCell class="text-right">{pmgHealth.Network?.ActiveConnections || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>SMTP Connections</TableCell>
              <TableCell class="text-right">{pmgHealth.Network?.SMTPConnections || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>SMTPS Connections</TableCell>
              <TableCell class="text-right">{pmgHealth.Network?.SMTPSConnections || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>HTTP Connections</TableCell>
              <TableCell class="text-right">{pmgHealth.Network?.HTTPConnections || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>HTTPS Connections</TableCell>
              <TableCell class="text-right">{pmgHealth.Network?.HTTPSConnections || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Firewall Status</TableCell>
              <TableCell class="text-right">
                <Badge variant={getStatusColor(pmgHealth.Network?.FirewallStatus || 'unknown')}>
                  {pmgHealth.Network?.FirewallStatus || 'Unknown'}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  {/if}
</div>
