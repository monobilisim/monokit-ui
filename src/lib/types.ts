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

export type Domain = {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  settings?: object;
  created_at: string;
  updated_at: string;
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
  awxFreshInstallId?: number | null;
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
  id: number;
  name: string;
  status: string;
  started: string;
  finished?: string;
  url?: string;
};

// Health data types
export type OsHealthData = {
  System: {
    Hostname: string;
    OS: string;
    KernelVer: string;
    LastChecked: string;
  };
  SystemLoad: {
    Load1: number;
    Load5: number;
    Load15: number;
    CPUCount: number;
  };
  Memory: {
    Total: string;
    Used: string;
    UsedPct: number;
  };
  Disk: Array<{
    Mountpoint: string;
    Fstype: string;
    Total: string;
    Used: string;
    UsedPct: number;
  }>;
};

export type MysqlHealthData = {
  LastChecked?: string;
  ServerStatus?: {
    Status: string;
  };
  ServerInfo?: {
    Version: string;
    Uptime: string;
    Port: number;
    DataDir: string;
  };
  Connections?: {
    Used: number;
    MaxConnections: number;
    Total: number;
    Aborted: number;
    Running: number;
  };
  Databases?: {
    Count: number;
    TotalSize: string;
    DataSize: string;
    IndexSize: string;
  };
  DatabaseList?: Array<{
    Name: string;
    Size: string;
    TableCount: number;
  }>;
  Tables?: {
    Count: number;
  };
  Performance?: {
    QueriesPerSecond: number;
    Questions: number;
    SlowQueries: number;
    ComSelect: number;
    ComInsert: number;
    ComUpdate: number;
    ComDelete: number;
  };
  BufferPool?: {
    Size: string;
    TotalPages: number;
    FreePages: number;
    HitRate: number;
    UsedPercent: number;
  };
  QueryCache?: {
    Size: string;
    QueriesInCache: number;
    Hits: number;
    HitRatio: number;
  };
  Replication?: {
    SlaveIORunning: string;
    SlaveSQLRunning: string;
    MasterHost: string;
    MasterPort: number;
    SecondsBehindMaster: number;
    LastError: string;
  };
};

export type PostgresHealthData = {
  LastChecked?: string;
  ServerStatus?: {
    Status: string;
  };
  ServerInfo?: {
    Version: string;
    Uptime: string;
    Port: number;
    DataDir: string;
  };
  Connections?: {
    Used: number;
    MaxConnections: number;
    Total: number;
  };
  Databases?: {
    Count: number;
    TotalSize: string;
  };
  Performance?: {
    QueriesPerSecond: number;
    ActiveConnections: number;
    IdleConnections: number;
  };
};

export type RedisHealthData = {
  LastChecked?: string;
  ServerInfo?: {
    Version: string;
    Uptime: string;
    Port: number;
    Mode: string;
  };
  Memory?: {
    Used: string;
    Peak: string;
    UsedRss: string;
  };
  Stats?: {
    ConnectedClients: number;
    TotalConnections: number;
    KeyspaceHits: number;
    KeyspaceMisses: number;
  };
  Keyspace?: Record<
    string,
    {
      Keys: number;
      Expires: number;
    }
  >;
};

export type ElasticsearchHealthData = {
  LastChecked?: string;
  ClusterHealth?: {
    Status: string;
    NumberOfNodes: number;
    ActiveShards: number;
    RelocatingShards: number;
    InitializingShards: number;
    UnassignedShards: number;
  };
  NodeInfo?: {
    Version: string;
    JvmVersion: string;
    HeapUsed: string;
    HeapMax: string;
  };
  Indices?: {
    Count: number;
    TotalSize: string;
    DocsCount: number;
  };
};

export type RabbitMQHealthData = {
  LastChecked?: string;
  Overview?: {
    RabbitMQVersion: string;
    ErlangVersion: string;
    MessageStats: {
      Publish: number;
      Deliver: number;
      Ack: number;
    };
  };
  Nodes?: Array<{
    Name: string;
    Type: string;
    Running: boolean;
    MemUsed: number;
    DiskFree: number;
  }>;
  Queues?: Array<{
    Name: string;
    Messages: number;
    Consumers: number;
    State: string;
  }>;
};

export type TraefikHealthData = {
  LastChecked?: string;
  Overview?: {
    Version: string;
    Uptime: string;
    TotalRouters: number;
    TotalServices: number;
  };
  Routers?: Array<{
    Name: string;
    Status: string;
    Rule: string;
    Service: string;
  }>;
  Services?: Array<{
    Name: string;
    Status: string;
    Provider: string;
    Type: string;
  }>;
};

export type K8sHealthData = {
  LastChecked?: string;
  ClusterInfo?: {
    Version: string;
    NodeCount: number;
    NamespaceCount: number;
  };
  Nodes?: Array<{
    Name: string;
    Status: string;
    Version: string;
    CPUCapacity: string;
    MemoryCapacity: string;
  }>;
  Pods?: {
    Total: number;
    Running: number;
    Pending: number;
    Failed: number;
  };
};

export type ProxmoxHealthData = {
  LastChecked?: string;
  ClusterStatus?: {
    Name: string;
    Nodes: number;
    Quorate: number;
    Version: string;
  };
  NodeInfo?: Array<{
    Name: string;
    Status: string;
    Uptime: number;
    CPU: number;
    Memory: {
      Used: number;
      Total: number;
    };
  }>;
  VMs?: {
    Total: number;
    Running: number;
    Stopped: number;
  };
};

export type PostalHealthData = {
  LastChecked?: string;
  Status?: string;
  Version?: string;
  Organizations?: number;
  Servers?: Array<{
    Name: string;
    Status: string;
    Mode: string;
  }>;
  QueueStatus?: {
    Queued: number;
    Processing: number;
    Held: number;
  };
};

export type PritunlHealthData = {
  LastChecked?: string;
  Status?: string;
  Version?: string;
  ServerCount?: number;
  UserCount?: number;
  Servers?: Array<{
    Name: string;
    Status: string;
    Port: number;
    Protocol: string;
    UserCount: number;
  }>;
};

export type VaultHealthData = {
  LastChecked?: string;
  Status?: string;
  Version?: string;
  Sealed?: boolean;
  Initialized?: boolean;
  ClusterInfo?: {
    ClusterID: string;
    ClusterName: string;
  };
  AuthMethods?: Array<{
    Type: string;
    Path: string;
  }>;
  SecretEngines?: Array<{
    Type: string;
    Path: string;
  }>;
};

export type WppConnectHealthData = {
  LastChecked?: string;
  Status?: string;
  Version?: string;
  Sessions?: Array<{
    Name: string;
    Status: string;
    QRCode?: string;
    Connected: boolean;
  }>;
  MessageStats?: {
    Sent: number;
    Received: number;
    Failed: number;
  };
};

export type ZimbraHealthData = {
  LastChecked?: string;
  Status?: string;
  Version?: string;
  Services?: Array<{
    Name: string;
    Status: string;
    Host: string;
  }>;
  MailboxStats?: {
    TotalMailboxes: number;
    TotalMessages: number;
    TotalSize: string;
  };
  QueueStats?: {
    Incoming: number;
    Active: number;
    Deferred: number;
  };
};

export type HostDetailPageData = {
  host: HostDetail;
  awxJobs: AwxJob[];
  healthTools: string[];
  osHealth?: OsHealthData;
  mysqlHealth?: MysqlHealthData;
  pgsqlHealth?: PostgresHealthData;
  redisHealth?: RedisHealthData;
  esHealth?: ElasticsearchHealthData;
  rmqHealth?: RabbitMQHealthData;
  traefikHealth?: TraefikHealthData;
  k8sHealth?: K8sHealthData;
  pmgHealth?: ProxmoxHealthData;
  postalHealth?: PostalHealthData;
  pritunlHealth?: PritunlHealthData;
  vaultHealth?: VaultHealthData;
  wppconnectHealth?: WppConnectHealthData;
  zimbraHealth?: ZimbraHealthData;
  hostName: string;
};

export type InventoryData = {
  id: number;
  hosts?: Host[];
  name: string;
};

export type Log = {
  id: string;
  timestamp: string;
  level: LogLevel;
  component: string;
  host_name: string;
  message: string;
  type: string;
};

export type LogChartData = {
  timestamp?: number;
  info: number;
  warning: number;
  error: number;
  critical: number;
};

export type LogSearchParams = {
  page: number;
  page_size: number;
  level?: string;
  host?: string;
  type?: string;
  message_text?: string;
};

export type LogSearchResponse = {
  logs: Log[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
  };
};

export type LogsPageData = {
  logs: Log[];
  totalItems: number;
  availableHosts: string[];
  availableTypes: string[];
  chartData: LogChartData[];
};

export type UserPageData = {
  id: number;
  email: string;
  groups: string;
  inventories: string;
  role: string;
  username: string;
};
