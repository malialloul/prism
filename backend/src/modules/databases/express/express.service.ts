// src/modules/databases/express/express.service.ts

import type { GeneratedFile, ApiEndpoint, DatabaseInfo } from '../shared';
import type { ExpressProjectConfig } from './express.types';

/**
 * Convert SQL column type to TypeScript type
 */
function sqlTypeToTsType(sqlType: string): string {
  const type = sqlType.toUpperCase();
  
  if (type.includes('INT') || type.includes('SERIAL') || type.includes('DECIMAL') || 
      type.includes('NUMERIC') || type.includes('FLOAT') || type.includes('DOUBLE') ||
      type.includes('REAL') || type.includes('MONEY')) {
    return 'number';
  }
  if (type.includes('BOOL')) {
    return 'boolean';
  }
  if (type.includes('DATE') || type.includes('TIME') || type.includes('TIMESTAMP')) {
    return 'Date';
  }
  if (type.includes('JSON') || type.includes('JSONB')) {
    return 'any';
  }
  if (type.includes('BYTEA') || type.includes('BLOB') || type.includes('BINARY')) {
    return 'Buffer';
  }
  
  return 'string';
}

/**
 * Convert name to camelCase
 */
function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[_-](.)/g, (_, char) => char.toUpperCase());
}

/**
 * Convert name to PascalCase
 */
function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/**
 * Sanitize name for use as identifier
 */
function sanitizeName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .split(/[\s_-]+/)
    .map((word, i) => i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Generate package.json
 */
function generatePackageJson(config: ExpressProjectConfig, dbInfo: DatabaseInfo): string {
  const dbPackage = dbInfo.engine === 'postgres' ? 'pg' : 'mysql2';
  
  return JSON.stringify({
    name: config.name,
    version: config.version,
    description: config.description,
    main: 'dist/index.js',
    scripts: {
      'build': 'tsc',
      'start': 'node dist/index.js',
      'dev': 'ts-node-dev --respawn src/index.ts',
      'lint': 'eslint src/**/*.ts'
    },
    dependencies: {
      'express': '^4.18.2',
      'cors': '^2.8.5',
      'dotenv': '^16.3.1',
      'helmet': '^7.1.0',
      [dbPackage]: dbInfo.engine === 'postgres' ? '^8.11.3' : '^3.6.5'
    },
    devDependencies: {
      '@types/express': '^4.17.21',
      '@types/cors': '^2.8.17',
      '@types/node': '^20.10.0',
      'typescript': '^5.3.2',
      'ts-node-dev': '^2.0.0',
      '@typescript-eslint/eslint-plugin': '^6.13.0',
      '@typescript-eslint/parser': '^6.13.0',
      'eslint': '^8.54.0'
    },
    engines: {
      node: `>=${config.nodeVersion}`
    }
  }, null, 2);
}

/**
 * Generate tsconfig.json
 */
function generateTsConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      lib: ['ES2020'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist']
  }, null, 2);
}

/**
 * Generate .env.example
 */
function generateEnvExample(dbInfo: DatabaseInfo): string {
  return `# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=${dbInfo.host}
DB_PORT=${dbInfo.port}
DB_NAME=${dbInfo.database}
DB_USER=${dbInfo.username}
DB_PASSWORD=your_password_here

# CORS Configuration (comma-separated origins)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
`;
}

/**
 * Generate .gitignore
 */
function generateGitignore(): string {
  return `# Dependencies
node_modules/

# Build output
dist/

# Environment files
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Coverage
coverage/
`;
}

/**
 * Generate README.md
 */
function generateReadme(config: ExpressProjectConfig, apis: ApiEndpoint[], dbInfo: DatabaseInfo): string {
  const apiList = apis.map(api => `- \`${api.method}\` \`/api/${sanitizeName(api.name)}\` - ${api.description || api.name}`).join('\n');
  
  return `# ${config.name}

${config.description}

## Prerequisites

- Node.js ${config.nodeVersion}+
- ${dbInfo.engine === 'postgres' ? 'PostgreSQL' : 'MySQL'} database

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Copy the environment file and configure:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Update the \`.env\` file with your database credentials.

## Development

Run the development server with hot reload:
\`\`\`bash
npm run dev
\`\`\`

## Production

Build and run:
\`\`\`bash
npm run build
npm start
\`\`\`

## API Endpoints

${apiList}

## Project Structure

\`\`\`
src/
├── index.ts          # Application entry point
├── config/
│   └── database.ts   # Database configuration
├── routes/
│   └── api.routes.ts # API route definitions
└── services/
    └── *.service.ts  # Business logic services
\`\`\`

## Generated by Prism

This project was automatically generated from your custom APIs.
`;
}

/**
 * Generate main index.ts
 */
function generateIndexTs(config: ExpressProjectConfig): string {
  return `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', apiRoutes);

// Error handling
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(\`🚀 ${config.name} running on http://localhost:\${PORT}\`);
  console.log(\`📚 Health check: http://localhost:\${PORT}/health\`);
});
`;
}

/**
 * Generate database config
 */
function generateDatabaseConfig(dbInfo: DatabaseInfo): string {
  if (dbInfo.engine === 'postgres') {
    return `import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Query executed', { text: text.substring(0, 50), duration, rows: res.rowCount });
  return res;
}

export default pool;
`;
  } else {
    return `import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const [rows] = await pool.execute(text, params);
  const duration = Date.now() - start;
  console.log('Query executed', { text: text.substring(0, 50), duration });
  return rows;
}

export default pool;
`;
  }
}

/**
 * Generate service for an API endpoint
 */
function generateService(api: ApiEndpoint, dbInfo: DatabaseInfo): string {
  const serviceName = sanitizeName(api.name);
  const params = api.parameters || [];
  
  // Check if this API has pagination (pagesize and pagecount parameters)
  const hasPagination = params.some(p => p.name === 'pagesize') && params.some(p => p.name === 'pagecount');
  
  // Build parameter interface - include pagecount even though SQL has :offset
  const paramInterface = params.length > 0
    ? `export interface ${toPascalCase(serviceName)}Params {
${params.map(p => `  ${toCamelCase(p.name)}${p.required ? '' : '?'}: ${sqlTypeToTsType(p.columnType)};`).join('\n')}
}

`
    : '';

  // Process SQL - replace :paramName with $1, $2, etc. for postgres or ? for mysql
  let processedSql = api.sql;
  const paramOrder: string[] = [];
  
  // First, handle regular parameters (excluding pagination)
  params.forEach(param => {
    if (param.name === 'pagesize' || param.name === 'pagecount') return; // Handle pagination separately
    const placeholder = `:${param.name}`;
    if (processedSql.includes(placeholder)) {
      paramOrder.push(param.name);
      if (dbInfo.engine === 'postgres') {
        processedSql = processedSql.replace(new RegExp(placeholder, 'g'), `$${paramOrder.length}`);
      } else {
        processedSql = processedSql.replace(new RegExp(placeholder, 'g'), '?');
      }
    }
  });

  // Handle pagination parameters
  if (hasPagination) {
    // :pagesize placeholder
    if (processedSql.includes(':pagesize')) {
      paramOrder.push('pagesize');
      if (dbInfo.engine === 'postgres') {
        processedSql = processedSql.replace(/:pagesize/g, `$${paramOrder.length}`);
      } else {
        processedSql = processedSql.replace(/:pagesize/g, '?');
      }
    }
    // :offset placeholder - will be calculated from pagecount
    if (processedSql.includes(':offset')) {
      paramOrder.push('offset'); // This will be calculated
      if (dbInfo.engine === 'postgres') {
        processedSql = processedSql.replace(/:offset/g, `$${paramOrder.length}`);
      } else {
        processedSql = processedSql.replace(/:offset/g, '?');
      }
    }
  }

  // Build parameter array mapping
  let paramMapping: string;
  if (paramOrder.length > 0) {
    if (hasPagination) {
      // Calculate offset from pagecount and pagesize
      const paramMappings = paramOrder.map(p => {
        if (p === 'offset') {
          return `((input.pagecount || 1) - 1) * (input.pagesize || 100)`;
        }
        return `input.${toCamelCase(p)}`;
      });
      paramMapping = `const params = [${paramMappings.join(', ')}];`;
    } else {
      paramMapping = `const params = [${paramOrder.map(p => `input.${toCamelCase(p)}`).join(', ')}];`;
    }
  } else {
    paramMapping = 'const params: any[] = [];';
  }

  const inputParam = params.length > 0 ? `input: ${toPascalCase(serviceName)}Params` : '';

  return `import { query } from '../config/database';

${paramInterface}export async function ${serviceName}(${inputParam}) {
  const sql = \`${processedSql}\`;
  ${params.length > 0 ? paramMapping : ''}
  
  try {
    const result = await query(sql${params.length > 0 ? ', params' : ''});
    return {
      success: true,
      data: ${dbInfo.engine === 'postgres' ? 'result.rows' : 'result'},
      rowCount: ${dbInfo.engine === 'postgres' ? 'result.rowCount' : 'Array.isArray(result) ? result.length : 0'}
    };
  } catch (error: any) {
    console.error('Error executing ${serviceName}:', error);
    throw new Error(error.message || 'Database query failed');
  }
}
`;
}

/**
 * Generate API routes
 */
function generateApiRoutes(apis: ApiEndpoint[]): string {
  const imports = apis.map(api => {
    const serviceName = sanitizeName(api.name);
    return `import { ${serviceName} } from '../services/${serviceName}.service';`;
  }).join('\n');

  const routes = apis.map(api => {
    const serviceName = sanitizeName(api.name);
    const routePath = `/${serviceName}`;
    const method = api.method.toLowerCase();
    const params = api.parameters || [];
    
    const paramExtraction = params.length > 0
      ? `const params = {
${params.map(p => {
  const camelName = toCamelCase(p.name);
  const source = method === 'get' ? 'req.query' : 'req.body';
  const tsType = sqlTypeToTsType(p.columnType);
  if (tsType === 'number') {
    return `      ${camelName}: ${source}.${camelName} ? Number(${source}.${camelName}) : undefined,`;
  } else if (tsType === 'boolean') {
    return `      ${camelName}: ${source}.${camelName} === 'true' || ${source}.${camelName} === true,`;
  }
  return `      ${camelName}: ${source}.${camelName} as string,`;
}).join('\n')}
    };`
      : '';

    return `
// ${api.description || api.name}
router.${method}('${routePath}', async (req, res) => {
  try {
    ${paramExtraction}
    const result = await ${serviceName}(${params.length > 0 ? 'params' : ''});
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});`;
  }).join('\n');

  return `import { Router } from 'express';
${imports}

const router = Router();
${routes}

export default router;
`;
}

/**
 * Generate ESLint config
 */
function generateEslintConfig(): string {
  return JSON.stringify({
    parser: '@typescript-eslint/parser',
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended'
    ],
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module'
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  }, null, 2);
}

/**
 * Main function to generate Express project
 */
export function generateExpressProject(
  config: ExpressProjectConfig,
  apis: ApiEndpoint[],
  dbInfo: DatabaseInfo
): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  // Root files
  files.push({ path: 'package.json', content: generatePackageJson(config, dbInfo) });
  files.push({ path: 'tsconfig.json', content: generateTsConfig() });
  files.push({ path: '.env.example', content: generateEnvExample(dbInfo) });
  files.push({ path: '.gitignore', content: generateGitignore() });
  files.push({ path: '.eslintrc.json', content: generateEslintConfig() });
  files.push({ path: 'README.md', content: generateReadme(config, apis, dbInfo) });

  // Source files
  files.push({ path: 'src/index.ts', content: generateIndexTs(config) });
  files.push({ path: 'src/config/database.ts', content: generateDatabaseConfig(dbInfo) });
  files.push({ path: 'src/routes/api.routes.ts', content: generateApiRoutes(apis) });

  // Generate service for each API
  apis.forEach(api => {
    const serviceName = sanitizeName(api.name);
    files.push({
      path: `src/services/${serviceName}.service.ts`,
      content: generateService(api, dbInfo)
    });
  });

  return files;
}
