import { page, cdp } from '@vitest/browser/context';
import { describe, expect, it, beforeAll } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
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

  it('should render Welcome', async () => {
    render(Page, {
      data: {
        userInfo: {
          email: 'admin@localhost',
          groups: 'admins',
          role: 'admin',
          username: 'admin'
        },
        hostStats: {
          total: 1,
          online: 1,
          offline: 0,
          deletion: 0,
          unknown: 0
        }
      }
    });

    await expect.element(page.getByText('Welcome')).toBeVisible();
  });
});
