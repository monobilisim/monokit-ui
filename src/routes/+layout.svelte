<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import {
    LayoutDashboard,
    Server,
    Users,
    Package,
    Group,
    FileText,
    Moon,
    Sun
  } from 'lucide-svelte';
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import type { UserData, AlertMessage } from '$lib/types';
  import { alerts } from '$lib/stores/alerts';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
  import CheckCircleIcon from '@lucide/svelte/icons/check-circle';
  import InfoIcon from '@lucide/svelte/icons/info';
  import AlertTriangleIcon from '@lucide/svelte/icons/alert-triangle';

  let dark = $state(false);

  $effect(() => {
    const stored = localStorage.getItem('dark-mode');
    if (stored === 'true') {
      dark = true;
      document.documentElement.classList.add('dark');
    } else {
      dark = false;
      document.documentElement.classList.remove('dark');
    }
  });

  function toggleDark() {
    dark = !dark;
    localStorage.setItem('dark-mode', dark ? 'true' : 'false');
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  async function logout(): Promise<void> {
    await fetch(`/logout`, {
      credentials: 'include'
    });
  }

  type ExtendedLayoutData = LayoutData & {
    alerts?: AlertMessage[];
  };

  let { children, data }: { children: Snippet<[]>; data: ExtendedLayoutData } = $props();

  let userData: UserData | null = data.userData;

  $effect(() => {
    if (data.alerts && data.alerts.length > 0) {
      data.alerts.forEach((alert) => {
        if (window.location.pathname !== '/login') {
          alerts.add(alert);
        }
      });
    }
  });

  function getAlertVariant(type: AlertMessage['type']) {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warn':
        return 'default';
      case 'success':
        return 'default';
      case 'info':
        return 'default';
      default:
        return 'default';
    }
  }

  function dismissAlert(id: string) {
    alerts.remove(id);
  }

  const menuItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/hosts', icon: Server, label: 'Hosts' },
    { href: '/users', icon: Users, label: 'Users' },
    { href: '/inventories', icon: Package, label: 'Inventories' },
    { href: '/groups', icon: Group, label: 'Groups' },
    { href: '/logs', icon: FileText, label: 'Logs' }
  ];
</script>

<!-- Alert Messages -->
<div class="fixed right-4 bottom-4 z-50 max-w-md space-y-2">
  {#each $alerts as alert (alert.id)}
    <Alert.Root
      variant={getAlertVariant(alert.type)}
      class="cursor-pointer"
      onclick={() => dismissAlert(alert.id!)}
    >
      {#if alert.type === 'error'}
        <AlertCircleIcon class="h-4 w-4" />
      {:else if alert.type === 'warn'}
        <AlertTriangleIcon class="h-4 w-4" />
      {:else if alert.type === 'success'}
        <CheckCircleIcon class="h-4 w-4" />
      {:else}
        <InfoIcon class="h-4 w-4" />
      {/if}
      <Alert.Description class="font-medium">
        {alert.message}
      </Alert.Description>
    </Alert.Root>
  {/each}
</div>

<main class="flex">
  {#if page.url.pathname !== '/login'}
    <Sidebar.Provider class="w-64">
      <Sidebar.Root variant="sidebar" collapsible="icon">
        <Sidebar.Header class="border-b px-4 py-3">
          <div class="flex items-center gap-2">
            <div
              class="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg"
            >
              <Package class="h-4 w-4" />
            </div>
            <span class="font-semibold">Monokit</span>
          </div>
        </Sidebar.Header>

        <Sidebar.Content class="px-2 py-4">
          <Sidebar.Group>
            <!-- <Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel> -->
            <Sidebar.GroupContent>
              <Sidebar.Menu>
                {#each menuItems as item (item.href)}
                  {@const IconComponent = item.icon}
                  <Sidebar.MenuItem>
                    <a href={item.href} class="block">
                      <Sidebar.MenuButton
                        isActive={page.url.pathname === item.href}
                        tooltipContent={item.label}
                        class="cursor-pointer p-2"
                      >
                        <IconComponent class="h-4 w-4" />
                        <span>{item.label}</span>
                      </Sidebar.MenuButton>
                    </a>
                  </Sidebar.MenuItem>
                {/each}
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
        </Sidebar.Content>

        <Sidebar.Footer class="mb-8 border-t px-2 py-3">
          <Sidebar.Menu>
            {#if userData}
              <Sidebar.MenuItem class="ml-2 flex items-center border-b pb-2 align-middle">
                <div class="flex w-full items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div
                      class="bg-muted text-muted-foreground flex h-4 w-4 items-center justify-center rounded-full text-sm"
                    >
                      {userData.username.charAt(0).toUpperCase()}
                    </div>
                    <span class="text-sm font-medium">{userData.username}</span>
                  </div>
                  <Button
                    type="submit"
                    variant="destructive"
                    size="sm"
                    class="cursor-pointer p-2"
                    onclick={async () => logout()}
                  >
                    Logout
                  </Button>
                </div>
              </Sidebar.MenuItem>
            {/if}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                tooltipContent={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                onclick={toggleDark}
              >
                {#if dark}
                  <Sun class="h-4 w-4" />
                  <span>Light Mode</span>
                {:else}
                  <Moon class="h-4 w-4" />
                  <span>Dark Mode</span>
                {/if}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.Footer>
      </Sidebar.Root>
    </Sidebar.Provider>
  {/if}

  {@render children?.()}
</main>
