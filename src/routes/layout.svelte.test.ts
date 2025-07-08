import { page, cdp } from '@vitest/browser/context';
import { describe, expect, it, beforeAll } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Layout from './+layout.svelte';

describe('/+layout.svelte', () => {
  beforeAll(async () => {
    await cdp().send('Network.setCookie', {
      name: 'Authorization',
      value: 'fake-token',
      domain: 'localhost',
      path: '/',
      secure: false,
      httpOnly: false,
      sameSite: 'Lax'
    });
  });

  // it('should render layout', async () => {
  //   render(Layout, {
  //     data: {
  //       alerts: []
  //     },
  //     children: () => {}
  //   });

  //   await expect.element(page.getByText('MonoKit')).toBeVisible();
  //   await expect.element(page.getByText('Dashboard')).toBeVisible();
  // });
  it('test is empty', async () => {
    return true;
  });
});
