<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';

  import * as Card from '$lib/components/ui/card';
  import * as Table from '$lib/components/ui/table';
  import * as Button from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as Alert from '$lib/components/ui/alert';
  import { Badge } from '$lib/components/ui/badge';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import * as Select from '$lib/components/ui/select';
  import { handleFormResponse } from '$lib/stores/alerts';
  import { invalidateAll } from '$app/navigation';
  import type { UserData } from '$lib/types';
  import UsersIcon from '@lucide/svelte/icons/users';
  import Trash2Icon from '@lucide/svelte/icons/trash-2';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
  import AlertTriangleIcon from '@lucide/svelte/icons/alert-triangle';
  import type { InventoryData } from '$lib/types';

  type UsersPageData = {
    users: UserData[] | undefined;
    inventories: InventoryData | undefined;
    error?: string;
  };

  type FormResult = {
    type?: 'success' | 'error' | 'warn' | 'info';
    message?: string;
    error?: string;
  } | null;

  let { data, form }: { data: UsersPageData; form: FormResult } = $props();

  let selectedUsers = $state<string[]>([]);
  let isDeleteModalOpen = $state(false);
  let confirmationChecked = $state(false);
  let isDeleting = $state(false);
  let showCreateModal = $state(false);
  let isCreating = $state(false);
  let newUser = $state({
    username: '',
    password: '',
    email: '',
    role: '',
    groups: '',
    inventory: ''
  });
  let selectedInventory = $state<string | null>(null);
  // @ts-expect-error i have no clue why it gives an error there, but it works without any issues
  const inventories: InventoryData[] = data.inventories || [];

  $effect(() => {
    handleFormResponse(form);
  });

  $effect(() => {
    if (!isDeleteModalOpen) {
      confirmationChecked = false;
    }
  });

  $effect(() => {
    console.log(data.inventories);
    console.log(data.users);
  });

  function handleSelect(username: string) {
    if (selectedUsers.includes(username)) {
      selectedUsers = selectedUsers.filter((u) => u !== username);
    } else {
      selectedUsers = [...selectedUsers, username];
    }
  }

  function handleSelectAll(checked: boolean) {
    if (checked && data.users) {
      selectedUsers = data.users.map((user: UserData) => user.username);
    } else {
      selectedUsers = [];
    }
  }

  function openDeleteModal() {
    if (selectedUsers.length > 0) {
      isDeleteModalOpen = true;
    }
  }

  function refreshPage() {
    goto('/users', { invalidateAll: true });
  }

  function openCreateModal() {
    newUser = {
      username: '',
      password: '',
      email: '',
      role: '',
      groups: '',
      inventory: ''
    };
    showCreateModal = true;
  }

  function closeCreateModal() {
    showCreateModal = false;
    newUser = {
      username: '',
      password: '',
      email: '',
      role: '',
      groups: '',
      inventory: ''
    };
  }

  function handleCreateSubmit() {
    isCreating = true;
    return async ({ result }: { result: { type: string } }) => {
      isCreating = false;
      if (result.type === 'success') {
        closeCreateModal();
        await invalidateAll();
      }
    };
  }

  function getRoleBadgeVariant(role: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    return role === 'admin' ? 'default' : 'secondary';
  }

  function parseCommaSeparated(value: string): string[] {
    if (value === 'nil' || !value) return [];
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
</script>

<div class="w-full space-y-4 p-4">
  {#if data.error}
    <Alert.Root variant="destructive" class="mb-6">
      <AlertTriangleIcon class="h-4 w-4" />
      <Alert.Title>Error</Alert.Title>
      <Alert.Description>{data.error}</Alert.Description>
    </Alert.Root>
  {/if}

  {#if !data.users || data.users.length === 0}
    <Card.Root>
      <Card.Content class="flex flex-col items-center justify-center py-16">
        <UsersIcon class="text-muted-foreground mb-4 h-16 w-16" />
        <h3 class="mb-2 text-lg font-semibold">No users found</h3>
        <p class="text-muted-foreground mb-6 text-center">
          No users are currently registered in the system.
        </p>
        <Button.Root class="cursor-pointer" onclick={openCreateModal}>
          <PlusIcon class="mr-2 h-4 w-4" />
          Add User
        </Button.Root>
      </Card.Content>
    </Card.Root>
  {:else}
    <Card.Root>
      <Card.Header class="flex items-center">
        <Card.Title class="w-32">Users ({data.users?.length || 0})</Card.Title>
        <div class="flex w-full justify-end">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Button.Root
                variant="destructive"
                disabled={selectedUsers.length === 0}
                onclick={openDeleteModal}
              >
                <Trash2Icon class="mr-2 h-4 w-4" />
                Delete Selected ({selectedUsers.length})
              </Button.Root>
            </div>
          </div>

          <div class="ml-2 flex items-center justify-between">
            <div></div>
            <div class="flex items-center gap-2">
              <Button.Root class="cursor-pointer" variant="outline" onclick={refreshPage}>
                <RefreshCwIcon class="mr-2 h-4 w-4" />
                Refresh
              </Button.Root>
              <Button.Root class="cursor-pointer" onclick={openCreateModal}>
                <PlusIcon class="mr-2 h-4 w-4" />
                Add User
              </Button.Root>
            </div>
          </div>
        </div>
      </Card.Header>
      <Card.Content>
        <div class="rounded-md border">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head class="w-12">
                  <Checkbox
                    checked={selectedUsers.length === (data.users?.length || 0) &&
                      (data.users?.length || 0) > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </Table.Head>
                <Table.Head>Username</Table.Head>
                <Table.Head>Email</Table.Head>
                <Table.Head>Role</Table.Head>
                <Table.Head>Groups</Table.Head>
                <Table.Head>Inventories</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each data.users || [] as user (user.username)}
                <Table.Row>
                  <Table.Cell>
                    <Checkbox
                      checked={selectedUsers.includes(user.username)}
                      onCheckedChange={() => handleSelect(user.username)}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Button.Root
                      variant="link"
                      class="h-auto p-0 font-medium"
                      onclick={() => goto(`/users/${user.username}`)}
                    >
                      {user.username}
                    </Button.Root>
                  </Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {#if parseCommaSeparated(user.groups).length === 0}
                      <span class="text-muted-foreground">None</span>
                    {:else}
                      <div class="flex flex-wrap gap-1">
                        {#each parseCommaSeparated(user.groups) as group (group)}
                          <Badge variant="outline">{group}</Badge>
                        {/each}
                      </div>
                    {/if}
                  </Table.Cell>
                  <Table.Cell>
                    {#if parseCommaSeparated(user.inventories).length === 0}
                      <span class="text-muted-foreground">None</span>
                    {:else}
                      <div class="flex flex-wrap gap-1">
                        {#each parseCommaSeparated(user.inventories) as inventory (inventory)}
                          <Badge variant="secondary">{inventory}</Badge>
                        {/each}
                      </div>
                    {/if}
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </div>
      </Card.Content>
    </Card.Root>
  {/if}
</div>

<Dialog.Root bind:open={isDeleteModalOpen}>
  <Dialog.Content class="sm:max-w-[600px]">
    <Dialog.Header>
      <Dialog.Title>Delete Users</Dialog.Title>
      <Dialog.Description>
        This action cannot be undone. This will permanently delete the selected users.
      </Dialog.Description>
    </Dialog.Header>

    <div class="py-4">
      <Alert.Root variant="destructive" class="mb-4">
        <AlertTriangleIcon class="h-4 w-4" />
        <Alert.Title>Warning</Alert.Title>
        <Alert.Description>
          This is a destructive action that permanently removes users from the system.
        </Alert.Description>
      </Alert.Root>

      <p class="mb-3 font-medium">
        Are you sure you want to delete the following {selectedUsers.length} user(s)?
      </p>

      <div class="bg-muted mb-4 max-h-40 overflow-y-auto rounded-md p-4">
        <ul class="space-y-1">
          {#each selectedUsers as username (username)}
            <li class="text-sm">• {username}</li>
          {/each}
        </ul>
      </div>

      <div class="flex items-center space-x-2">
        <Checkbox bind:checked={confirmationChecked} id="confirm-delete" />
        <label for="confirm-delete" class="text-sm font-medium">
          I understand that this action cannot be undone
        </label>
      </div>
    </div>

    <Dialog.Footer>
      <Button.Root variant="outline" onclick={() => (isDeleteModalOpen = false)}>
        Cancel
      </Button.Root>
      <form
        method="POST"
        action="?/deleteUsers"
        use:enhance={() => {
          isDeleting = true;
          return async ({ update }) => {
            await update();
            isDeleting = false;
            isDeleteModalOpen = false;
            selectedUsers = [];
          };
        }}
      >
        {#each selectedUsers as username (username)}
          <input type="hidden" name="usernames" value={username} />
        {/each}
        <Button.Root
          type="submit"
          variant="destructive"
          disabled={!confirmationChecked || isDeleting}
        >
          {#if isDeleting}
            Deleting...
          {:else}
            Delete Users
          {/if}
        </Button.Root>
      </form>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- Create User Modal -->
<Dialog.Root bind:open={showCreateModal}>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>Create User</Dialog.Title>
      <Dialog.Description>Create a new user account in the system.</Dialog.Description>
    </Dialog.Header>

    <form action="?/createUser" method="POST" use:enhance={handleCreateSubmit}>
      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="create-username">Username</Label>
          <Input
            id="create-username"
            name="username"
            type="text"
            placeholder="Enter username"
            bind:value={newUser.username}
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="create-password">Password</Label>
          <Input
            id="create-password"
            name="password"
            type="password"
            placeholder="Enter password"
            bind:value={newUser.password}
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="create-email">Email</Label>
          <Input
            id="create-email"
            name="email"
            type="email"
            placeholder="Enter email address"
            bind:value={newUser.email}
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="create-role">Role</Label>
          <Select.Root
            type="single"
            name="role"
            onValueChange={(value: string) => {
              newUser.role = value;
            }}
          >
            <Select.Trigger class="w-full">
              {newUser.role || 'Select role'}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="user">User</Select.Item>
              <Select.Item value="admin">Admin</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <div class="space-y-2">
          <Label for="create-groups">Groups (optional)</Label>
          <Input
            id="create-groups"
            name="groups"
            type="text"
            placeholder="Enter groups (comma-separated)"
            bind:value={newUser.groups}
          />
        </div>

        <div class="space-y-2">
          <Label for="create-inventory">Inventory (optional)</Label>
          <Select.Root
            type="multiple"
            onValueChange={(value: string) => {
              selectedInventory = value;
            }}
          >
            <Select.Trigger class="w-full">
              {selectedInventory || 'Select inventories'}
            </Select.Trigger>
            <Select.Content>
              {#each inventories as inventory, i (i)}
                <Select.Item value={inventory['name']}>{inventory['name']}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
          <input type="hidden" name="inventory" value={selectedInventory || ''} />
        </div>
      </div>

      <Dialog.Footer>
        <Button.Root
          type="button"
          variant="outline"
          onclick={closeCreateModal}
          disabled={isCreating}
        >
          Cancel
        </Button.Root>
        <Button.Root
          type="submit"
          disabled={isCreating ||
            !newUser.username.trim() ||
            !newUser.password.trim() ||
            !newUser.email.trim() ||
            !newUser.role}
        >
          {isCreating ? 'Creating...' : 'Create User'}
        </Button.Root>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
