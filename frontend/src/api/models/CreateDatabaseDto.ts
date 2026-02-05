export interface CreateDatabaseDto {
  name: string;
  engine: 'postgres' | 'mysql';
  username: string;
  password: string;
  autoConnect?: boolean;
}
