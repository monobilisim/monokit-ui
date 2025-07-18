<script lang="ts">
  import type { PageData } from './$types';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';

  type ExtendedPageData = PageData & {
    jobData?: {
      logs: string;
    };
    jobID?: number;
    job?: {
      job_env: {
        AWX_HOST: string;
      };
    };
  };

  let { data }: { data: ExtendedPageData } = $props();
  const jobData = data.jobData || { logs: '' };
  const jobID = data.jobID || 0;
  const job = data.job;

  const logLines = jobData.logs.split('\n');

  function downloadLogsAsTxt() {
    const logText = jobData.logs;

    const blob = new Blob([logText], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job_${jobID}_logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

{#if jobData}
  <div class="h-[98vh] w-[86vw] overflow-hidden">
    <Card.Root class="m-4 h-full w-full space-y-4">
      <Card.Header class="flex items-center justify-between">
        <Card.Title>Job Logs</Card.Title>

        <div>
          <Button
            class="cursor-pointer"
            href={job && `${job.job_env.AWX_HOST}/#/jobs/playbooks/${jobID}/`}
          >
            View on AWX</Button
          >
          <Button class="cursor-pointer" onclick={downloadLogsAsTxt}>Download as txt</Button>
        </div>
      </Card.Header>
      <Card.Content class="flex-1 overflow-y-auto">
        {#each logLines as line, i (i)}
          {line}
          <br />
        {/each}
      </Card.Content>
    </Card.Root>
  </div>
{/if}
