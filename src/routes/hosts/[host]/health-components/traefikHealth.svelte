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

  let { traefikHealth } = $props();

  // Helper function to determine status color
  function getStatusColor(status: string | number) {
    if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case 'up':
        case 'healthy':
        case 'running':
        case 'active':
        case 'enabled':
        case 'valid':
        case 'success':
          return 'success';
        case 'down':
        case 'unhealthy':
        case 'stopped':
        case 'inactive':
        case 'disabled':
        case 'invalid':
        case 'failed':
        case 'error':
          return 'destructive';
        case 'warning':
        case 'degraded':
        case 'partial':
        case 'expiring':
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

  // Calculate service health percentage
  const serviceHealthPercentage = $derived(
    traefikHealth.Services?.Healthy && traefikHealth.Services?.Total ?
    (traefikHealth.Services.Healthy / traefikHealth.Services.Total) * 100 : 0
  );

  // Calculate router health percentage
  const routerHealthPercentage = $derived(
    traefikHealth.Routers?.Active && traefikHealth.Routers?.Total ?
    (traefikHealth.Routers.Active / traefikHealth.Routers.Total) * 100 : 0
  );

  // Calculate average response time color
  const responseTimeColor = $derived(() => {
    if (!traefikHealth.Metrics?.AverageResponseTime) return 'success';
    const avgTime = traefikHealth.Metrics.AverageResponseTime;
    if (avgTime > 1000) return 'destructive';
    if (avgTime > 500) return 'warning';
    return 'success';
  });
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
              <Badge variant={getStatusColor(traefikHealth.ServerStatus?.Status || 'unknown')}>
                {traefikHealth.ServerStatus?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Version</TableCell>
            <TableCell class="text-right">{traefikHealth.ServerInfo?.Version || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Build Date</TableCell>
            <TableCell class="text-right">{traefikHealth.ServerInfo?.BuildDate || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Uptime</TableCell>
            <TableCell class="text-right">{traefikHealth.ServerInfo?.Uptime || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Dashboard Port</TableCell>
            <TableCell class="text-right">{traefikHealth.ServerInfo?.DashboardPort || 8080}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>API Status</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(traefikHealth.API?.Status || 'unknown')}>
                {traefikHealth.API?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Last Updated</TableCell>
            <TableCell class="text-right">
              {traefikHealth.LastChecked ? new Date(traefikHealth.LastChecked).toLocaleString() : 'N/A'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Services Health Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Services</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-4">
        {#if traefikHealth.Services && serviceHealthPercentage > 0}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Healthy Services</span>
              <Badge variant={getStatusColor(serviceHealthPercentage)}>
                {serviceHealthPercentage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={serviceHealthPercentage} class="h-2" />
          </div>
        {/if}

        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Total Services</TableCell>
              <TableCell class="text-right">{traefikHealth.Services?.Total || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Healthy Services</TableCell>
              <TableCell class="text-right">{traefikHealth.Services?.Healthy || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Unhealthy Services</TableCell>
              <TableCell class="text-right">{traefikHealth.Services?.Unhealthy || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>HTTP Services</TableCell>
              <TableCell class="text-right">{traefikHealth.Services?.Http || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>TCP Services</TableCell>
              <TableCell class="text-right">{traefikHealth.Services?.Tcp || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>UDP Services</TableCell>
              <TableCell class="text-right">{traefikHealth.Services?.Udp || 0}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {#if traefikHealth.ServiceList && traefikHealth.ServiceList.length > 0}
          <div class="mt-4">
            <h4 class="mb-2 font-semibold">Service Details</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Servers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {#each traefikHealth.ServiceList as service}
                  <TableRow>
                    <TableCell>{service.Name}</TableCell>
                    <TableCell>{service.Type || 'HTTP'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(service.Status)}>
                        {service.Status}
                      </Badge>
                    </TableCell>
                    <TableCell>{service.ServerCount || 0}</TableCell>
                  </TableRow>
                {/each}
              </TableBody>
            </Table>
          </div>
        {/if}
      </div>
    </CardContent>
  </Card>

  <!-- Routers Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Routers</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-4">
        {#if traefikHealth.Routers && routerHealthPercentage > 0}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Active Routers</span>
              <Badge variant={getStatusColor(routerHealthPercentage)}>
                {routerHealthPercentage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={routerHealthPercentage} class="h-2" />
          </div>
        {/if}

        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Total Routers</TableCell>
              <TableCell class="text-right">{traefikHealth.Routers?.Total || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Active Routers</TableCell>
              <TableCell class="text-right">{traefikHealth.Routers?.Active || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>HTTP Routers</TableCell>
              <TableCell class="text-right">{traefikHealth.Routers?.Http || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>TCP Routers</TableCell>
              <TableCell class="text-right">{traefikHealth.Routers?.Tcp || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>UDP Routers</TableCell>
              <TableCell class="text-right">{traefikHealth.Routers?.Udp || 0}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {#if traefikHealth.RouterList && traefikHealth.RouterList.length > 0}
          <div class="mt-4">
            <h4 class="mb-2 font-semibold">Router Details</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Rule</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {#each traefikHealth.RouterList as router}
                  <TableRow>
                    <TableCell>{router.Name}</TableCell>
                    <TableCell class="max-w-32 truncate" title={router.Rule}>{router.Rule || 'N/A'}</TableCell>
                    <TableCell>{router.Service || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(router.Status)}>
                        {router.Status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                {/each}
              </TableBody>
            </Table>
          </div>
        {/if}
      </div>
    </CardContent>
  </Card>

  <!-- Entrypoints Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Entrypoints</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Total Entrypoints</TableCell>
            <TableCell class="text-right">{traefikHealth.Entrypoints?.Total || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>HTTP Entrypoints</TableCell>
            <TableCell class="text-right">{traefikHealth.Entrypoints?.Http || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>HTTPS Entrypoints</TableCell>
            <TableCell class="text-right">{traefikHealth.Entrypoints?.Https || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>TCP Entrypoints</TableCell>
            <TableCell class="text-right">{traefikHealth.Entrypoints?.Tcp || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>UDP Entrypoints</TableCell>
            <TableCell class="text-right">{traefikHealth.Entrypoints?.Udp || 0}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {#if traefikHealth.EntrypointList && traefikHealth.EntrypointList.length > 0}
        <div class="mt-4">
          <h4 class="mb-2 font-semibold">Entrypoint Details</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Protocol</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each traefikHealth.EntrypointList as entrypoint}
                <TableRow>
                  <TableCell>{entrypoint.Name}</TableCell>
                  <TableCell>{entrypoint.Address || 'N/A'}</TableCell>
                  <TableCell>{entrypoint.Protocol || 'HTTP'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(entrypoint.Status)}>
                      {entrypoint.Status}
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

  <!-- Middleware Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Middleware</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Total Middleware</TableCell>
            <TableCell class="text-right">{traefikHealth.Middleware?.Total || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Active Middleware</TableCell>
            <TableCell class="text-right">{traefikHealth.Middleware?.Active || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>HTTP Middleware</TableCell>
            <TableCell class="text-right">{traefikHealth.Middleware?.Http || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>TCP Middleware</TableCell>
            <TableCell class="text-right">{traefikHealth.Middleware?.Tcp || 0}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {#if traefikHealth.MiddlewareList && traefikHealth.MiddlewareList.length > 0}
        <div class="mt-4">
          <h4 class="mb-2 font-semibold">Middleware Details</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each traefikHealth.MiddlewareList as middleware}
                <TableRow>
                  <TableCell>{middleware.Name}</TableCell>
                  <TableCell>{middleware.Type || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(middleware.Status)}>
                      {middleware.Status}
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

  <!-- Metrics & Performance Card -->
  {#if traefikHealth.Metrics}
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">Metrics & Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Total Requests</TableCell>
              <TableCell class="text-right">{traefikHealth.Metrics?.TotalRequests?.toLocaleString() || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Requests/sec</TableCell>
              <TableCell class="text-right">{traefikHealth.Metrics?.RequestsPerSecond?.toFixed(2) || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Average Response Time</TableCell>
              <TableCell class="text-right">
                <Badge variant={responseTimeColor()}>
                  {traefikHealth.Metrics?.AverageResponseTime || 0}ms
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>2xx Responses</TableCell>
              <TableCell class="text-right">{traefikHealth.Metrics?.Status2xx?.toLocaleString() || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>3xx Responses</TableCell>
              <TableCell class="text-right">{traefikHealth.Metrics?.Status3xx?.toLocaleString() || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>4xx Responses</TableCell>
              <TableCell class="text-right">
                {#if (traefikHealth.Metrics?.Status4xx || 0) > 0}
                  <Badge variant="warning">{traefikHealth.Metrics.Status4xx.toLocaleString()}</Badge>
                {:else}
                  0
                {/if}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>5xx Responses</TableCell>
              <TableCell class="text-right">
                {#if (traefikHealth.Metrics?.Status5xx || 0) > 0}
                  <Badge variant="destructive">{traefikHealth.Metrics.Status5xx.toLocaleString()}</Badge>
                {:else}
                  0
                {/if}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  {/if}

  <!-- Certificates Card -->
  {#if traefikHealth.Certificates}
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">TLS Certificates</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Total Certificates</TableCell>
              <TableCell class="text-right">{traefikHealth.Certificates?.Total || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Valid Certificates</TableCell>
              <TableCell class="text-right">{traefikHealth.Certificates?.Valid || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Expiring Soon</TableCell>
              <TableCell class="text-right">
                {#if (traefikHealth.Certificates?.ExpiringSoon || 0) > 0}
                  <Badge variant="warning">{traefikHealth.Certificates.ExpiringSoon}</Badge>
                {:else}
                  0
                {/if}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Expired</TableCell>
              <TableCell class="text-right">
                {#if (traefikHealth.Certificates?.Expired || 0) > 0}
                  <Badge variant="destructive">{traefikHealth.Certificates.Expired}</Badge>
                {:else}
                  0
                {/if}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Let's Encrypt</TableCell>
              <TableCell class="text-right">{traefikHealth.Certificates?.LetsEncrypt || 0}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {#if traefikHealth.CertificateList && traefikHealth.CertificateList.length > 0}
          <div class="mt-4">
            <h4 class="mb-2 font-semibold">Certificate Details</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Issuer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {#each traefikHealth.CertificateList as cert}
                  <TableRow>
                    <TableCell>{cert.Domain}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(cert.Status)}>
                        {cert.Status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {cert.ExpiresAt ? new Date(cert.ExpiresAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>{cert.Issuer || 'N/A'}</TableCell>
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
