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

  let { k8sHealth } = $props();

  // Helper function to determine status color
  function getStatusColor(status: string | number) {
    if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case 'ready':
        case 'running':
        case 'active':
        case 'healthy':
          return 'success';
        case 'notready':
        case 'pending':
        case 'warning':
          return 'warning';
        case 'failed':
        case 'error':
        case 'unhealthy':
          return 'destructive';
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
  const cpuUsagePercentage = $derived(
    k8sHealth.Resources?.CPU?.UsedPercent || 0
  );

  const memoryUsagePercentage = $derived(
    k8sHealth.Resources?.Memory?.UsedPercent || 0
  );

  const podUsagePercentage = $derived(
    k8sHealth.Resources?.Pods?.Used && k8sHealth.Resources?.Pods?.Capacity ?
    (k8sHealth.Resources.Pods.Used / k8sHealth.Resources.Pods.Capacity) * 100 : 0
  );
</script>

<div class="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <!-- Cluster Status Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Cluster Status</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cluster Name</TableCell>
            <TableCell class="text-right">{k8sHealth.ClusterInfo?.Name || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Version</TableCell>
            <TableCell class="text-right">{k8sHealth.ClusterInfo?.Version || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>API Server</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(k8sHealth.APIServer?.Status || 'unknown')}>
                {k8sHealth.APIServer?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>etcd Status</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(k8sHealth.Etcd?.Status || 'unknown')}>
                {k8sHealth.Etcd?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Controller Manager</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(k8sHealth.ControllerManager?.Status || 'unknown')}>
                {k8sHealth.ControllerManager?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Scheduler</TableCell>
            <TableCell class="text-right">
              <Badge variant={getStatusColor(k8sHealth.Scheduler?.Status || 'unknown')}>
                {k8sHealth.Scheduler?.Status || 'Unknown'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Last Updated</TableCell>
            <TableCell class="text-right">
              {k8sHealth.LastChecked ? new Date(k8sHealth.LastChecked).toLocaleString() : 'N/A'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- Nodes Status Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Nodes</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Total Nodes</TableCell>
            <TableCell class="text-right">{k8sHealth.Nodes?.Total || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Ready Nodes</TableCell>
            <TableCell class="text-right">{k8sHealth.Nodes?.Ready || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Not Ready</TableCell>
            <TableCell class="text-right">{k8sHealth.Nodes?.NotReady || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Master Nodes</TableCell>
            <TableCell class="text-right">{k8sHealth.Nodes?.Master || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Worker Nodes</TableCell>
            <TableCell class="text-right">{k8sHealth.Nodes?.Worker || 0}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {#if k8sHealth.NodeList && k8sHealth.NodeList.length > 0}
        <div class="mt-4">
          <h4 class="mb-2 font-semibold">Node Details</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each k8sHealth.NodeList as node}
                <TableRow>
                  <TableCell>{node.Name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(node.Status)}>
                      {node.Status}
                    </Badge>
                  </TableCell>
                  <TableCell>{node.Role || 'worker'}</TableCell>
                </TableRow>
              {/each}
            </TableBody>
          </Table>
        </div>
      {/if}
    </CardContent>
  </Card>

  <!-- Pods Status Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Pods</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        {#if k8sHealth.Resources?.Pods}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Pod Usage</span>
              <Badge variant={getStatusColor(podUsagePercentage)}>
                {podUsagePercentage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={podUsagePercentage} class="h-2" />
          </div>
        {/if}

        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Running</TableCell>
              <TableCell class="text-right">{k8sHealth.Pods?.Running || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Pending</TableCell>
              <TableCell class="text-right">{k8sHealth.Pods?.Pending || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Failed</TableCell>
              <TableCell class="text-right">{k8sHealth.Pods?.Failed || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Succeeded</TableCell>
              <TableCell class="text-right">{k8sHealth.Pods?.Succeeded || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Pods</TableCell>
              <TableCell class="text-right">{k8sHealth.Pods?.Total || 0}</TableCell>
            </TableRow>
            {#if k8sHealth.Resources?.Pods}
              <TableRow>
                <TableCell>Pod Capacity</TableCell>
                <TableCell class="text-right">{k8sHealth.Resources.Pods.Capacity || 0}</TableCell>
              </TableRow>
            {/if}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  <!-- Resource Usage Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Resource Usage</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-4">
        {#if k8sHealth.Resources?.CPU}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>CPU Usage</span>
              <Badge variant={getStatusColor(cpuUsagePercentage)}>
                {cpuUsagePercentage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={cpuUsagePercentage} class="h-2" />
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Allocated</TableCell>
                  <TableCell class="text-right">{k8sHealth.Resources.CPU.Allocated || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Capacity</TableCell>
                  <TableCell class="text-right">{k8sHealth.Resources.CPU.Capacity || 'N/A'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        {/if}

        {#if k8sHealth.Resources?.Memory}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Memory Usage</span>
              <Badge variant={getStatusColor(memoryUsagePercentage)}>
                {memoryUsagePercentage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={memoryUsagePercentage} class="h-2" />
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Allocated</TableCell>
                  <TableCell class="text-right">{k8sHealth.Resources.Memory.Allocated || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Capacity</TableCell>
                  <TableCell class="text-right">{k8sHealth.Resources.Memory.Capacity || 'N/A'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        {/if}
      </div>
    </CardContent>
  </Card>

  <!-- Namespaces Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Namespaces</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Total Namespaces</TableCell>
            <TableCell class="text-right">{k8sHealth.Namespaces?.Total || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Active</TableCell>
            <TableCell class="text-right">{k8sHealth.Namespaces?.Active || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Terminating</TableCell>
            <TableCell class="text-right">{k8sHealth.Namespaces?.Terminating || 0}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {#if k8sHealth.NamespaceList && k8sHealth.NamespaceList.length > 0}
        <div class="mt-4">
          <h4 class="mb-2 font-semibold">Namespace Details</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Age</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each k8sHealth.NamespaceList as namespace}
                <TableRow>
                  <TableCell>{namespace.Name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(namespace.Status)}>
                      {namespace.Status}
                    </Badge>
                  </TableCell>
                  <TableCell>{namespace.Age || 'N/A'}</TableCell>
                </TableRow>
              {/each}
            </TableBody>
          </Table>
        </div>
      {/if}
    </CardContent>
  </Card>

  <!-- Services Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Services & Deployments</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Services</TableCell>
            <TableCell class="text-right">{k8sHealth.Services?.Total || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Deployments</TableCell>
            <TableCell class="text-right">{k8sHealth.Deployments?.Total || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Available Deployments</TableCell>
            <TableCell class="text-right">{k8sHealth.Deployments?.Available || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Unavailable Deployments</TableCell>
            <TableCell class="text-right">{k8sHealth.Deployments?.Unavailable || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>DaemonSets</TableCell>
            <TableCell class="text-right">{k8sHealth.DaemonSets?.Total || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>StatefulSets</TableCell>
            <TableCell class="text-right">{k8sHealth.StatefulSets?.Total || 0}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</div>
