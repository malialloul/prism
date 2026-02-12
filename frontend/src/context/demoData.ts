import type { DatabaseDto } from '../api/models/DatabaseDto';
import type { SchemaObjectDto, TableDetailsDto, SavedQueryDto, QueryResultDto, ColumnDto, IndexDto } from '../api/models/SchemaDto';
import { QueryStatsResponse } from '../api/services/DatabasesService';

// Helper to create columns with all required fields
const createColumn = (
  name: string,
  type: string,
  options: {
    nullable?: boolean;
    defaultValue?: string | null;
    isPrimaryKey?: boolean;
    isForeignKey?: boolean;
    foreignKeyRef?: { table: string; column: string };
  } = {}
): ColumnDto => ({
  name,
  type,
  nullable: options.nullable ?? false,
  defaultValue: options.defaultValue ?? null,
  isPrimaryKey: options.isPrimaryKey ?? false,
  isForeignKey: options.isForeignKey ?? false,
  foreignKeyRef: options.foreignKeyRef,
});

// Helper to create indexes with all required fields
const createIndex = (
  name: string,
  columns: string[],
  options: { isUnique?: boolean; isPrimary?: boolean; type?: string } = {}
): IndexDto => ({
  name,
  columns,
  isUnique: options.isUnique ?? false,
  isPrimary: options.isPrimary ?? false,
  type: options.type ?? 'btree',
});

// Mock databases for demo mode
export const DEMO_DATABASES: DatabaseDto[] = [
  {
    id: 1,
    name: 'demo_ecommerce',
    engine: 'postgres',
    host: 'demo.prism.dev',
    port: 5432,
    database: 'ecommerce',
    username: 'demo_user',
    ssl: true,
    status: 'connected',
    isHosted: false,
    lastConnectedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    tables: 8,
    apis: 12,
    storageBytes: 52428800,
  },
  {
    id: 2,
    name: 'sample_analytics',
    engine: 'mysql',
    host: 'analytics.prism.dev',
    port: 3306,
    database: 'analytics',
    username: 'analytics_user',
    ssl: false,
    status: 'connected',
    isHosted: true,
    lastConnectedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    tables: 5,
    apis: 8,
    storageBytes: 26214400,
  },
];

// Mock schema objects for demo mode - Ecommerce database (id: 1)
export const DEMO_SCHEMA_OBJECTS: SchemaObjectDto[] = [
  { name: 'users', type: 'table', schema: 'public' },
  { name: 'products', type: 'table', schema: 'public' },
  { name: 'orders', type: 'table', schema: 'public' },
  { name: 'order_items', type: 'table', schema: 'public' },
  { name: 'categories', type: 'table', schema: 'public' },
  { name: 'reviews', type: 'table', schema: 'public' },
  { name: 'inventory', type: 'table', schema: 'public' },
  { name: 'payments', type: 'table', schema: 'public' },
];

// Mock schema objects for Analytics database (id: 2)
export const DEMO_ANALYTICS_SCHEMA_OBJECTS: SchemaObjectDto[] = [
  { name: 'page_views', type: 'table', schema: 'analytics' },
  { name: 'user_sessions', type: 'table', schema: 'analytics' },
  { name: 'events', type: 'table', schema: 'analytics' },
  { name: 'conversions', type: 'table', schema: 'analytics' },
  { name: 'campaigns', type: 'table', schema: 'analytics' },
];

// Mock table details for demo mode
export const DEMO_TABLE_DETAILS: Record<string, TableDetailsDto> = {
  users: {
    name: 'users',
    schema: 'public',
    columns: [
      createColumn('id', 'integer', { isPrimaryKey: true }),
      createColumn('email', 'varchar(255)'),
      createColumn('full_name', 'varchar(100)', { nullable: true }),
      createColumn('created_at', 'timestamp', { defaultValue: 'CURRENT_TIMESTAMP' }),
      createColumn('updated_at', 'timestamp', { nullable: true }),
    ],
    indexes: [
      createIndex('users_pkey', ['id'], { isUnique: true, isPrimary: true }),
      createIndex('users_email_key', ['email'], { isUnique: true }),
    ],
    constraints: [
      { name: 'users_pkey', type: 'PRIMARY KEY', columns: ['id'] },
    ],
    rowCount: 1250,
    sampleData: [
      { id: 1, email: 'john@example.com', full_name: 'John Doe' },
      { id: 2, email: 'jane@example.com', full_name: 'Jane Smith' },
    ],
  },
  products: {
    name: 'products',
    schema: 'public',
    columns: [
      createColumn('id', 'integer', { isPrimaryKey: true }),
      createColumn('name', 'varchar(255)'),
      createColumn('description', 'text', { nullable: true }),
      createColumn('price', 'decimal(10,2)'),
      createColumn('category_id', 'integer', { nullable: true, isForeignKey: true, foreignKeyRef: { table: 'categories', column: 'id' } }),
      createColumn('stock_quantity', 'integer', { defaultValue: '0' }),
      createColumn('created_at', 'timestamp', { defaultValue: 'CURRENT_TIMESTAMP' }),
    ],
    indexes: [
      createIndex('products_pkey', ['id'], { isUnique: true, isPrimary: true }),
      createIndex('products_category_idx', ['category_id']),
    ],
    constraints: [
      { name: 'products_pkey', type: 'PRIMARY KEY', columns: ['id'] },
      { name: 'products_category_fkey', type: 'FOREIGN KEY', columns: ['category_id'], referencedTable: 'categories', referencedColumns: ['id'] },
    ],
    rowCount: 450,
    sampleData: [
      { id: 1, name: 'Laptop', price: 999.99, category_id: 1 },
      { id: 2, name: 'Phone', price: 699.99, category_id: 1 },
    ],
  },
  orders: {
    name: 'orders',
    schema: 'public',
    columns: [
      createColumn('id', 'integer', { isPrimaryKey: true }),
      createColumn('user_id', 'integer', { isForeignKey: true, foreignKeyRef: { table: 'users', column: 'id' } }),
      createColumn('status', 'varchar(50)', { defaultValue: "'pending'" }),
      createColumn('total_amount', 'decimal(10,2)'),
      createColumn('shipping_address', 'text', { nullable: true }),
      createColumn('created_at', 'timestamp', { defaultValue: 'CURRENT_TIMESTAMP' }),
    ],
    indexes: [
      createIndex('orders_pkey', ['id'], { isUnique: true, isPrimary: true }),
      createIndex('orders_user_idx', ['user_id']),
    ],
    constraints: [
      { name: 'orders_pkey', type: 'PRIMARY KEY', columns: ['id'] },
      { name: 'orders_user_fkey', type: 'FOREIGN KEY', columns: ['user_id'], referencedTable: 'users', referencedColumns: ['id'] },
    ],
    rowCount: 3200,
    sampleData: [
      { id: 1, user_id: 1, status: 'completed', total_amount: 149.99 },
      { id: 2, user_id: 2, status: 'pending', total_amount: 299.99 },
    ],
  },
  order_items: {
    name: 'order_items',
    schema: 'public',
    columns: [
      createColumn('id', 'integer', { isPrimaryKey: true }),
      createColumn('order_id', 'integer', { isForeignKey: true, foreignKeyRef: { table: 'orders', column: 'id' } }),
      createColumn('product_id', 'integer', { isForeignKey: true, foreignKeyRef: { table: 'products', column: 'id' } }),
      createColumn('quantity', 'integer', { defaultValue: '1' }),
      createColumn('unit_price', 'decimal(10,2)'),
    ],
    indexes: [
      createIndex('order_items_pkey', ['id'], { isUnique: true, isPrimary: true }),
    ],
    constraints: [
      { name: 'order_items_pkey', type: 'PRIMARY KEY', columns: ['id'] },
      { name: 'order_items_order_fkey', type: 'FOREIGN KEY', columns: ['order_id'], referencedTable: 'orders', referencedColumns: ['id'] },
      { name: 'order_items_product_fkey', type: 'FOREIGN KEY', columns: ['product_id'], referencedTable: 'products', referencedColumns: ['id'] },
    ],
    rowCount: 8500,
    sampleData: [
      { id: 1, order_id: 1, product_id: 1, quantity: 1, unit_price: 999.99 },
      { id: 2, order_id: 1, product_id: 2, quantity: 2, unit_price: 49.99 },
    ],
  },
  categories: {
    name: 'categories',
    schema: 'public',
    columns: [
      createColumn('id', 'integer', { isPrimaryKey: true }),
      createColumn('name', 'varchar(100)'),
      createColumn('parent_id', 'integer', { nullable: true, isForeignKey: true, foreignKeyRef: { table: 'categories', column: 'id' } }),
    ],
    indexes: [
      createIndex('categories_pkey', ['id'], { isUnique: true, isPrimary: true }),
    ],
    constraints: [
      { name: 'categories_pkey', type: 'PRIMARY KEY', columns: ['id'] },
      { name: 'categories_parent_fkey', type: 'FOREIGN KEY', columns: ['parent_id'], referencedTable: 'categories', referencedColumns: ['id'] },
    ],
    rowCount: 25,
    sampleData: [
      { id: 1, name: 'Electronics', parent_id: null },
      { id: 2, name: 'Clothing', parent_id: null },
    ],
  },
  reviews: {
    name: 'reviews',
    schema: 'public',
    columns: [
      createColumn('id', 'integer', { isPrimaryKey: true }),
      createColumn('product_id', 'integer', { isForeignKey: true, foreignKeyRef: { table: 'products', column: 'id' } }),
      createColumn('user_id', 'integer', { isForeignKey: true, foreignKeyRef: { table: 'users', column: 'id' } }),
      createColumn('rating', 'integer'),
      createColumn('comment', 'text', { nullable: true }),
      createColumn('created_at', 'timestamp', { defaultValue: 'CURRENT_TIMESTAMP' }),
    ],
    indexes: [
      createIndex('reviews_pkey', ['id'], { isUnique: true, isPrimary: true }),
    ],
    constraints: [
      { name: 'reviews_pkey', type: 'PRIMARY KEY', columns: ['id'] },
      { name: 'reviews_product_fkey', type: 'FOREIGN KEY', columns: ['product_id'], referencedTable: 'products', referencedColumns: ['id'] },
      { name: 'reviews_user_fkey', type: 'FOREIGN KEY', columns: ['user_id'], referencedTable: 'users', referencedColumns: ['id'] },
    ],
    rowCount: 2100,
    sampleData: [
      { id: 1, product_id: 1, user_id: 1, rating: 5, comment: 'Great product!' },
      { id: 2, product_id: 2, user_id: 2, rating: 4, comment: 'Good value' },
    ],
  },
  inventory: {
    name: 'inventory',
    schema: 'public',
    columns: [
      createColumn('id', 'integer', { isPrimaryKey: true }),
      createColumn('product_id', 'integer', { isForeignKey: true, foreignKeyRef: { table: 'products', column: 'id' } }),
      createColumn('warehouse_location', 'varchar(50)', { nullable: true }),
      createColumn('quantity', 'integer', { defaultValue: '0' }),
      createColumn('last_updated', 'timestamp', { defaultValue: 'CURRENT_TIMESTAMP' }),
    ],
    indexes: [
      createIndex('inventory_pkey', ['id'], { isUnique: true, isPrimary: true }),
    ],
    constraints: [
      { name: 'inventory_pkey', type: 'PRIMARY KEY', columns: ['id'] },
      { name: 'inventory_product_fkey', type: 'FOREIGN KEY', columns: ['product_id'], referencedTable: 'products', referencedColumns: ['id'] },
    ],
    rowCount: 450,
    sampleData: [
      { id: 1, product_id: 1, warehouse_location: 'A-1-1', quantity: 50 },
      { id: 2, product_id: 2, warehouse_location: 'B-2-3', quantity: 100 },
    ],
  },
  payments: {
    name: 'payments',
    schema: 'public',
    columns: [
      createColumn('id', 'integer', { isPrimaryKey: true }),
      createColumn('order_id', 'integer', { isForeignKey: true, foreignKeyRef: { table: 'orders', column: 'id' } }),
      createColumn('amount', 'decimal(10,2)'),
      createColumn('payment_method', 'varchar(50)'),
      createColumn('status', 'varchar(50)', { defaultValue: "'pending'" }),
      createColumn('processed_at', 'timestamp', { nullable: true }),
    ],
    indexes: [
      createIndex('payments_pkey', ['id'], { isUnique: true, isPrimary: true }),
    ],
    constraints: [
      { name: 'payments_pkey', type: 'PRIMARY KEY', columns: ['id'] },
      { name: 'payments_order_fkey', type: 'FOREIGN KEY', columns: ['order_id'], referencedTable: 'orders', referencedColumns: ['id'] },
    ],
    rowCount: 3200,
    sampleData: [
      { id: 1, order_id: 1, amount: 149.99, payment_method: 'credit_card', status: 'completed' },
      { id: 2, order_id: 2, amount: 299.99, payment_method: 'paypal', status: 'pending' },
    ],
  },
};

// Mock table details for Analytics database (id: 2)
export const DEMO_ANALYTICS_TABLE_DETAILS: Record<string, TableDetailsDto> = {
  page_views: {
    name: 'page_views',
    schema: 'analytics',
    columns: [
      createColumn('id', 'bigint', { isPrimaryKey: true }),
      createColumn('session_id', 'uuid', { isForeignKey: true, foreignKeyRef: { table: 'user_sessions', column: 'id' } }),
      createColumn('page_url', 'varchar(500)'),
      createColumn('referrer_url', 'varchar(500)', { nullable: true }),
      createColumn('viewed_at', 'timestamp', { defaultValue: 'CURRENT_TIMESTAMP' }),
    ],
    indexes: [
      createIndex('page_views_pkey', ['id'], { isUnique: true, isPrimary: true }),
      createIndex('page_views_session_idx', ['session_id']),
      createIndex('page_views_viewed_at_idx', ['viewed_at']),
    ],
    constraints: [
      { name: 'page_views_pkey', type: 'PRIMARY KEY', columns: ['id'] },
    ],
    rowCount: 125000,
    sampleData: [
      { id: 1, session_id: 'a1b2c3d4', page_url: '/home', referrer_url: null },
      { id: 2, session_id: 'a1b2c3d4', page_url: '/products', referrer_url: '/home' },
    ],
  },
  user_sessions: {
    name: 'user_sessions',
    schema: 'analytics',
    columns: [
      createColumn('id', 'uuid', { isPrimaryKey: true }),
      createColumn('user_agent', 'varchar(500)'),
      createColumn('ip_address', 'varchar(45)'),
      createColumn('country', 'varchar(2)', { nullable: true }),
      createColumn('started_at', 'timestamp', { defaultValue: 'CURRENT_TIMESTAMP' }),
      createColumn('ended_at', 'timestamp', { nullable: true }),
    ],
    indexes: [
      createIndex('user_sessions_pkey', ['id'], { isUnique: true, isPrimary: true }),
      createIndex('user_sessions_started_at_idx', ['started_at']),
    ],
    constraints: [
      { name: 'user_sessions_pkey', type: 'PRIMARY KEY', columns: ['id'] },
    ],
    rowCount: 45000,
    sampleData: [
      { id: 'a1b2c3d4', user_agent: 'Mozilla/5.0...', ip_address: '192.168.1.1', country: 'US' },
    ],
  },
  events: {
    name: 'events',
    schema: 'analytics',
    columns: [
      createColumn('id', 'bigint', { isPrimaryKey: true }),
      createColumn('session_id', 'uuid', { isForeignKey: true, foreignKeyRef: { table: 'user_sessions', column: 'id' } }),
      createColumn('event_type', 'varchar(100)'),
      createColumn('event_data', 'jsonb', { nullable: true }),
      createColumn('created_at', 'timestamp', { defaultValue: 'CURRENT_TIMESTAMP' }),
    ],
    indexes: [
      createIndex('events_pkey', ['id'], { isUnique: true, isPrimary: true }),
      createIndex('events_session_idx', ['session_id']),
      createIndex('events_type_idx', ['event_type']),
    ],
    constraints: [
      { name: 'events_pkey', type: 'PRIMARY KEY', columns: ['id'] },
    ],
    rowCount: 280000,
    sampleData: [
      { id: 1, session_id: 'a1b2c3d4', event_type: 'button_click', event_data: '{"button": "signup"}' },
    ],
  },
  conversions: {
    name: 'conversions',
    schema: 'analytics',
    columns: [
      createColumn('id', 'integer', { isPrimaryKey: true }),
      createColumn('session_id', 'uuid', { isForeignKey: true, foreignKeyRef: { table: 'user_sessions', column: 'id' } }),
      createColumn('campaign_id', 'integer', { isForeignKey: true, foreignKeyRef: { table: 'campaigns', column: 'id' } }),
      createColumn('conversion_type', 'varchar(50)'),
      createColumn('value', 'decimal(10,2)', { nullable: true }),
      createColumn('converted_at', 'timestamp', { defaultValue: 'CURRENT_TIMESTAMP' }),
    ],
    indexes: [
      createIndex('conversions_pkey', ['id'], { isUnique: true, isPrimary: true }),
      createIndex('conversions_campaign_idx', ['campaign_id']),
    ],
    constraints: [
      { name: 'conversions_pkey', type: 'PRIMARY KEY', columns: ['id'] },
    ],
    rowCount: 8500,
    sampleData: [
      { id: 1, session_id: 'a1b2c3d4', campaign_id: 1, conversion_type: 'purchase', value: 99.99 },
    ],
  },
  campaigns: {
    name: 'campaigns',
    schema: 'analytics',
    columns: [
      createColumn('id', 'integer', { isPrimaryKey: true }),
      createColumn('name', 'varchar(200)'),
      createColumn('source', 'varchar(100)'),
      createColumn('medium', 'varchar(100)'),
      createColumn('budget', 'decimal(10,2)', { nullable: true }),
      createColumn('start_date', 'date'),
      createColumn('end_date', 'date', { nullable: true }),
    ],
    indexes: [
      createIndex('campaigns_pkey', ['id'], { isUnique: true, isPrimary: true }),
    ],
    constraints: [
      { name: 'campaigns_pkey', type: 'PRIMARY KEY', columns: ['id'] },
    ],
    rowCount: 45,
    sampleData: [
      { id: 1, name: 'Summer Sale 2026', source: 'google', medium: 'cpc', budget: 5000 },
      { id: 2, name: 'Newsletter Feb', source: 'email', medium: 'newsletter', budget: null },
    ],
  },
};

// Mock query stats for demo mode
export const DEMO_QUERY_STATS: QueryStatsResponse = {
  totalQueries: 1547,
  queriesLastHour: 23,
  queriesLastDay: 312,
  queriesByDatabase: [
    { databaseId: 1, count: 1200 },
    { databaseId: 2, count: 347 },
  ],
  avgExecutionTimeMs: 45,
  successRate: 98.5,
  hourlyData: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    queries: Math.floor(Math.random() * 50) + 10,
    errors: Math.floor(Math.random() * 3),
    avgLatencyMs: Math.floor(Math.random() * 30) + 20,
  })),
};

// Mock saved queries for demo mode - Ecommerce database (id: 1)
export const DEMO_SAVED_QUERIES: SavedQueryDto[] = [
  {
    id: '1',
    databaseId: '1',
    name: 'Get all users',
    sql: 'SELECT * FROM users ORDER BY created_at DESC LIMIT 100',
    description: 'Fetches the 100 most recent users',
    method: 'GET',
    isPublic: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    databaseId: '1',
    name: 'Orders with totals',
    sql: 'SELECT o.id, o.status, o.total_amount, u.email FROM orders o JOIN users u ON o.user_id = u.id',
    description: 'Get orders with user email',
    method: 'GET',
    isPublic: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    databaseId: '1',
    name: 'Product inventory',
    sql: 'SELECT p.name, p.price, i.quantity FROM products p JOIN inventory i ON p.id = i.product_id',
    description: 'Products with current stock levels',
    method: 'GET',
    isPublic: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock saved queries for Analytics database (id: 2)
export const DEMO_ANALYTICS_SAVED_QUERIES: SavedQueryDto[] = [
  {
    id: '101',
    databaseId: '2',
    name: 'Daily page views',
    sql: 'SELECT DATE(viewed_at) as date, COUNT(*) as views FROM page_views GROUP BY date ORDER BY date DESC LIMIT 30',
    description: 'Page views aggregated by day',
    method: 'GET',
    isPublic: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '102',
    databaseId: '2',
    name: 'Top campaigns',
    sql: 'SELECT c.name, COUNT(cv.id) as conversions FROM campaigns c JOIN conversions cv ON c.id = cv.campaign_id GROUP BY c.id ORDER BY conversions DESC',
    description: 'Campaigns ranked by conversion count',
    method: 'GET',
    isPublic: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock query result for demo mode
export const DEMO_QUERY_RESULT: QueryResultDto = {
  success: true,
  columns: ['id', 'email', 'full_name', 'created_at'],
  rows: [
    { id: 1, email: 'john.doe@example.com', full_name: 'John Doe', created_at: '2026-01-15T10:30:00Z' },
    { id: 2, email: 'jane.smith@example.com', full_name: 'Jane Smith', created_at: '2026-01-16T14:22:00Z' },
    { id: 3, email: 'bob.wilson@example.com', full_name: 'Bob Wilson', created_at: '2026-01-17T09:45:00Z' },
    { id: 4, email: 'alice.johnson@example.com', full_name: 'Alice Johnson', created_at: '2026-01-18T16:10:00Z' },
    { id: 5, email: 'charlie.brown@example.com', full_name: 'Charlie Brown', created_at: '2026-01-19T11:55:00Z' },
  ],
  rowCount: 5,
  executionTimeMs: 23,
};

// Mock full schema for ER diagram - Ecommerce database
export const DEMO_FULL_SCHEMA: { tables: TableDetailsDto[]; count: number } = {
  tables: Object.values(DEMO_TABLE_DETAILS),
  count: Object.keys(DEMO_TABLE_DETAILS).length,
};

// Mock full schema for Analytics database
export const DEMO_ANALYTICS_FULL_SCHEMA: { tables: TableDetailsDto[]; count: number } = {
  tables: Object.values(DEMO_ANALYTICS_TABLE_DETAILS),
  count: Object.keys(DEMO_ANALYTICS_TABLE_DETAILS).length,
};

// Helper function to get demo table details based on database ID
export function getDemoTableDetails(tableName: string, databaseId?: number): TableDetailsDto | undefined {
  if (databaseId === 2) {
    return DEMO_ANALYTICS_TABLE_DETAILS[tableName];
  }
  return DEMO_TABLE_DETAILS[tableName];
}

// Helper function to get demo schema objects based on database ID
export function getDemoSchemaObjects(databaseId?: number): SchemaObjectDto[] {
  if (databaseId === 2) {
    return DEMO_ANALYTICS_SCHEMA_OBJECTS;
  }
  return DEMO_SCHEMA_OBJECTS;
}

// Helper function to get demo saved queries based on database ID
export function getDemoSavedQueries(databaseId?: number): SavedQueryDto[] {
  if (databaseId === 2) {
    return DEMO_ANALYTICS_SAVED_QUERIES;
  }
  return DEMO_SAVED_QUERIES;
}

// Helper function to get demo full schema based on database ID
export function getDemoFullSchema(databaseId?: number): { tables: TableDetailsDto[]; count: number } {
  if (databaseId === 2) {
    return DEMO_ANALYTICS_FULL_SCHEMA;
  }
  return DEMO_FULL_SCHEMA;
}

// Helper function to get demo table data based on database ID
export function getDemoTableData(tableName: string, databaseId?: number): QueryResultDto {
  const table = getDemoTableDetails(tableName, databaseId);
  if (!table) {
    return { success: true, columns: [], rows: [], rowCount: 0, executionTimeMs: 0 };
  }

  const columns = table.columns.map(c => c.name);
  const rows = generateMockRows(tableName, columns, 10);
  
  return {
    success: true,
    columns,
    rows,
    rowCount: table.rowCount || rows.length,
    executionTimeMs: Math.floor(Math.random() * 50) + 10,
  };
}

function generateMockRows(_tableName: string, columns: string[], count: number): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  
  for (let i = 1; i <= count; i++) {
    const row: Record<string, unknown> = {};
    columns.forEach(col => {
      if (col === 'id') row[col] = i;
      else if (col.includes('email')) row[col] = `user${i}@example.com`;
      else if (col.includes('name') && !col.includes('user')) row[col] = `Item ${i}`;
      else if (col.includes('full_name')) row[col] = `User ${i}`;
      else if (col.includes('price') || col.includes('amount')) row[col] = (Math.random() * 100 + 10).toFixed(2);
      else if (col.includes('quantity') || col.includes('stock')) row[col] = Math.floor(Math.random() * 100);
      else if (col.includes('_id')) row[col] = Math.floor(Math.random() * 10) + 1;
      else if (col.includes('_at') || col.includes('date')) row[col] = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
      else if (col === 'status') row[col] = ['pending', 'completed', 'shipped'][Math.floor(Math.random() * 3)];
      else if (col === 'rating') row[col] = Math.floor(Math.random() * 5) + 1;
      else row[col] = null;
    });
    rows.push(row);
  }
  
  return rows;
}
