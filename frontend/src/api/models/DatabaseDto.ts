export interface DatabaseDto {
  id: string;
  name: string;
  engine: 'postgres' | 'mysql';
  host: string;
  port: number;
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
