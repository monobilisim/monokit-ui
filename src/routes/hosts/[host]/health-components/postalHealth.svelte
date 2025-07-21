<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Table, TableBody, TableCell, TableRow } from '$lib/components/ui/table';
  import { Progress } from '$lib/components/ui/progress';
  import { Badge } from '$lib/components/ui/badge';

  let { postalHealth } = $props();

  // Helper function to determine status color
  function getStatusColor(status: string) {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'healthy':
      case 'running':
      case 'active':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
      case 'offline':
      case 'failed':
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
            <TableCell>Service</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(postalHealth.Service?.Status)}>
                {postalHealth.Service?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Version</TableCell>
            <TableCell class="text-right">{postalHealth.Service?.Version || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Uptime</TableCell>
            <TableCell class="text-right">{postalHealth.Service?.Uptime || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Last Checked</TableCell>
            <TableCell class="text-right">
              {postalHealth.Service?.LastChecked
                ? new Date(postalHealth.Service.LastChecked).toLocaleString()
                : 'N/A'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Email Queue Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Email Queue</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Pending</TableCell>
            <TableCell class="text-right">
              <Badge variant="secondary">{postalHealth.Queue?.Pending || 0}</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Processing</TableCell>
            <TableCell class="text-right">
              <Badge variant="default">{postalHealth.Queue?.Processing || 0}</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Sent Today</TableCell>
            <TableCell class="text-right">{postalHealth.Queue?.SentToday || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Failed Today</TableCell>
            <TableCell class="text-right">
              <Badge variant="destructive">{postalHealth.Queue?.FailedToday || 0}</Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- SMTP Status Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">SMTP Status</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Server Status</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(postalHealth.SMTP?.Status)}>
                {postalHealth.SMTP?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Active Connections</TableCell>
            <TableCell class="text-right">{postalHealth.SMTP?.ActiveConnections || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Port</TableCell>
            <TableCell class="text-right">{postalHealth.SMTP?.Port || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Max Connections</TableCell>
            <TableCell class="text-right">{postalHealth.SMTP?.MaxConnections || 'N/A'}</TableCell>
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
            <TableCell>Connection</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(postalHealth.Database?.Status)}>
                {postalHealth.Database?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Pool Size</TableCell>
            <TableCell class="text-right">{postalHealth.Database?.PoolSize || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Active Connections</TableCell>
            <TableCell class="text-right">
              {postalHealth.Database?.ActiveConnections || 0}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Query Time (avg)</TableCell>
            <TableCell class="text-right">
              {postalHealth.Database?.AvgQueryTime
                ? `${postalHealth.Database.AvgQueryTime}ms`
                : 'N/A'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Storage Usage Card -->
  {#if postalHealth.Storage}
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">Storage Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="mt-4 space-y-2">
          <div class="space-y-2">
            <Progress value={postalHealth.Storage.UsedPct} class="h-2" />
            <div class="flex items-center justify-between text-sm">
              <span>Disk Usage</span>
              <Badge variant={getUsageColor(postalHealth.Storage.UsedPct)}>
                {postalHealth.Storage.UsedPct?.toFixed(1)}%
              </Badge>
            </div>
          </div>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Total Space</TableCell>
                <TableCell class="text-right">{postalHealth.Storage.Total || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Used Space</TableCell>
                <TableCell class="text-right">{postalHealth.Storage.Used || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Available Space</TableCell>
                <TableCell class="text-right">{postalHealth.Storage.Available || 'N/A'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- Message Statistics Card -->
  {#if postalHealth.Statistics}
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">Message Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Total Messages</TableCell>
              <TableCell class="text-right">{postalHealth.Statistics.TotalMessages || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Delivered</TableCell>
              <TableCell class="text-right">
                <Badge variant="default">{postalHealth.Statistics.Delivered || 0}</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bounced</TableCell>
              <TableCell class="text-right">
                <Badge variant="destructive">{postalHealth.Statistics.Bounced || 0}</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Delivery Rate</TableCell>
              <TableCell class="text-right">
                {postalHealth.Statistics.DeliveryRate
                  ? `${postalHealth.Statistics.DeliveryRate}%`
                  : 'N/A'}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  {/if}
</div>
