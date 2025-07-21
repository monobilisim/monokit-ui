<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Table, TableBody, TableCell, TableRow } from '$lib/components/ui/table';
  import { Progress } from '$lib/components/ui/progress';
  import { Badge } from '$lib/components/ui/badge';

  let { zimbraHealth } = $props();

  // Helper function to determine status color
  function getStatusColor(status: string) {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'healthy':
      case 'running':
      case 'active':
      case 'enabled':
      case 'up':
        return 'default';
      case 'warning':
      case 'degraded':
      case 'partial':
        return 'secondary';
      case 'error':
      case 'offline':
      case 'failed':
      case 'stopped':
      case 'down':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  // Helper function to get usage color based on percentage
  function getUsageColor(percentage: number) {
    if (percentage >= 90) return 'destructive';
    if (percentage >= 70) return 'secondary';
    return 'default';
  }
</script>

<div class="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <!-- Service Status Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Service Status</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Zimbra Status</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(zimbraHealth.Service?.Status)}>
                {zimbraHealth.Service?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Version</TableCell>
            <TableCell class="text-right">{zimbraHealth.Service?.Version || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Build</TableCell>
            <TableCell class="text-right">{zimbraHealth.Service?.Build || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Uptime</TableCell>
            <TableCell class="text-right">{zimbraHealth.Service?.Uptime || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Last Checked</TableCell>
            <TableCell class="text-right">
              {zimbraHealth.Service?.LastChecked
                ? new Date(zimbraHealth.Service.LastChecked).toLocaleString()
                : 'N/A'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Email Services Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Email Services</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>SMTP Service</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(zimbraHealth.EmailServices?.SMTP?.Status)}>
                {zimbraHealth.EmailServices?.SMTP?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>IMAP Service</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(zimbraHealth.EmailServices?.IMAP?.Status)}>
                {zimbraHealth.EmailServices?.IMAP?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>POP3 Service</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(zimbraHealth.EmailServices?.POP3?.Status)}>
                {zimbraHealth.EmailServices?.POP3?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>WebMail Service</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(zimbraHealth.EmailServices?.WebMail?.Status)}>
                {zimbraHealth.EmailServices?.WebMail?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- LDAP Status Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">LDAP Directory</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>LDAP Status</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(zimbraHealth.LDAP?.Status)}>
                {zimbraHealth.LDAP?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>LDAP Port</TableCell>
            <TableCell class="text-right">{zimbraHealth.LDAP?.Port || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>SSL Port</TableCell>
            <TableCell class="text-right">{zimbraHealth.LDAP?.SSLPort || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Response Time</TableCell>
            <TableCell class="text-right">
              {zimbraHealth.LDAP?.ResponseTime ? `${zimbraHealth.LDAP.ResponseTime}ms` : 'N/A'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Database Status Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Database Status</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Database Status</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(zimbraHealth.Database?.Status)}>
                {zimbraHealth.Database?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Database Type</TableCell>
            <TableCell class="text-right">{zimbraHealth.Database?.Type || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Version</TableCell>
            <TableCell class="text-right">{zimbraHealth.Database?.Version || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Connections</TableCell>
            <TableCell class="text-right">{zimbraHealth.Database?.ActiveConnections || 0}</TableCell
            >
          </TableRow>
          <TableRow>
            <TableCell>Query Time (avg)</TableCell>
            <TableCell class="text-right">
              {zimbraHealth.Database?.AvgQueryTime
                ? `${zimbraHealth.Database.AvgQueryTime}ms`
                : 'N/A'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Storage Usage Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Storage Usage</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-4">
        <!-- Mailbox Storage -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span>Mailbox Storage</span>
            <Badge variant={getUsageColor(zimbraHealth.Storage?.MailboxUsagePct)}>
              {zimbraHealth.Storage?.MailboxUsagePct?.toFixed(1)}%
            </Badge>
          </div>
          <Progress value={zimbraHealth.Storage?.MailboxUsagePct} class="h-2" />
        </div>

        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Total Storage</TableCell>
              <TableCell class="text-right">{zimbraHealth.Storage?.TotalStorage || 'N/A'}</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Used Storage</TableCell>
              <TableCell class="text-right">{zimbraHealth.Storage?.UsedStorage || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Index Storage</TableCell>
              <TableCell class="text-right">{zimbraHealth.Storage?.IndexStorage || 'N/A'}</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Backup Storage</TableCell>
              <TableCell class="text-right"
                >{zimbraHealth.Storage?.BackupStorage || 'N/A'}</TableCell
              >
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  <!-- User Statistics Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">User Statistics</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Total Mailboxes</TableCell>
            <TableCell class="text-right">{zimbraHealth.Users?.TotalMailboxes || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Active Users</TableCell>
            <TableCell class="text-right">
              <Badge variant="default">{zimbraHealth.Users?.ActiveUsers || 0}</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Online Users</TableCell>
            <TableCell class="text-right">{zimbraHealth.Users?.OnlineUsers || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>IMAP Connections</TableCell>
            <TableCell class="text-right">{zimbraHealth.Users?.IMAPConnections || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>WebMail Sessions</TableCell>
            <TableCell class="text-right">{zimbraHealth.Users?.WebMailSessions || 0}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Message Statistics Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Message Statistics</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Messages Today</TableCell>
            <TableCell class="text-right">
              <Badge variant="default">{zimbraHealth.Messages?.Today || 0}</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Messages Delivered</TableCell>
            <TableCell class="text-right">{zimbraHealth.Messages?.Delivered || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Messages Deferred</TableCell>
            <TableCell class="text-right">
              <Badge variant="secondary">{zimbraHealth.Messages?.Deferred || 0}</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Messages Rejected</TableCell>
            <TableCell class="text-right">
              <Badge variant="destructive">{zimbraHealth.Messages?.Rejected || 0}</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Queue Size</TableCell>
            <TableCell class="text-right">{zimbraHealth.Messages?.QueueSize || 0}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Anti-Spam/Anti-Virus Card -->
  {#if zimbraHealth.AntiSpam || zimbraHealth.AntiVirus}
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">Security Services</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Anti-Spam Status</TableCell>
              <TableCell class="text-right">
                <Badge variant={getStatusColor(zimbraHealth.AntiSpam?.Status)}>
                  {zimbraHealth.AntiSpam?.Status || 'Unknown'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Anti-Virus Status</TableCell>
              <TableCell class="text-right">
                <Badge variant={getStatusColor(zimbraHealth.AntiVirus?.Status)}>
                  {zimbraHealth.AntiVirus?.Status || 'Unknown'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Spam Blocked Today</TableCell>
              <TableCell class="text-right">
                <Badge variant="default">{zimbraHealth.AntiSpam?.BlockedToday || 0}</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Viruses Blocked Today</TableCell>
              <TableCell class="text-right">
                <Badge variant="destructive">{zimbraHealth.AntiVirus?.BlockedToday || 0}</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  {/if}

  <!-- Backup Status Card -->
  {#if zimbraHealth.Backup}
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">Backup Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Backup Status</TableCell>
              <TableCell class="text-right">
                <Badge variant={getStatusColor(zimbraHealth.Backup?.Status)}>
                  {zimbraHealth.Backup?.Status || 'Unknown'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Last Backup</TableCell>
              <TableCell class="text-right">
                {zimbraHealth.Backup?.LastBackup
                  ? new Date(zimbraHealth.Backup.LastBackup).toLocaleString()
                  : 'N/A'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Next Backup</TableCell>
              <TableCell class="text-right">
                {zimbraHealth.Backup?.NextBackup
                  ? new Date(zimbraHealth.Backup.NextBackup).toLocaleString()
                  : 'N/A'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Backup Size</TableCell>
              <TableCell class="text-right">{zimbraHealth.Backup?.BackupSize || 'N/A'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  {/if}

  <!-- System Resources Card -->
  {#if zimbraHealth.Resources}
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">System Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="mt-4 space-y-4">
          <!-- CPU Usage -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>CPU Usage</span>
              <Badge variant={getUsageColor(zimbraHealth.Resources.CPU?.Usage)}>
                {zimbraHealth.Resources.CPU?.Usage?.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={zimbraHealth.Resources.CPU?.Usage} class="h-2" />
          </div>

          <!-- Memory Usage -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Memory Usage</span>
              <Badge variant={getUsageColor(zimbraHealth.Resources.Memory?.Usage)}>
                {zimbraHealth.Resources.Memory?.Usage?.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={zimbraHealth.Resources.Memory?.Usage} class="h-2" />
          </div>

          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Load Average</TableCell>
                <TableCell class="text-right">{zimbraHealth.Resources.LoadAvg || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Java Heap Used</TableCell>
                <TableCell class="text-right"
                  >{zimbraHealth.Resources.JavaHeap?.Used || 'N/A'}</TableCell
                >
              </TableRow>
              <TableRow>
                <TableCell>Java Heap Max</TableCell>
                <TableCell class="text-right"
                  >{zimbraHealth.Resources.JavaHeap?.Max || 'N/A'}</TableCell
                >
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>
