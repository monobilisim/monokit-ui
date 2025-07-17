<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import type { PageData } from './$types';

  type ExtendedPageData = PageData & {
    hostConfig?: Record<string, string>;
  };

  let { data }: { data: ExtendedPageData } = $props();
  const hostConfig: Record<string, string> = data.hostConfig || {};

  const hostConfigButUseful: { name: string; content: string }[] = Object.entries(hostConfig).map(
    ([key, value]) => ({ name: key, content: value })
  );
</script>

{#if hostConfig}
  <div class="m-4 mr-0 grid h-full w-full grid-cols-3 gap-4">
    {#each hostConfigButUseful as row, index (index)}
      <Card.Root class="h-[50vh] w-full overflow-hidden">
        <Card.Header class="flex items-center justify-between">
          <Card.Title>{row['name']}</Card.Title>
          <Button>Edit</Button>
        </Card.Header>
        <Card.Content class="overflow-x-hidden overflow-y-auto">
          {@html row['content'].replaceAll('\n', '<br/>').replaceAll(' ', '&nbsp;')}
        </Card.Content>
      </Card.Root>
    {/each}
  </div>
{/if}
