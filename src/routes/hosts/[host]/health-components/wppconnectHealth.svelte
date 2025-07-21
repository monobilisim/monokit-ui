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

  let { wppconnectHealth } = $props();

  // Helper function to determine status color
  function getStatusColor(status: string) {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'healthy':
      case 'running':
      case 'active':
      case 'connected':
      case 'authenticated':
        return 'default';
      case 'warning':
      case 'disconnected':
      case 'pending':
        return 'secondary';
      case 'error':
      case 'offline':
      case 'failed':
      case 'stopped':
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
              <Badge variant={getStatusColor(wppconnectHealth.Service?.Status)}>
                {wppconnectHealth.Service?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Version</TableCell>
            <TableCell class="text-right">{wppconnectHealth.Service?.Version || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Uptime</TableCell>
            <TableCell class="text-right">{wppconnectHealth.Service?.Uptime || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Last Checked</TableCell>
            <TableCell class="text-right">
              {wppconnectHealth.Service?.LastChecked
                ? new Date(wppconnectHealth.Service.LastChecked).toLocaleString()
                : 'N/A'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- WhatsApp Connection Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">WhatsApp Connection</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Connection Status</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(wppconnectHealth.Connection?.Status)}>
                {wppconnectHealth.Connection?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Phone Number</TableCell>
            <TableCell class="text-right"
              >{wppconnectHealth.Connection?.PhoneNumber || 'N/A'}</TableCell
            >
          </TableRow>
          <TableRow>
            <TableCell>QR Code Status</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(wppconnectHealth.Connection?.QRStatus)}>
                {wppconnectHealth.Connection?.QRStatus || 'N/A'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Battery Level</TableCell>
            <TableCell class="text-right">
              {wppconnectHealth.Connection?.BatteryLevel
                ? `${wppconnectHealth.Connection.BatteryLevel}%`
                : 'N/A'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Session Information Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Session Information</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Active Sessions</TableCell>
            <TableCell class="text-right">
              <Badge variant="default">{wppconnectHealth.Sessions?.ActiveSessions || 0}</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Total Sessions</TableCell>
            <TableCell class="text-right">{wppconnectHealth.Sessions?.TotalSessions || 0}</TableCell
            >
          </TableRow>
          <TableRow>
            <TableCell>Session Timeout</TableCell>
            <TableCell class="text-right">
              {wppconnectHealth.Sessions?.Timeout
                ? `${wppconnectHealth.Sessions.Timeout}min`
                : 'N/A'}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Auto Restart</TableCell>
            <TableCell class="text-right">
              <Badge variant={wppconnectHealth.Sessions?.AutoRestart ? 'default' : 'secondary'}>
                {wppconnectHealth.Sessions?.AutoRestart ? 'Enabled' : 'Disabled'}
              </Badge>
            </TableCell>
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
            <TableCell>Messages Sent Today</TableCell>
            <TableCell class="text-right">
              <Badge variant="default">{wppconnectHealth.Messages?.SentToday || 0}</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Messages Received Today</TableCell>
            <TableCell class="text-right">{wppconnectHealth.Messages?.ReceivedToday || 0}</TableCell
            >
          </TableRow>
          <TableRow>
            <TableCell>Failed Messages</TableCell>
            <TableCell class="text-right">
              <Badge variant="destructive">{wppconnectHealth.Messages?.Failed || 0}</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Pending Messages</TableCell>
            <TableCell class="text-right">
              <Badge variant="secondary">{wppconnectHealth.Messages?.Pending || 0}</Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Webhook Status Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Webhook Status</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Webhook Status</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(wppconnectHealth.Webhook?.Status)}>
                {wppconnectHealth.Webhook?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Webhook URL</TableCell>
            <TableCell class="text-right">
              {wppconnectHealth.Webhook?.URL ? 'Configured' : 'Not Set'}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Events Sent</TableCell>
            <TableCell class="text-right">{wppconnectHealth.Webhook?.EventsSent || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Failed Deliveries</TableCell>
            <TableCell class="text-right">
              <Badge variant="destructive">{wppconnectHealth.Webhook?.FailedDeliveries || 0}</Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- API Status Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">API Status</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>API Status</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(wppconnectHealth.API?.Status)}>
                {wppconnectHealth.API?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Port</TableCell>
            <TableCell class="text-right">{wppconnectHealth.API?.Port || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Requests Today</TableCell>
            <TableCell class="text-right">{wppconnectHealth.API?.RequestsToday || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Response Time (avg)</TableCell>
            <TableCell class="text-right">
              {wppconnectHealth.API?.AvgResponseTime
                ? `${wppconnectHealth.API.AvgResponseTime}ms`
                : 'N/A'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- System Resources Card -->
  {#if wppconnectHealth.Resources}
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
              <Badge variant={getUsageColor(wppconnectHealth.Resources.CPU?.Usage)}>
                {wppconnectHealth.Resources.CPU?.Usage?.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={wppconnectHealth.Resources.CPU?.Usage} class="h-2" />
          </div>

          <!-- Memory Usage -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Memory Usage</span>
              <Badge variant={getUsageColor(wppconnectHealth.Resources.Memory?.Usage)}>
                {wppconnectHealth.Resources.Memory?.Usage?.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={wppconnectHealth.Resources.Memory?.Usage} class="h-2" />
          </div>

          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Memory Used</TableCell>
                <TableCell class="text-right"
                  >{wppconnectHealth.Resources.Memory?.Used || 'N/A'}</TableCell
                >
              </TableRow>
              <TableRow>
                <TableCell>Disk Usage</TableCell>
                <TableCell class="text-right">
                  {wppconnectHealth.Resources.Disk?.Usage
                    ? `${wppconnectHealth.Resources.Disk.Usage}%`
                    : 'N/A'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- Instance Management Card -->
  {#if wppconnectHealth.Instances}
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">Instance Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Total Instances</TableCell>
              <TableCell class="text-right">{wppconnectHealth.Instances.Total || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Active Instances</TableCell>
              <TableCell class="text-right">
                <Badge variant="default">{wppconnectHealth.Instances.Active || 0}</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Inactive Instances</TableCell>
              <TableCell class="text-right">
                <Badge variant="secondary">{wppconnectHealth.Instances.Inactive || 0}</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Max Instances</TableCell>
              <TableCell class="text-right"
                >{wppconnectHealth.Instances.MaxInstances || 'Unlimited'}</TableCell
              >
            </TableRow>
          </TableBody>
        </Table>

        {#if wppconnectHealth.Instances.List && wppconnectHealth.Instances.List.length > 0}
          <div class="mt-4">
            <h4 class="mb-2 font-semibold">Instance Details</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Connected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {#each wppconnectHealth.Instances.List as instance (instance.Name)}
                  <TableRow>
                    <TableCell>{instance.Name}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(instance.Status)}>
                        {instance.Status}
                      </Badge>
                    </TableCell>
                    <TableCell>{instance.Phone || 'N/A'}</TableCell>
                    <TableCell
                      >{instance.ConnectedAt
                        ? new Date(instance.ConnectedAt).toLocaleString()
                        : 'N/A'}</TableCell
                    >
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
