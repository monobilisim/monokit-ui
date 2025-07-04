<script lang="ts">
  import '../app.css';
  import { browser } from '$app/environment';
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import { page } from '$app/state';
  import { X } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import type { UserData, AlertMessage } from '$lib/types';
  import { alerts } from '$lib/stores/alerts';

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser
      }
    }
  });

  import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
  import NavigationMenuLink from '$lib/components/ui/navigation-menu/navigation-menu-link.svelte';
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

  // Add alerts from layout data on mount
  onMount(() => {
    if (data.alerts && data.alerts.length > 0) {
      data.alerts.forEach((alert) => {
        alerts.add(alert);
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

  function getAlertStyles(type: AlertMessage['type']) {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'warn':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      default:
        return '';
    }
  }

  function dismissAlert(id: string) {
    alerts.remove(id);
  }

  let userData: UserData | null = $state(null);

  $effect((): void => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      try {
        userData = JSON.parse(userDataString);
      } catch {
        userData = null;
      }
    } else {
      userData = null;
    }
  });
</script>

<!-- Alert Messages -->
<div class="fixed top-4 right-4 z-50 max-w-md space-y-2">
  {#each $alerts as alert (alert.id)}
    <Alert.Root
      variant={getAlertVariant(alert.type)}
      class="cursor-pointer {getAlertStyles(alert.type)}"
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
    <div class="sidebar h-screen border border-slate-50">
      <NavigationMenu.Root class="*:*:*:w-64 *:*:*:px-4 *:*:*:py-2">
        <NavigationMenu.List class="flex flex-col gap-1">
          <NavigationMenu.Item>
            <NavigationMenuLink href="/">Dashboard</NavigationMenuLink>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenuLink href="/hosts">Hosts</NavigationMenuLink>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenuLink href="/users">Users</NavigationMenuLink>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenuLink href="/inventories">Inventories</NavigationMenuLink>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenuLink href="/groups">Groups</NavigationMenuLink>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenuLink href="/logs">Logs</NavigationMenuLink>
          </NavigationMenu.Item>
          {#if userData !== null}
            <NavigationMenu.Item class="flex justify-between">
              <NavigationMenuLink>{userData.username}</NavigationMenuLink>
              <Button
                type="submit"
                variant="destructive"
                class="w-8 cursor-pointer"
                onclick={async () => logout()}><X></X></Button
              >
            </NavigationMenu.Item>
          {/if}
        </NavigationMenu.List>
      </NavigationMenu.Root>

      <Button onclick={toggleDark} variant="secondary">Toggle Dark Mode</Button>
    </div>
  {/if}

  <QueryClientProvider client={queryClient}>
    {@render children()}
  </QueryClientProvider>
</main>
