<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import * as Table from '$lib/components/ui/table';
  import * as Card from '$lib/components/ui/card';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { PlusIcon, Trash2Icon, Database } from '@lucide/svelte';
  import type { Inventory } from '$lib/types';
  import { handleFormResponse } from '$lib/stores/alerts';

  let {
    data,
    form
  }: {
    data: { inventories: Inventory[] };
    form: { type?: 'success' | 'error'; message?: string; errors?: string[] } | null;
  } = $props();
  let selectedInventories = $state<string[]>([]);
  let showCreateModal = $state(false);
  let showDeleteModal = $state(false);
  let newInventoryName = $state('');
  let isSubmitting = $state(false);

  // Handle form responses
  $effect(() => {
    handleFormResponse(form);
  });

  const selectedInventoryNames = $derived(
    data.inventories
      .filter((inventory: Inventory) => selectedInventories.includes(inventory.id))
      .map((inventory: Inventory) => inventory.name)
  );

  const handleSelectAll = (checked: boolean, inventories: Inventory[]) => {
    selectedInventories = checked ? inventories.map((inv) => inv.id) : [];
  };

  const handleSelectInventory = (inventoryId: string, checked: boolean) => {
    selectedInventories = checked
      ? [...selectedInventories, inventoryId]
      : selectedInventories.filter((id: string) => id !== inventoryId);
  };

  const openCreateModal = () => {
    newInventoryName = '';
    showCreateModal = true;
  };

  const closeCreateModal = () => {
    showCreateModal = false;
    newInventoryName = '';
  };

  const openDeleteModal = () => {
    if (selectedInventories.length > 0) {
      showDeleteModal = true;
    }
  };

  const closeDeleteModal = () => {
    showDeleteModal = false;
  };

  const handleCreateSubmit = () => {
    isSubmitting = true;
    return async ({ result }: { result: { type: string } }) => {
      isSubmitting = false;
      if (result.type === 'success') {
        closeCreateModal();
        await invalidateAll();
      }
    };
  };

  const handleDeleteSubmit = () => {
    return async ({ result }: { result: { type: string } }) => {
      if (result.type === 'success') {
        selectedInventories = [];
        closeDeleteModal();
        await invalidateAll();
      }
    };
  };

  $effect(() => {
    const currentIds = data.inventories.map((inv) => inv.id);
    const filteredSelected = selectedInventories.filter((id: string) => currentIds.includes(id));

    if (
      filteredSelected.length !== selectedInventories.length ||
      !filteredSelected.every((id) => selectedInventories.includes(id))
    ) {
      selectedInventories = filteredSelected;
    }
  });
</script>

<div class="w-full space-y-4 p-4">
  <!-- Main Content -->
  <Card.Root>
    <Card.Header>
      <div class="flex items-center justify-between">
        <!-- <Card.Title class="text-2xl font-bold">Inventories</Card.Title> -->
        <div></div>
        <div class="flex items-center gap-2">
          <Button onclick={openCreateModal} class="flex items-center gap-2">
            <PlusIcon class="h-4 w-4" />
            Create Inventory
          </Button>
          {#if selectedInventories.length > 0}
            <Button variant="destructive" onclick={openDeleteModal} class="flex items-center gap-2">
              <Trash2Icon class="h-4 w-4" />
              Delete Selected ({selectedInventories.length})
            </Button>
          {/if}
        </div>
      </div>
    </Card.Header>

    <Card.Content class="space-y-2">
      <!-- Empty State -->
      {#if data.inventories.length === 0}
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <Database class="text-muted-foreground mb-4 h-12 w-12" />
          <h3 class="mb-2 text-lg font-semibold">No inventories created yet</h3>
          <p class="text-muted-foreground mb-4 max-w-md">
            No inventories have been created yet. Get started by creating your first inventory.
          </p>
          <Button onclick={openCreateModal} class="flex items-center gap-2">
            <PlusIcon class="h-4 w-4" />
            Create Inventory
          </Button>
        </div>
      {:else}
        <!-- Table -->
        <div class="rounded-md border">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head class="w-12">
                  <Checkbox
                    checked={data.inventories.length > 0 &&
                      data.inventories.every((inventory) =>
                        selectedInventories.includes(inventory.id)
                      )}
                    onCheckedChange={(checked) => handleSelectAll(checked, data.inventories)}
                    aria-label="Select all inventories"
                  />
                </Table.Head>
                <Table.Head>Name</Table.Head>
                <Table.Head>Hosts</Table.Head>
                <Table.Head>Created At</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each data.inventories as inventory (inventory.id)}
                <Table.Row>
                  <Table.Cell>
                    <Checkbox
                      checked={selectedInventories.includes(inventory.id)}
                      onCheckedChange={(checked) => handleSelectInventory(inventory.id, checked)}
                      aria-label={`Select ${inventory.name}`}
                    />
                  </Table.Cell>
                  <Table.Cell class="font-medium">{inventory.name}</Table.Cell>
                  <Table.Cell>{inventory.hosts}</Table.Cell>
                  <Table.Cell>{inventory.created_at}</Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </div>
      {/if}
    </Card.Content>
  </Card.Root>

  <!-- Create Inventory Modal -->
  <Dialog.Root bind:open={showCreateModal}>
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content class="sm:max-w-md">
        <Dialog.Header>
          <Dialog.Title>Create Inventory</Dialog.Title>
          <Dialog.Description>Create a new inventory to organize your hosts.</Dialog.Description>
        </Dialog.Header>

        <form action="?/createInventory" method="POST" use:enhance={handleCreateSubmit}>
          <div class="space-y-4 py-4">
            <div class="space-y-2">
              <Label for="inventory-name">Name</Label>
              <Input
                id="inventory-name"
                name="name"
                type="text"
                placeholder="Enter inventory name"
                bind:value={newInventoryName}
                required
              />
            </div>
          </div>

          <Dialog.Footer>
            <Button
              type="button"
              variant="outline"
              onclick={closeCreateModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !newInventoryName.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Inventory'}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>

  <!-- Delete Confirmation Modal -->
  <Dialog.Root bind:open={showDeleteModal}>
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content class="sm:max-w-md">
        <Dialog.Header>
          <Dialog.Title>
            Delete {selectedInventories.length}
            {selectedInventories.length === 1 ? 'Inventory' : 'Inventories'}
          </Dialog.Title>
          <Dialog.Description>
            Are you sure you want to delete the following {selectedInventories.length === 1
              ? 'inventory'
              : 'inventories'}? This action cannot be undone.
          </Dialog.Description>
        </Dialog.Header>

        <div class="py-4">
          <div class="space-y-2">
            {#each selectedInventoryNames as name (name)}
              <div class="flex items-center gap-2">
                <span class="text-sm">•</span>
                <span class="text-sm font-medium">{name}</span>
              </div>
            {/each}
          </div>
        </div>

        <Dialog.Footer>
          <form action="?/deleteInventories" method="POST" use:enhance={handleDeleteSubmit}>
            {#each selectedInventoryNames as name (name)}
              <input type="hidden" name="inventories[]" value={name} />
            {/each}
            <Button type="button" variant="outline" onclick={closeDeleteModal}>Cancel</Button>
            <Button type="submit" variant="destructive">
              Delete {selectedInventories.length === 1 ? 'Inventory' : 'Inventories'}
            </Button>
          </form>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</div>
