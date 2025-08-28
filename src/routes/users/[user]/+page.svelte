<script lang="ts">
  import type { UserPageData } from '$lib/types';
  import type { PageData } from './$types';

  type ExtendedPageData = PageData & {
    user: UserPageData | null;
  };

  let { data }: { data: ExtendedPageData } = $props();

  const user = data.user || null;

  import { Button } from '$lib/components/ui/button/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import * as Card from '$lib/components/ui/card/index.js';

  import { Badge } from '$lib/components/ui/badge/index.js';
  import BadgeCheckIcon from '@lucide/svelte/icons/badge-check';

  //let inventories = user.inventories.split(',').map((i) => i.trim());
  let groups = $state<string[]>([]);

  $effect(() => {
    console.log(data);
  });

  if (user.groups !== 'nil' && user.groups !== '' && user.groups !== null) {
    groups = user.groups.split(',').map((i) => i.trim());
  } else {
    groups = [];
  }
</script>

<Card.Root class="m-4 h-full w-full space-y-4">
  <Card.Header>
    <Card.Title>{user.username} <Badge class="ml-4">{user.role}</Badge></Card.Title>
    <Card.Description></Card.Description>
    <Card.Content>
      id: {user.id}
      <!--<br />
      inventories:
      {#each inventories as inv, i (i)}
        <Badge class="mr-2">{inv}</Badge>
      {/each}-->
      <br />
      groups:
      {#each groups as group, i (i)}
        <Badge class="mr-2">{group}</Badge>
      {/each}
      <br />
      email: {user.email}
      <br />
      username: {user.username}
    </Card.Content>
    <!--<Card.Action>
      <Button variant="outline">Edit</Button>
      </Card.Action>-->
  </Card.Header>
  <Card.Content></Card.Content>
</Card.Root>
