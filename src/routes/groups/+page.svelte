<script lang="ts">
  import * as Card from '$lib/components/ui/card/index';
  import * as Button from '$lib/components/ui/button/index';
  import * as Dialog from '$lib/components/ui/dialog/index';
  import * as Table from '$lib/components/ui/table/index';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index';
  import { Input } from '$lib/components/ui/input/index';
  import { Label } from '$lib/components/ui/label/index';
  import { Checkbox } from '$lib/components/ui/checkbox/index';
  import { Badge } from '$lib/components/ui/badge/index';
  import { Plus, Trash2, Users, Loader2 } from 'lucide-svelte';
  import type { PageData } from './$types';
  import { enhance } from '$app/forms';
  import { applyAction } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { onMount } from 'svelte';

  export let data: PageData;
  export let form: ActionData;

  let groups = data.groups || [];
  let error = data.error | null;

  // Selected items for deletion
  let selectedItems: string[] = [];

  // State for modals
  let isCreateModalOpen = false;
  let isDeleteModalOpen = false;
  let newGroupName = '';
  let isSubmitting = false;
  let isDeleting = false;

  // Pagination state
  let page = 1;
  let perPage = 10;

  $: filteredGroups = groups;
  $: paginatedGroups = filteredGroups.slice((page - 1) * perPage, page * perPage);
  $: totalPages = Math.ceil(filteredGroups.length / perPage);

  // Modal handlers
  const openCreateModal = () => {
    newGroupName = '';
    isCreateModalOpen = true;
  };

  const closeCreateModal = () => {
    isCreateModalOpen = false;
    newGroupName = '';
  };

  const openDeleteModal = () => {
    if (selectedItems.length > 0) {
      isDeleteModalOpen = true;
    } else {
      alert('Please select at least one group to delete.');
    }
  };

  const closeDeleteModal = () => {
    isDeleteModalOpen = false;
  };

  // Handle selection
  const onSelect = (id: string, checked: boolean) => {
    if (checked) {
      selectedItems = [...selectedItems, id];
    } else {
      selectedItems = selectedItems.filter((itemId) => itemId !== id);
    }
  };

  // Handle select all
  const onSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = paginatedGroups.map((group) => group.id || group.name);
      selectedItems = allIds;
    } else {
      selectedItems = [];
    }
  };

  const handleCreateSubmit = () => {
    isSubmitting = true;
  };

  const handleDeleteSubmit = () => {
    isDeleting = true;
  };

  const resetCreateState = () => {
    isSubmitting = false;
    isCreateModalOpen = false;
    newGroupName = '';
    selectedItems = [];
  };

  const resetDeleteState = () => {
    isDeleting = false;
    isDeleteModalOpen = false;
    selectedItems = [];
  };

  const onCreateSuccess = () => {
    resetCreateState();
    invalidateAll();
  };

  const onDeleteSuccess = () => {
    resetDeleteState();
    invalidateAll();
  };

  const handleCreateError = () => {
    isSubmitting = false;
  };

  const handleDeleteError = () => {
    isDeleting = false;
  };

  // Pagination helpers
  const nextPage = () => {
    if (page < totalPages) {
      page += 1;
    }
  };

  const prevPage = () => {
    if (page > 1) {
      page -= 1;
    }
  };

  onMount(() => {
    console.log(data.groups);
  });
</script>

<div class="container mx-auto p-6">
  <Card.Root>
    <Card.Header>
      <div class="flex items-center justify-between">
        <div>
          <Card.Title class="text-2xl font-bold">Groups</Card.Title>
          <Card.Description>Manage your groups and their members</Card.Description>
        </div>
        <div class="flex items-center gap-2">
          <Button.Root onclick={openCreateModal} class="flex cursor-pointer items-center gap-2">
            <Plus class="h-4 w-4" />
            Create Group
          </Button.Root>
          {#if selectedItems.length > 0}
            <Button.Root
              variant="destructive"
              onclick={openDeleteModal}
              class="flex items-center gap-2"
            >
              <Trash2 class="h-4 w-4" />
              Delete Selected ({selectedItems.length})
            </Button.Root>
          {/if}
        </div>
      </div>
    </Card.Header>
    <Card.Content>
      {#if groups.length === 0}
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <Users class="text-muted-foreground mb-4 h-16 w-16" />
          <h3 class="mb-2 text-lg font-semibold">No Groups Found</h3>
          <p class="text-muted-foreground mb-4">
            No groups have been created yet. Get started by creating your first group.
          </p>
          <Button.Root onclick={openCreateModal} class="flex cursor-pointer items-center gap-2">
            <Plus class="h-4 w-4" />
            Create Group
          </Button.Root>
        </div>
      {:else}
        <div class="space-y-4">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head class="w-12">
                  <Checkbox
                    checked={selectedItems.length === paginatedGroups.length &&
                      paginatedGroups.length > 0}
                    onCheckedChange={(checked) => onSelectAll(checked)}
                    aria-label="Select all groups"
                  />
                </Table.Head>
                <Table.Head>Name</Table.Head>
                <Table.Head>Members</Table.Head>
                <Table.Head>Created At</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each paginatedGroups as group (group.id || group.name)}
                {@const groupId = group.id || group.name}
                {@const isChecked = selectedItems.includes(groupId)}
                <Table.Row>
                  <Table.Cell>
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => onSelect(groupId, checked)}
                      aria-label={`Select ${group.name}`}
                    />
                  </Table.Cell>
                  <Table.Cell class="font-medium">{group.name}</Table.Cell>
                  <Table.Cell>
                    <Badge variant="secondary">{group.members || 0}</Badge>
                  </Table.Cell>
                  <Table.Cell class="text-muted-foreground">
                    {group.created_at || 'N/A'}
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>

          {#if totalPages > 1}
            <div class="flex items-center justify-between">
              <div class="text-muted-foreground text-sm">
                Showing {Math.min((page - 1) * perPage + 1, filteredGroups.length)} to {Math.min(
                  page * perPage,
                  filteredGroups.length
                )} of {filteredGroups.length} groups
              </div>
              <div class="flex items-center gap-2">
                <Button.Root variant="outline" size="sm" onclick={prevPage} disabled={page === 1}>
                  Previous
                </Button.Root>
                <div class="flex items-center gap-1">
                  <span class="text-sm">Page {page} of {totalPages}</span>
                </div>
                <Button.Root
                  variant="outline"
                  size="sm"
                  onclick={nextPage}
                  disabled={page === totalPages}
                >
                  Next
                </Button.Root>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </Card.Content>
  </Card.Root>

  <!-- Create Group Dialog -->
  <Dialog.Root bind:open={isCreateModalOpen}>
    <Dialog.Content class="sm:max-w-[425px]">
      <Dialog.Header>
        <Dialog.Title>Create Group</Dialog.Title>
        <Dialog.Description>Create a new group to organize your members.</Dialog.Description>
      </Dialog.Header>
      <form
        method="POST"
        action="?/createGroup"
        use:enhance={() => {
          handleCreateSubmit();
          return async ({ result, update }) => {
            if (result.type === 'success') {
              onCreateSuccess();
              await update();
            } else {
              handleCreateError();
            }
            applyAction(result);
          };
        }}
      >
        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="group-name" class="text-right">Name</Label>
            <Input
              id="group-name"
              name="name"
              bind:value={newGroupName}
              required
              class="col-span-3"
              placeholder="Enter group name"
            />
          </div>
        </div>
        <Dialog.Footer>
          <Button.Root
            class="cursor-pointer"
            type="button"
            variant="outline"
            onclick={closeCreateModal}
            disabled={isSubmitting}
          >
            Cancel
          </Button.Root>
          <Button.Root
            class="cursor-pointer"
            type="submit"
            disabled={isSubmitting || !newGroupName.trim()}
          >
            {#if isSubmitting}
              <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            {/if}
            Create Group
          </Button.Root>
        </Dialog.Footer>
      </form>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Delete Confirmation AlertDialog -->
  <AlertDialog.Root bind:open={isDeleteModalOpen}>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Delete Selected Groups</AlertDialog.Title>
        <AlertDialog.Description>
          Are you sure you want to delete {selectedItems.length} selected
          {selectedItems.length === 1 ? 'group' : 'groups'}? This action cannot be undone.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel onclick={closeDeleteModal} disabled={isDeleting}>
          Cancel
        </AlertDialog.Cancel>
        <form
          method="POST"
          action="?/deleteGroup"
          use:enhance={() => {
            handleDeleteSubmit();
            return async ({ result, update }) => {
              if (result.type === 'success') {
                onDeleteSuccess();
                await update();
              } else {
                handleDeleteError();
              }
              applyAction(result);
            };
          }}
        >
          <input type="hidden" name="name" value={selectedItems.join(',')} />
          <AlertDialog.Action
            type="submit"
            disabled={isDeleting}
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {#if isDeleting}
              <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            {/if}
            Delete Groups
          </AlertDialog.Action>
        </form>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
</div>
