export interface CreateDatabaseDto {
  name: string;
  engine: 'postgres' | 'mysql';
  password: string;
}
