// src/modules/databases/dotnet/dotnet.controller.ts

import type { Request, Response, NextFunction } from 'express';
import { pool } from '../../../config/db';
import { NotFoundError } from '../../../utils/errors';
import { generateDotNetProject } from './dotnet.service';
import { createZipBuffer } from '../shared';
import type { ApiEndpoint, DatabaseInfo } from '../shared';
import type { DotNetProjectConfig } from './dotnet.types';

/**
 * Convert name to PascalCase for namespace
 */
function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * GET /databases/:id/generate-dotnet
 * Generate and download a .NET project from custom APIs
 */
export const generateDotNetProjectController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: databaseId } = req.params;
    const userId = req.user!.userId;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Get database info
    const dbResult = await pool.query(
      `SELECT * FROM database_connections WHERE id = $1 AND user_id = $2`,
      [databaseId, userId]
    );

    if (dbResult.rowCount === 0) {
      throw new NotFoundError('Database not found');
    }

    const db = dbResult.rows[0];
    
    const dbInfo: DatabaseInfo = {
      engine: db.engine as 'postgres' | 'mysql',
      host: db.host as string,
      port: db.port as number,
      database: db.database as string,
      username: db.username as string,
    };

    // Get saved queries (custom APIs) for this database
    const queriesResult = await pool.query(
      `SELECT id, database_id, name, slug, description, sql, parameters, method, is_public, created_at, updated_at
       FROM saved_queries
       WHERE user_id = $1 AND database_id = $2
       ORDER BY updated_at DESC`,
      [userId, databaseId]
    );

    if (queriesResult.rowCount === 0) {
      res.status(400).json({ 
        success: false, 
        message: 'No custom APIs found for this database. Please create at least one API first.' 
      });
      return;
    }

    // Transform saved queries to API endpoints
    const apis: ApiEndpoint[] = queriesResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      endpoint: `/api/${row.slug || row.id}`,
      method: row.method || 'GET',
      sql: row.sql,
      description: row.description,
      parameters: row.parameters ? JSON.parse(row.parameters) : [],
    }));

    // Generate project name from database name
    const projectName = toPascalCase(db.name) + 'Api';

    // Project configuration
    const projectConfig: DotNetProjectConfig = {
      name: projectName,
      namespace: projectName,
      description: `.NET Core Web API generated from ${db.name} custom APIs`,
      version: '1.0.0',
      dotnetVersion: '8.0',
    };

    // Generate project files
    const files = generateDotNetProject(projectConfig, apis, dbInfo);

    // Create ZIP
    const zipBuffer = await createZipBuffer(files, projectConfig.name);

    // Send ZIP file
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${projectConfig.name}.zip"`);
    res.setHeader('Content-Length', zipBuffer.length);
    res.send(zipBuffer);

  } catch (error) {
    next(error);
  }
};
