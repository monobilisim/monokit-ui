export type UserData = {
  email: string;
  groups: string;
  role: string;
  username: string;
};

export type Error = {
  error?: {
    status: Response['status'] | string;
    message: Response['statusText'] | string;
  };
};

export type Inventory = {
  id: string;
  name: string;
  hosts: number;
  created_at: string;
};
