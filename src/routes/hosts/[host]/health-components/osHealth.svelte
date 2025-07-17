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

  let { osHealth } = $props();

  // Calculate load percentage
  const cpuLoadPercentage = $derived(
    Math.min((osHealth.SystemLoad.Load1 / osHealth.SystemLoad.CPUCount) * 100, 100)
  );

  // Helper function to determine status color
  function getStatusColor(percentage: number) {
    if (percentage >= 90) return 'destructive';
    if (percentage >= 70) return 'warning';
    return 'success';
  }
</script>

<div class="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <!-- System Information Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">System Information</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Hostname</TableCell>
            <TableCell class="text-right">{osHealth.System.Hostname}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>OS</TableCell>
            <TableCell class="text-right">{osHealth.System.OS}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Kernel</TableCell>
            <TableCell class="text-right">{osHealth.System.KernelVer}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>CPU Cores</TableCell>
            <TableCell class="text-right">{osHealth.SystemLoad.CPUCount}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Last Updated</TableCell>
            <TableCell class="text-right"
              >{new Date(osHealth.System.LastChecked).toLocaleString()}</TableCell
            >
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <!-- CPU Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">CPU Load</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-2">
        <div class="space-y-2">
          <Progress value={cpuLoadPercentage} class="h-2" />
          <div class="flex items-center justify-between text-sm">
            <span>Load Average</span>
            <Badge variant={getStatusColor(cpuLoadPercentage)}
              >{cpuLoadPercentage.toFixed(1)}%</Badge
            >
          </div>
        </div>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>1 min</TableCell>
              <TableCell class="text-right">{osHealth.SystemLoad.Load1}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>5 min</TableCell>
              <TableCell class="text-right">{osHealth.SystemLoad.Load5}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>15 min</TableCell>
              <TableCell class="text-right">{osHealth.SystemLoad.Load15}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  <!-- Memory Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Memory Usage</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-2">
        <div class="space-y-2">
          <Progress value={osHealth.Memory.UsedPct} class="h-2" />
          <div class="flex items-center justify-between text-sm">
            <span>Used Memory</span>
            <Badge variant={getStatusColor(osHealth.Memory.UsedPct)}
              >{osHealth.Memory.UsedPct.toFixed(1)}%</Badge
            >
          </div>
        </div>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell class="text-right">{osHealth.Memory.Total}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Used</TableCell>
              <TableCell class="text-right">{osHealth.Memory.Used}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  <!-- Disk Usage Card -->
  <Card>
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl font-bold">Disk Usage</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mt-4 space-y-4">
        {#each osHealth.Disk as disk, i (i)}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>{disk.Mountpoint}</span>
              <Badge variant={getStatusColor(disk.UsedPct)}>{disk.UsedPct.toFixed(1)}%</Badge>
            </div>
            <Progress value={disk.UsedPct} class="h-2" />
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell class="text-right">{disk.Total}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Used</TableCell>
                  <TableCell class="text-right">{disk.Used}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Filesystem</TableCell>
                  <TableCell class="text-right">{disk.Fstype}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        {/each}
      </div>
    </CardContent>
  </Card>
</div>
