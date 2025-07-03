<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

	export let data;

	$: userInfo = data.userInfo;
	$: hostStats = data.hostStats;
	$: userRole = userInfo?.role;
	$: logStats = data.logStats;
	$: errorCount = data.errorCount;

	function renderDonutChart() {
		const radius = 85;
		const total = hostStats.total || 1;
		const circumference = 2 * Math.PI * radius;

		let currentOffset = 0;
		const segments = [];

		if (hostStats.online > 0) {
			const percentage = hostStats.online / total;
			segments.push({
				color: '#3E8635',
				dashArray: `${circumference * percentage} ${circumference * (1 - percentage)}`,
				dashOffset: -currentOffset * circumference,
				count: hostStats.online,
				label: 'Online'
			});
			currentOffset += percentage;
		}

		if (hostStats.offline > 0) {
			const percentage = hostStats.offline / total;
			segments.push({
				color: '#C9190B',
				dashArray: `${circumference * percentage} ${circumference * (1 - percentage)}`,
				dashOffset: -currentOffset * circumference,
				count: hostStats.offline,
				label: 'Offline'
			});
			currentOffset += percentage;
		}

		if (hostStats.deletion > 0) {
			const percentage = hostStats.deletion / total;
			segments.push({
				color: '#F0AB00',
				dashArray: `${circumference * percentage} ${circumference * (1 - percentage)}`,
				dashOffset: -currentOffset * circumference,
				count: hostStats.deletion,
				label: 'Pending Deletion'
			});
			currentOffset += percentage;
		}

		if (hostStats.unknown > 0) {
			const percentage = hostStats.unknown / total;
			segments.push({
				color: '#6A6E73',
				dashArray: `${circumference * percentage} ${circumference * (1 - percentage)}`,
				dashOffset: -currentOffset * circumference,
				count: hostStats.unknown,
				label: 'Unknown'
			});
		}

		return segments;
	}

	function renderLogSeverityChart() {
		const radius = 85;
		const strokeWidth = 25;
		const center = 100;
		const totalLogs = Object.values(logStats).reduce((sum, count) => sum + count, 0) || 1;
		const circumference = 2 * Math.PI * radius;

		const levelColors = {
			info: '#0066CC',
			warning: '#F0AB00',
			error: '#C9190B',
			critical: '#A30000'
		};

		const segments = [];
		let currentOffset = 0;

		Object.entries(logStats).forEach(([level, count]) => {
			if (count > 0) {
				const percentage = count / totalLogs;
				segments.push({
					color: levelColors[level],
					dashArray: `${circumference * percentage} ${circumference * (1 - percentage)}`,
					dashOffset: -currentOffset * circumference,
					count,
					label: level.charAt(0).toUpperCase() + level.slice(1)
				});
				currentOffset += percentage;
			}
		});

		return segments;
	}
</script>

<div class="container mx-auto p-6">
	<h1 class="mb-8 text-4xl font-bold">Dashboard</h1>

	{#if userInfo}
		<Card class="mb-6">
			<CardContent class="pt-6">
				<h2 class="mb-4 text-2xl font-bold">Welcome, {userInfo.username}</h2>
				<div class="flex flex-wrap gap-2">
					<Badge variant="default">{userInfo.role}</Badge>
					{#if userInfo.groups !== 'nil'}
						<Badge variant="secondary">Groups: {userInfo.groups}</Badge>
					{/if}
					{#if userInfo.inventories !== 'nil'}
						<Badge variant="secondary">Inventories: {userInfo.inventories}</Badge>
					{/if}
				</div>
			</CardContent>
		</Card>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			<Card>
				<CardHeader>
					<CardTitle>Host Status Overview</CardTitle>
				</CardHeader>
				<CardContent>
					<Popover>
						<PopoverTrigger>
							<div class="relative mx-auto h-[200px] w-[200px]">
								<svg width="170" height="170" viewBox="0 0 200 200">
									{#each renderDonutChart() as segment, i (i)}
										<circle
											cx="100"
											cy="100"
											r="85"
											fill="none"
											stroke={segment.color}
											stroke-width="25"
											stroke-dasharray={segment.dashArray}
											stroke-dashoffset={segment.dashOffset}
											transform="rotate(-90 100 100)"
										/>
									{/each}
									<text x="100" y="95" text-anchor="middle" class="text-4xl font-bold">
										{hostStats.total}
									</text>
									<text x="100" y="125" text-anchor="middle" class="text-base"> hosts </text>
								</svg>
							</div>
						</PopoverTrigger>
						<PopoverContent>
							<div class="p-4">
								<h3 class="mb-2 font-bold">Host Status Summary</h3>
								{#each renderDonutChart() as segment, i (i)}
									<div class="mb-1 flex items-center gap-2">
										<div class="h-3 w-3 rounded-full" style=""></div>
										<span class="">{segment.label}: {segment.count}</span>
									</div>
								{/each}
							</div>
						</PopoverContent>
					</Popover>
				</CardContent>
			</Card>

			{#if userRole === 'admin'}
				<Card>
					<CardHeader>
						<CardTitle>Log Severity Overview</CardTitle>
					</CardHeader>
					<CardContent>
						<Popover>
							<PopoverTrigger>
								<div class="relative mx-auto h-[200px] w-[200px]">
									<svg width="170" height="170" viewBox="0 0 200 200">
										{#each renderLogSeverityChart() as segment, i (i)}
											<circle
												cx="100"
												cy="100"
												r="85"
												fill="none"
												stroke={segment.color}
												stroke-width="25"
												stroke-dasharray={segment.dashArray}
												stroke-dashoffset={segment.dashOffset}
												transform="rotate(-90 100 100)"
											/>
										{/each}
										<text x="100" y="95" text-anchor="middle" class="text-4xl font-bold">
											{Object.values(logStats).reduce((sum, count) => sum + count, 0)}
										</text>
										<text x="100" y="125" text-anchor="middle" class="text-base"> logs </text>
									</svg>
								</div>
							</PopoverTrigger>
							<PopoverContent>
								<div class="p-4">
									<h3 class="mb-2 font-bold">Log Severity Summary (7 days)</h3>
									{#each renderLogSeverityChart() as segment, i (i)}
										<div class="mb-1 flex items-center gap-2">
											<div
												class="h-3 w-3 rounded-full"
												style="background-color: {segment.color}"
											></div>
											<span>{segment.label}: {segment.count}</span>
										</div>
									{/each}
								</div>
							</PopoverContent>
						</Popover>
					</CardContent>
				</Card>
			{/if}

			<!-- Host Statistics -->
			<Card>
				<CardHeader>
					<CardTitle>Host Statistics</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Total Hosts: {hostStats.total}</h3>
						<div class="space-y-2">
							<Badge variant="success">Online: {hostStats.online}</Badge>
							<Badge variant="destructive">Offline: {hostStats.offline}</Badge>
							{#if userRole === 'admin'}
								<Badge variant="warning">Pending Deletion: {hostStats.deletion}</Badge>
							{/if}
						</div>
					</div>
				</CardContent>
			</Card>

			{#if userRole === 'admin'}
				<Card>
					<CardHeader>
						<CardTitle>System Status</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="space-y-2">
							<Badge variant="success">API Server: Running</Badge>
							<Badge variant="success">Database: Connected</Badge>
							<Badge variant="destructive">Errors (24h): {errorCount}</Badge>
							<Badge variant="secondary">
								Last Update: {new Date().toLocaleString()}
							</Badge>
						</div>
					</CardContent>
				</Card>
			{/if}
		</div>
	{/if}
</div>
