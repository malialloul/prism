export interface DatabaseDto {
  id: number;
  name: string;
  engine: 'postgres' | 'mysql';
  host: string;
  port: number;
  username: string;
  database: string;
  ssl: boolean;
  status: 'connected' | 'disconnected' | 'error';
  lastConnectedAt: string;
  tables: number;
  apis: number;
  storageBytes: number;
  isHosted: boolean;
  createdAt: string;
  updatedAt: string;
}
