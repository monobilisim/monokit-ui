<script lang="ts">
  import '../app.css';
  import { browser } from '$app/environment';
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import { page } from '$app/state';
  import { X } from 'lucide-svelte';
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import type { UserData, Error } from '$lib/types';

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

  interface ExtendedLayoutData extends LayoutData {
    error?: Error | string;
  }

  let { children, data }: { children: Snippet<[]>; data: ExtendedLayoutData } = $props();
  let error: Error | null = $state(null);
  if (data.error) {
    error = data.error;
  }

  import * as Alert from '$lib/components/ui/alert/index.js';
  import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';

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

{#if error !== null}
  <div class="fixed right-0 bottom-0 z-50 p-4">
    <Alert.Root class="cursor-pointer" variant="destructive" onclick={() => (error = null)}>
      <AlertCircleIcon />
      <Alert.Title>{error.message}</Alert.Title>
      <Alert.Description>
        <p>Hii I'm an error :3</p>
      </Alert.Description>
    </Alert.Root>
  </div>
{/if}

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
