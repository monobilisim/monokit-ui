import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { UserData } from '$lib/types';

export const load: PageServerLoad = async () => {
	return {};
};

import { MONOKIT_URL } from '$env/static/private';

export const actions: Actions = {
	default: async ({ request, cookies, fetch }) => {
		const form = await request.formData();
		const username = form.get('username');
		const password = form.get('password');

		if (!username || !password) {
			return fail(400, { error: 'Username and password are required.' });
		}

		const res = await fetch(`${MONOKIT_URL}/api/v1/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password })
		});

		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			return fail(res.status, { error: data.error || 'Login failed.' });
		}

		type LoginData = {
			token: string;
			user: UserData;
		};

		const data: LoginData = await res.json();
		const token = data.token;
		const userData = data.user;

		if (!token) {
			return fail(400, { error: 'No token received from server.' });
		}

		cookies.set('Authorization', `Bearer ${token}`, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: true,
			maxAge: 60 * 60 * 24 * 7 // 1 week
		});

		cookies.set('userData', JSON.stringify(userData), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: true,
			maxAge: 60 * 60 * 24 * 7 // 1 week
		});

		throw redirect(303, '/');
	}
};
