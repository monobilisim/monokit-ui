<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Table, TableBody, TableCell, TableRow } from '$lib/components/ui/table';
  import { Progress } from '$lib/components/ui/progress';
  import { Badge } from '$lib/components/ui/badge';

  let { pritunlHealth } = $props();

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
              <Badge variant={getStatusColor(pritunlHealth.Service?.Status)}>
                {pritunlHealth.Service?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Version</TableCell>
            <TableCell class="text-right">{pritunlHealth.Service?.Version || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Uptime</TableCell>
            <TableCell class="text-right">{pritunlHealth.Service?.Uptime || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Last Checked</TableCell>
            <TableCell class="text-right">
              {pritunlHealth.Service?.LastChecked
                ? new Date(pritunlHealth.Service.LastChecked).toLocaleString()
                : 'N/A'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- VPN Servers Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">VPN Servers</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Total Servers</TableCell>
            <TableCell class="text-right">{pritunlHealth.Servers?.Total || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Online Servers</TableCell>
            <TableCell class="text-right">
              <Badge variant="default">{pritunlHealth.Servers?.Online || 0}</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Offline Servers</TableCell>
            <TableCell class="text-right">
              <Badge variant="destructive">{pritunlHealth.Servers?.Offline || 0}</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Organizations</TableCell>
            <TableCell class="text-right">{pritunlHealth.Servers?.Organizations || 0}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Connected Users Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Connected Users</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Active Connections</TableCell>
            <TableCell class="text-right">
              <Badge variant="default">{pritunlHealth.Users?.ActiveConnections || 0}</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Total Users</TableCell>
            <TableCell class="text-right">{pritunlHealth.Users?.TotalUsers || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Online Users</TableCell>
            <TableCell class="text-right">{pritunlHealth.Users?.OnlineUsers || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Max Connections</TableCell>
            <TableCell class="text-right"
              >{pritunlHealth.Users?.MaxConnections || 'Unlimited'}</TableCell
            >
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Network Statistics Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Network Statistics</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Bytes Received</TableCell>
            <TableCell class="text-right">{pritunlHealth.Network?.BytesReceived || '0 B'}</TableCell
            >
          </TableRow>
          <TableRow>
            <TableCell>Bytes Sent</TableCell>
            <TableCell class="text-right">{pritunlHealth.Network?.BytesSent || '0 B'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Packets Received</TableCell>
            <TableCell class="text-right">{pritunlHealth.Network?.PacketsReceived || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Packets Sent</TableCell>
            <TableCell class="text-right">{pritunlHealth.Network?.PacketsSent || 0}</TableCell>
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
              <Badge variant={getStatusColor(pritunlHealth.Database?.Status)}>
                {pritunlHealth.Database?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Database Type</TableCell>
            <TableCell class="text-right">{pritunlHealth.Database?.Type || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Pool Size</TableCell>
            <TableCell class="text-right">{pritunlHealth.Database?.PoolSize || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Response Time</TableCell>
            <TableCell class="text-right">
              {pritunlHealth.Database?.ResponseTime
                ? `${pritunlHealth.Database.ResponseTime}ms`
                : 'N/A'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Certificate Status Card -->
  {#if pritunlHealth.Certificates}
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">Certificate Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>CA Certificate</TableCell>
              <TableCell class="text-right">
                <Badge variant={getStatusColor(pritunlHealth.Certificates.CA?.Status)}>
                  {pritunlHealth.Certificates.CA?.Status || 'Unknown'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Server Certificate</TableCell>
              <TableCell class="text-right">
                <Badge variant={getStatusColor(pritunlHealth.Certificates.Server?.Status)}>
                  {pritunlHealth.Certificates.Server?.Status || 'Unknown'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Expires In</TableCell>
              <TableCell class="text-right"
                >{pritunlHealth.Certificates.ExpiresIn || 'N/A'}</TableCell
              >
            </TableRow>
            <TableRow>
              <TableCell>Auto Renew</TableCell>
              <TableCell class="text-right">
                <Badge variant={pritunlHealth.Certificates.AutoRenew ? 'default' : 'secondary'}>
                  {pritunlHealth.Certificates.AutoRenew ? 'Enabled' : 'Disabled'}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  {/if}

  <!-- System Resources Card -->
  {#if pritunlHealth.Resources}
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
              <Badge variant={getUsageColor(pritunlHealth.Resources.CPU?.Usage)}>
                {pritunlHealth.Resources.CPU?.Usage?.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={pritunlHealth.Resources.CPU?.Usage} class="h-2" />
          </div>

          <!-- Memory Usage -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Memory Usage</span>
              <Badge variant={getUsageColor(pritunlHealth.Resources.Memory?.Usage)}>
                {pritunlHealth.Resources.Memory?.Usage?.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={pritunlHealth.Resources.Memory?.Usage} class="h-2" />
          </div>

          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Load Average</TableCell>
                <TableCell class="text-right">{pritunlHealth.Resources.LoadAvg || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Disk Usage</TableCell>
                <TableCell class="text-right">
                  {pritunlHealth.Resources.Disk?.Usage
                    ? `${pritunlHealth.Resources.Disk.Usage}%`
                    : 'N/A'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>
