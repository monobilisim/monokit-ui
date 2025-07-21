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
  import { Textarea } from '$lib/components/ui/textarea';
  import { Badge } from '$lib/components/ui/badge';
  import { PlusIcon, Trash2Icon, EditIcon, Globe } from 'lucide-svelte';
  import type { Domain } from '$lib/types';
  import { handleFormResponse } from '$lib/stores/alerts';

  let {
    data,
    form
  }: {
    data: { domains: Domain[] };
    form: { type?: 'success' | 'error'; message?: string; errors?: string[] } | null;
  } = $props();

  let selectedDomains = $state<string[]>([]);
  let showCreateModal = $state(false);
  let showEditModal = $state(false);
  let showDeleteModal = $state(false);
  let isSubmitting = $state(false);

  let newDomainName = $state('');
  let newDomainDescription = $state('');
  let newDomainSettings = $state('');

  let editingDomain = $state<Domain | null>(null);
  let editDomainName = $state('');
  let editDomainDescription = $state('');
  let editDomainActive = $state(true);
  let editDomainSettings = $state('');

  $effect(() => {
    handleFormResponse(form);
  });

  const selectedDomainNames = $derived(
    data.domains
      .filter((domain: Domain) => selectedDomains.includes(domain.id))
      .map((domain: Domain) => domain.name)
  );

  const handleSelectAll = (checked: boolean, domains: Domain[]) => {
    selectedDomains = checked ? domains.map((domain) => domain.id) : [];
  };

  const handleSelectDomain = (domainId: string, checked: boolean) => {
    selectedDomains = checked
      ? [...selectedDomains, domainId]
      : selectedDomains.filter((id: string) => id !== domainId);
  };

  const openCreateModal = () => {
    newDomainName = '';
    newDomainDescription = '';
    newDomainSettings = '';
    showCreateModal = true;
  };

  const closeCreateModal = () => {
    showCreateModal = false;
    newDomainName = '';
    newDomainDescription = '';
    newDomainSettings = '';
  };

  const openEditModal = (domain: Domain) => {
    editingDomain = domain;
    editDomainName = domain.name;
    editDomainDescription = domain.description || '';
    editDomainActive = domain.active;
    editDomainSettings = domain.settings ? JSON.stringify(domain.settings, null, 2) : '';
    showEditModal = true;
  };

  const closeEditModal = () => {
    showEditModal = false;
    editingDomain = null;
    editDomainName = '';
    editDomainDescription = '';
    editDomainActive = true;
    editDomainSettings = '';
  };

  const openDeleteModal = () => {
    if (selectedDomains.length > 0) {
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

  const handleEditSubmit = () => {
    isSubmitting = true;
    return async ({ result }: { result: { type: string } }) => {
      isSubmitting = false;
      if (result.type === 'success') {
        closeEditModal();
        await invalidateAll();
      }
    };
  };

  const handleDeleteSubmit = () => {
    return async ({ result }: { result: { type: string } }) => {
      if (result.type === 'success') {
        selectedDomains = [];
        closeDeleteModal();
        await invalidateAll();
      }
    };
  };

  $effect(() => {
    const currentIds = data.domains.map((domain) => domain.id);
    const filteredSelected = selectedDomains.filter((id: string) => currentIds.includes(id));

    if (
      filteredSelected.length !== selectedDomains.length ||
      !filteredSelected.every((id) => selectedDomains.includes(id))
    ) {
      selectedDomains = filteredSelected;
    }
  });
</script>

<div class="w-full space-y-4 p-4">
  <!-- Main Content -->
  <Card.Root>
    <Card.Header>
      <div class="flex items-center justify-between">
        <div></div>
        <div class="flex items-center gap-2">
          <Button onclick={openCreateModal} class="flex items-center gap-2">
            <PlusIcon class="h-4 w-4" />
            Create Domain
          </Button>
          {#if selectedDomains.length > 0}
            <Button variant="destructive" onclick={openDeleteModal} class="flex items-center gap-2">
              <Trash2Icon class="h-4 w-4" />
              Delete Selected ({selectedDomains.length})
            </Button>
          {/if}
        </div>
      </div>
    </Card.Header>

    <Card.Content class="space-y-2">
      <!-- Empty State -->
      {#if data.domains.length === 0}
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <Globe class="text-muted-foreground mb-4 h-12 w-12" />
          <h3 class="mb-2 text-lg font-semibold">No domains created yet</h3>
          <p class="text-muted-foreground mb-4 max-w-md">
            No domains have been created yet. Get started by creating your first domain.
          </p>
          <Button onclick={openCreateModal} class="flex items-center gap-2">
            <PlusIcon class="h-4 w-4" />
            Create Domain
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
                    checked={data.domains.length > 0 &&
                      data.domains.every((domain) => selectedDomains.includes(domain.id))}
                    onCheckedChange={(checked) => handleSelectAll(checked, data.domains)}
                    aria-label="Select all domains"
                  />
                </Table.Head>
                <Table.Head>Name</Table.Head>
                <Table.Head>Description</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Created At</Table.Head>
                <Table.Head>Updated At</Table.Head>
                <Table.Head class="w-24">Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each data.domains as domain (domain.id)}
                <Table.Row>
                  <Table.Cell>
                    <Checkbox
                      checked={selectedDomains.includes(domain.id)}
                      onCheckedChange={(checked) => handleSelectDomain(domain.id, checked)}
                      aria-label={`Select ${domain.name}`}
                    />
                  </Table.Cell>
                  <Table.Cell class="font-medium">{domain.name}</Table.Cell>
                  <Table.Cell class="max-w-xs truncate" title={domain.description}>
                    {domain.description || 'No description'}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={domain.active ? 'default' : 'secondary'}>
                      {domain.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{domain.created_at}</Table.Cell>
                  <Table.Cell>{domain.updated_at}</Table.Cell>
                  <Table.Cell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onclick={() => openEditModal(domain)}
                      class="h-8 w-8 p-0"
                    >
                      <EditIcon class="h-4 w-4" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </div>
      {/if}
    </Card.Content>
  </Card.Root>

  <!-- Create Domain Modal -->
  <Dialog.Root bind:open={showCreateModal}>
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content class="sm:max-w-lg">
        <Dialog.Header>
          <Dialog.Title>Create Domain</Dialog.Title>
          <Dialog.Description>Create a new domain to organize your resources.</Dialog.Description>
        </Dialog.Header>

        <form action="?/createDomain" method="POST" use:enhance={handleCreateSubmit}>
          <div class="space-y-4 py-4">
            <div class="space-y-2">
              <Label for="domain-name">Name *</Label>
              <Input
                id="domain-name"
                name="name"
                type="text"
                placeholder="Enter domain name"
                bind:value={newDomainName}
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="domain-description">Description</Label>
              <Textarea
                id="domain-description"
                name="description"
                placeholder="Enter domain description (optional)"
                bind:value={newDomainDescription}
              />
            </div>

            <div class="space-y-2">
              <Label for="domain-settings">Settings (JSON)</Label>
              <Textarea
                id="domain-settings"
                name="settings"
                placeholder="Enter JSON settings (optional)"
                bind:value={newDomainSettings}
                class="font-mono text-sm"
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
            <Button type="submit" disabled={isSubmitting || !newDomainName.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Domain'}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>

  <!-- Edit Domain Modal -->
  <Dialog.Root bind:open={showEditModal}>
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content class="sm:max-w-lg">
        <Dialog.Header>
          <Dialog.Title>Edit Domain</Dialog.Title>
          <Dialog.Description>Update the domain settings and information.</Dialog.Description>
        </Dialog.Header>

        {#if editingDomain}
          <form action="?/updateDomain" method="POST" use:enhance={handleEditSubmit}>
            <input type="hidden" name="domainId" value={editingDomain.id} />

            <div class="space-y-4 py-4">
              <div class="space-y-2">
                <Label for="edit-domain-name">Name</Label>
                <Input
                  id="edit-domain-name"
                  name="name"
                  type="text"
                  placeholder="Enter domain name"
                  bind:value={editDomainName}
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="edit-domain-description">Description</Label>
                <Textarea
                  id="edit-domain-description"
                  name="description"
                  placeholder="Enter domain description"
                  bind:value={editDomainDescription}
                />
              </div>

              <div class="flex items-center space-x-2">
                <Checkbox
                  id="edit-domain-active"
                  name="active"
                  value="true"
                  checked={editDomainActive}
                  onCheckedChange={(checked) => (editDomainActive = checked)}
                />
                <Label for="edit-domain-active">Active</Label>
              </div>

              <div class="space-y-2">
                <Label for="edit-domain-settings">Settings (JSON)</Label>
                <Textarea
                  id="edit-domain-settings"
                  name="settings"
                  placeholder="Enter JSON settings"
                  bind:value={editDomainSettings}
                  class="font-mono text-sm"
                />
              </div>
            </div>

            <Dialog.Footer>
              <Button
                type="button"
                variant="outline"
                onclick={closeEditModal}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !editDomainName.trim()}>
                {isSubmitting ? 'Updating...' : 'Update Domain'}
              </Button>
            </Dialog.Footer>
          </form>
        {/if}
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
            Delete {selectedDomains.length}
            {selectedDomains.length === 1 ? 'Domain' : 'Domains'}
          </Dialog.Title>
          <Dialog.Description>
            Are you sure you want to delete the following {selectedDomains.length === 1
              ? 'domain'
              : 'domains'}? This action cannot be undone.
          </Dialog.Description>
        </Dialog.Header>

        <div class="py-4">
          <div class="space-y-2">
            {#each selectedDomainNames as name (name)}
              <div class="flex items-center gap-2">
                <span class="text-sm">•</span>
                <span class="text-sm font-medium">{name}</span>
              </div>
            {/each}
          </div>
        </div>

        <Dialog.Footer>
          <form action="?/deleteDomains" method="POST" use:enhance={handleDeleteSubmit}>
            {#each selectedDomains as domainId (domainId)}
              <input type="hidden" name="domains[]" value={domainId} />
            {/each}
            <Button type="button" variant="outline" onclick={closeDeleteModal}>Cancel</Button>
            <Button type="submit" variant="destructive">
              Delete {selectedDomains.length === 1 ? 'Domain' : 'Domains'}
            </Button>
          </form>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</div>
