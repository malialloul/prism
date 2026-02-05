export interface ConnectDatabaseDto {
  name: string;
  engine: 'postgres' | 'mysql';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
  autoConnect?: boolean;
}
