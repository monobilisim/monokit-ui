<script lang="ts">
  import { enhance } from '$app/forms';
  import type { Host, FormResponse, PageData } from '$lib/types';

  import * as Table from '$lib/components/ui/table';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
  } from '$lib/components/ui/dialog';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { PlusIcon } from 'lucide-svelte';
  import { handleFormResponse } from '$lib/stores/alerts';
  import AwxAddModal from './components/awxAddModal.svelte';

  let {
    data,
    form
  }: {
    data: PageData;
    form: FormResponse | null;
  } = $props();
  let searchValue = $state('');
  let selectedHosts = $state<string[]>([]);
  let currentPage = $state(1);
  let itemsPerPage = $state(10);
  let showDeleteModal = $state(false);
  let showAwxModal = $state(false);
  let awxFreshInstallId = $state<number | null | undefined>(data.awxFreshInstallId);

  $effect(() => {
    handleFormResponse(form);
  });

  const filteredHosts = $derived(
    (data?.hosts || []).filter(
      (host: Host) =>
        !searchValue ||
        host.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        host.address.toLowerCase().includes(searchValue.toLowerCase()) ||
        host.os.toLowerCase().includes(searchValue.toLowerCase())
    )
  );

  const paginatedHosts = $derived(
    filteredHosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  );

  const allSelected = $derived(
    paginatedHosts.length > 0 &&
      paginatedHosts.every((host: Host) => selectedHosts.includes(host.name))
  );

  const statusIndicatorColor = (status: string) => {
    switch (status) {
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
</script>

<div class="w-full space-y-4 p-4">
  <div class="bg-card rounded-lg p-6">
    <div class="space-y-4">
      <div class="flex items-center gap-4">
        <div class="flex-grow">
          <Input type="text" placeholder="Filter hosts..." bind:value={searchValue} />
        </div>
        <Dialog bind:open={showDeleteModal}>
          <DialogTrigger>
            <Button variant="destructive" disabled={selectedHosts.length === 0}>
              Force Delete Selected ({selectedHosts.length})
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Delete {selectedHosts.length} selected host{selectedHosts.length !== 1 ? 's' : ''}?
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the selected hosts? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <form action="?/forceDeleteHosts" method="POST" use:enhance>
                {#each selectedHosts as host, i (i)}
                  <input type="hidden" name="hosts[]" value={host} />
                {/each}
                <Button variant="outline" onclick={() => (showDeleteModal = false)}>Cancel</Button>
                <Button type="submit" variant="destructive">Delete</Button>
              </form>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="default" onclick={() => (showAwxModal = true)}>
          <PlusIcon class="mr-2 h-4 w-4" />
          Add Host to AWX
        </Button>
      </div>
    </div>

    {#if filteredHosts.length === 0}
      <div class="py-8 text-center">
        <h3 class="text-xl font-semibold">No hosts found</h3>
        <p class="text-muted-foreground mt-2">
          {searchValue
            ? 'No hosts match your search criteria. Try adjusting your filter.'
            : 'No hosts are currently registered in the system.'}
        </p>
      </div>
    {:else}
      <div class="mt-4">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head class="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => {
                    selectedHosts = checked ? paginatedHosts.map((h) => h.name) : [];
                  }}
                />
              </Table.Head>
              <Table.Head>Name</Table.Head>
              <Table.Head>Address</Table.Head>
              <Table.Head>OS</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each paginatedHosts as host (host.name)}
              <Table.Row>
                <Table.Cell>
                  <Checkbox
                    checked={selectedHosts.includes(host.name)}
                    onCheckedChange={(checked) => {
                      selectedHosts = checked
                        ? [...selectedHosts, host.name]
                        : selectedHosts.filter((h: string) => h !== host.name);
                    }}
                  />
                </Table.Cell>
                <Table.Cell>{host.name}</Table.Cell>
                <Table.Cell>{host.address}</Table.Cell>
                <Table.Cell>{host.os}</Table.Cell>
                <Table.Cell>
                  <div class="flex items-center gap-2">
                    <span class="h-3 w-3 rounded-full {statusIndicatorColor(host.status)}"></span>
                    <span class="capitalize">{host.status}</span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div class="flex gap-2">
                    <Button variant="ghost" size="sm" href="/hosts/{host.name}">View</Button>
                    <!-- <Dialog>
                      <DialogTrigger>
                        <Button variant="ghost" size="sm" class="text-destructive">
                          Force Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Force Delete {host.name}?</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to force delete this host? This action cannot be
                            undone and will bypass all safety checks.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <form action="?/forceDeleteHost" method="POST" use:enhance>
                            <input type="hidden" name="hostName" value={host.name} />
                            <Button variant="outline" type="button">Cancel</Button>
                            <Button type="submit" variant="destructive">Force Delete</Button>
                          </form>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog> -->
                  </div>
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>

        <!-- Pagination -->
        <!-- <div class="mt-4 flex items-center justify-between">
					<Select
						value={itemsPerPage.toString()}
						onValueChange={(value) => (itemsPerPage = parseInt(value))}
					>
						<SelectTrigger class="w-36">
							<SelectValue placeholder="Items per page" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="10">10 per page</SelectItem>
							<SelectItem value="20">20 per page</SelectItem>
							<SelectItem value="50">50 per page</SelectItem>
						</SelectContent>
					</Select>

					<div class="flex gap-1">
						{#each Array(Math.ceil(filteredHosts.length / itemsPerPage)), i (i)}
							<Button
								variant={currentPage === i + 1 ? 'default' : 'outline'}
								size="sm"
								onclick={() => (currentPage = i + 1)}
							>
								{i + 1}
							</Button>
						{/each}
					</div>
				</div> -->
      </div>
    {/if}
  </div>
</div>

<!-- AWX Add Modal -->
<AwxAddModal bind:open={showAwxModal} {form} {awxFreshInstallId} />
