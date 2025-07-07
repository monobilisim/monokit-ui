export type UserData = {
  email: string;
  groups: string;
  role: string;
  username: string;
  inventories: string;
};

export type Error = {
  error?: {
    status: Response['status'] | string;
    message: Response['statusText'] | string;
  };
};

export type AlertMessage = {
  type: 'warn' | 'info' | 'success' | 'error';
  message: string;
  id?: string;
};

export type Inventory = {
  id: string;
  name: string;
  hosts: number;
  created_at: string;
};

export type Host = {
  name: string;
  address: string;
  os: string;
  status: string;
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type FormResponse = {
  type?: 'success' | 'error' | 'warn' | 'info';
  message?: string;
  error?: string;
};

export type HostStats = {
  total: number;
  online: number;
  offline: number;
  deletion: number;
  unknown: number;
};

export type LogStats = {
  info: number;
  warning: number;
  error: number;
  critical: number;
};

export type StatusColor = 'bg-green-500' | 'bg-red-500' | 'bg-yellow-500' | 'bg-gray-500';

export type LogLevel = 'info' | 'warning' | 'error' | 'critical';

export type DashboardData = {
  userInfo: UserData;
  hostStats: HostStats;
  logStats: LogStats;
  errorCount: number;
};

export type PageData = {
  hosts: Host[];
  userInfo: UserData;
};

export type HostDetail = {
  name: string;
  ipAddress: string;
  os: string;
  status: string;
  awxHostId?: string;
  awxHostUrl?: string;
  cpuCores?: string;
  ram?: string;
  monokitVersion?: string;
  wantsUpdateTo?: string;
  groups?: string;
  installedComponents?: string;
  disabledComponents?: string;
};

export type AwxJob = {
  name: string;
  status: string;
  started: string;
  finished?: string;
  url?: string;
};

export type HostDetailPageData = {
  host: HostDetail;
  awxJobs: AwxJob[];
  healthTools: string[];
  osHealth?: unknown;
};

export type InventoryData = {
  id: number;
  hosts?: Host[];
  name: string;
};
