<script lang="ts">
  import type { PageProps } from './$types';
  import { goto } from '$app/navigation';
  import { enhance } from '$app/forms';
  import * as Alert from '$lib/components/ui/alert';
  import * as Tabs from '$lib/components/ui/tabs';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
  } from '$lib/components/ui/dialog';
  import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
  import { Badge } from '$lib/components/ui/badge';
  import { ArrowLeft, Trash2, PlusCircle, Info } from 'lucide-svelte';

  let { data, form } = $props<PageProps>();
  let selectedTab = $state('overview');
  let showForceDeleteModal = $state(false);
  let showComponentsModal = $state(false);
  let selectedHealthTool = $state('');

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      case 'scheduled for deletion':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getAwxStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'successful':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'running':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };
</script>

<div class="container space-y-6 p-4">
  {#if form?.message}
    <Alert.Root class={form.success ? 'bg-green-100' : 'bg-red-100'}>
      <Alert.Description>
        {form.message}
      </Alert.Description>
    </Alert.Root>
  {/if}

  <!-- Header -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" href="/hosts">
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <h1 class="text-2xl font-bold">{data.host.name}</h1>
      <Badge class={getStatusColor(data.host.status)}>{data.host.status}</Badge>
    </div>
    <Button variant="destructive" onclick={() => (showForceDeleteModal = true)}>
      <Trash2 class="mr-2 h-4 w-4" />
      Force Delete
    </Button>
  </div>

  <!-- Tabs -->
  <Tabs.Root value={selectedTab} onValueChange={(value) => (selectedTab = value)}>
    <Tabs.List>
      <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
      {#if data.host.awxHostId}
        <Tabs.Trigger value="awx">AWX Jobs</Tabs.Trigger>
      {/if}
      <Tabs.Trigger value="health">Health</Tabs.Trigger>
    </Tabs.List>

    <Tabs.Content value="overview" class="space-y-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <!-- System Information -->
        <Card.Root>
          <Card.Header>
            <Card.Title>System Information</Card.Title>
          </Card.Header>
          <Card.Content>
            <dl class="space-y-4">
              <div>
                <dt class="text-muted-foreground text-sm font-medium">AWX Host ID</dt>
                <dd>
                  {#if data.host.awxHostId && data.host.awxHostUrl}
                    <a href={data.host.awxHostUrl} target="_blank" rel="noopener noreferrer">
                      <Badge variant="outline">{data.host.awxHostId}</Badge>
                    </a>
                  {:else}
                    <Badge variant="outline" class="bg-gray-100">
                      {data.host.awxHostId || 'Not configured'}
                    </Badge>
                  {/if}
                </dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-sm font-medium">IP Address</dt>
                <dd><Badge>{data.host.ipAddress}</Badge></dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-sm font-medium">Operating System</dt>
                <dd>{data.host.os || 'Unknown'}</dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-sm font-medium">CPU Cores</dt>
                <dd>{data.host.cpuCores || 'N/A'}</dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-sm font-medium">RAM</dt>
                <dd>{data.host.ram || 'N/A'}</dd>
              </div>
            </dl>
          </Card.Content>
        </Card.Root>

        <!-- Monokit Information -->
        <Card.Root>
          <Card.Header>
            <Card.Title>Monokit Information</Card.Title>
          </Card.Header>
          <Card.Content>
            <dl class="space-y-4">
              <div>
                <dt class="text-muted-foreground text-sm font-medium">Version</dt>
                <dd><Badge>{data.host.monokitVersion || 'Unknown'}</Badge></dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-sm font-medium">Wants Update To</dt>
                <dd>
                  {#if data.host.wantsUpdateTo}
                    <Badge variant="secondary">{data.host.wantsUpdateTo}</Badge>
                  {:else}
                    <span class="text-muted-foreground">No update pending</span>
                  {/if}
                </dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-sm font-medium">Groups</dt>
                <dd class="flex flex-wrap gap-2">
                  {#if data.host.groups && data.host.groups !== 'nil'}
                    {#each data.host.groups.split(',') as group, i (i)}
                      <Badge variant="outline">{group.trim()}</Badge>
                    {/each}
                  {:else}
                    <span class="text-muted-foreground">None</span>
                  {/if}
                </dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-sm font-medium">Components</dt>
                <dd class="flex flex-wrap gap-2">
                  {#if data.host.installedComponents}
                    {#each data.host.installedComponents.split('::') as component, i (i)}
                      <Badge>{component}</Badge>
                    {/each}
                  {:else}
                    <span class="text-muted-foreground">None</span>
                  {/if}
                </dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-sm font-medium">Disabled Components</dt>
                <dd class="flex flex-wrap gap-2">
                  {#if data.host.disabledComponents}
                    {#each data.host.disabledComponents.split('::') as component, i (i)}
                      <Badge variant="destructive">{component}</Badge>
                    {/each}
                  {:else}
                    <span class="text-muted-foreground">None</span>
                  {/if}
                </dd>
              </div>
              <div class="flex flex-col gap-2 pt-4">
                <Button href="/hosts/{data.host.name}/config" variant="outline">
                  Edit Monokit Configuration
                </Button>
                <Button onclick={() => (showComponentsModal = true)}>
                  <PlusCircle class="mr-2 h-4 w-4" />
                  Manage Components
                </Button>
              </div>
            </dl>
          </Card.Content>
        </Card.Root>
      </div>
    </Tabs.Content>

    {#if data.host.awxHostId}
      <Tabs.Content value="awx">
        <Card.Root>
          <Card.Header>
            <Card.Title>Recent AWX Jobs</Card.Title>
          </Card.Header>
          <Card.Content>
            {#if data.awxJobs.length === 0}
              <div class="flex flex-col items-center justify-center space-y-2 py-8">
                <Info class="text-muted-foreground h-8 w-8" />
                <p class="text-muted-foreground">No AWX jobs found for this host</p>
              </div>
            {:else}
              <div class="space-y-4">
                {#each data.awxJobs as job, i (i)}
                  <div class="flex items-center justify-between rounded-lg border p-4">
                    <div class="space-y-1">
                      <p class="font-medium">{job.name}</p>
                      <div class="text-muted-foreground flex items-center gap-2 text-sm">
                        <Badge class={getAwxStatusColor(job.status)}>{job.status}</Badge>
                        <span>Started: {new Date(job.started).toLocaleString()}</span>
                        {#if job.finished}
                          <span>Finished: {new Date(job.finished).toLocaleString()}</span>
                        {/if}
                      </div>
                    </div>
                    {#if job.url}
                      <Button variant="outline" href={job.url} target="_blank">View Details</Button>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </Card.Content>
        </Card.Root>
      </Tabs.Content>
    {/if}

    <Tabs.Content value="health">
      <Card.Root>
        <Card.Header>
          <Card.Title>System Health Details</Card.Title>
        </Card.Header>
        <Card.Content>
          {#if data.healthTools.length === 0}
            <div class="flex flex-col items-center justify-center space-y-2 py-8">
              <Info class="text-muted-foreground h-8 w-8" />
              <p class="text-muted-foreground">
                No health monitoring tools registered for this host
              </p>
            </div>
          {:else}
            <div class="space-y-4">
              <Select
                value={selectedHealthTool}
                onValueChange={(value) => {
                  console.log('Selected value:', value); // Debug log
                  selectedHealthTool = value;
                }}
              >
                <SelectTrigger class="w-full">
                  {selectedHealthTool}
                </SelectTrigger>
                <SelectContent>
                  {#each data.healthTools as tool, i (i)}
                    <SelectItem value={tool}>{tool}</SelectItem>
                  {/each}
                </SelectContent>
              </Select>
            </div>
          {/if}
        </Card.Content>
      </Card.Root>
      <Card.Root>
        <Card.Content>
          {#if selectedHealthTool}
            {#if selectedHealthTool.includes('osHealth') && data.osHealth}
              <div class="space-y-4 rounded-lg border p-4">
                <div class="grid grid-cols-2 gap-4">
                  <!-- System Stats -->
                  <div>
                    <h3 class="text-muted-foreground mb-2 text-sm font-medium">
                      System Statistics
                    </h3>
                    <dl class="space-y-2">
                      <div class="flex justify-between">
                        <dt class="text-sm font-medium">CPU Usage</dt>
                        <dd class="text-sm">{data.osHealth.cpu_usage}%</dd>
                      </div>
                      <div class="flex justify-between">
                        <dt class="text-sm font-medium">Memory Usage</dt>
                        <dd class="text-sm">{data.osHealth.memory_usage}%</dd>
                      </div>
                      <div class="flex justify-between">
                        <dt class="text-sm font-medium">Disk Usage</dt>
                        <dd class="text-sm">{data.osHealth.disk_usage}%</dd>
                      </div>
                    </dl>
                  </div>

                  <!-- System Info -->
                  <div>
                    <h3 class="text-muted-foreground mb-2 text-sm font-medium">
                      System Information
                    </h3>
                    <dl class="space-y-2">
                      <div class="flex justify-between">
                        <dt class="text-sm font-medium">OS Version</dt>
                        <dd class="text-sm">{data.osHealth.os_version || 'N/A'}</dd>
                      </div>
                      <div class="flex justify-between">
                        <dt class="text-sm font-medium">Kernel</dt>
                        <dd class="text-sm">{data.osHealth.kernel_version || 'N/A'}</dd>
                      </div>
                      <div class="flex justify-between">
                        <dt class="text-sm font-medium">Uptime</dt>
                        <dd class="text-sm">{data.osHealth.uptime || 'N/A'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <!-- Process List -->
                {#if data.osHealth.processes}
                  <div class="mt-4">
                    <h3 class="text-muted-foreground mb-2 text-sm font-medium">Top Processes</h3>
                    <div class="rounded-md border">
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                          <tr>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500"
                              >PROCESS</th
                            >
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500"
                              >PID</th
                            >
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500"
                              >CPU %</th
                            >
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500"
                              >MEM %</th
                            >
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 bg-white">
                          {#each data.osHealth.processes as process, i (i)}
                            <tr>
                              <td class="px-4 py-2 text-sm">{process.name}</td>
                              <td class="px-4 py-2 text-sm">{process.pid}</td>
                              <td class="px-4 py-2 text-sm">{process.cpu_percent}%</td>
                              <td class="px-4 py-2 text-sm">{process.memory_percent}%</td>
                            </tr>
                          {/each}
                        </tbody>
                      </table>
                    </div>
                  </div>
                {/if}
              </div>
            {:else}
              <div class="rounded-lg border p-4">
                <p class="text-muted-foreground">Health data for {selectedHealthTool}</p>
              </div>
            {/if}
          {:else}
            <div class="flex flex-col items-center justify-center space-y-2 py-8">
              <Info class="text-muted-foreground h-8 w-8" />
              <p class="text-muted-foreground">Select a health tool to view details</p>
            </div>
          {/if}
        </Card.Content>
      </Card.Root>
    </Tabs.Content>
  </Tabs.Root>
</div>

<!-- Force Delete Modal -->
<Dialog open={showForceDeleteModal} onOpenChange={(open) => (showForceDeleteModal = open)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Force Delete {data.host.name}?</DialogTitle>
      <DialogDescription>
        Are you sure you want to force delete this host? This action cannot be undone and will
        bypass all safety checks.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <form action="?/forceDelete" method="POST" use:enhance>
        <Button variant="outline" type="button" onclick={() => (showForceDeleteModal = false)}>
          Cancel
        </Button>
        <Button variant="destructive" type="submit">Force Delete</Button>
      </form>
    </DialogFooter>
  </DialogContent>
</Dialog>

<!-- Components Modal -->
<!-- This would be a separate component that handles component management -->
<Dialog open={showComponentsModal} onOpenChange={(open) => (showComponentsModal = open)}>
  <DialogContent class="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Manage Components</DialogTitle>
      <DialogDescription>Enable or disable components for this host</DialogDescription>
    </DialogHeader>
    <div class="py-4">
      <!-- Component management form would go here -->
      <form action="?/updateComponents" method="POST" use:enhance>
        <!-- Component list and management UI would go here -->
      </form>
    </div>
  </DialogContent>
</Dialog>
