// src/modules/databases/springboot/springboot.controller.ts

import type { Request, Response, NextFunction } from 'express';
import { pool } from '../../../config/db';
import { config } from '../../../config/env';
import { NotFoundError } from '../../../utils/errors';
import { generateSpringBootProject, createZipBuffer } from './springboot.service';
import type { ApiEndpoint, DatabaseInfo, SpringBootProjectConfig } from './springboot.types';
import crypto from 'crypto';

// Encryption helpers
const ENCRYPTION_KEY = crypto.scryptSync(String(config.jwt.secret), 'salt', 32);

function decrypt(text: string): string {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * GET /databases/:id/generate-spring-boot
 * Generate and download a Spring Boot project from custom APIs
 */
export const generateSpringBootProjectController = async (
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
      endpoint: `/databases/${row.database_id}/custom-api/${row.slug || row.id}`,
      method: row.method || 'GET',
      sql: row.sql,
      description: row.description,
      parameters: row.parameters ? JSON.parse(row.parameters) : [],
    }));

    // Generate project name from database name
    const projectName = db.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Project configuration
    const projectConfig: SpringBootProjectConfig = {
      groupId: 'com.prism.generated',
      artifactId: projectName + '-api',
      name: db.name + ' API',
      description: `Spring Boot REST API generated from ${db.name} custom APIs`,
      packageName: 'com.prism.generated.' + projectName.replace(/-/g, ''),
      javaVersion: '17',
      springBootVersion: '3.2.0',
    };

    // Generate project files
    const files = generateSpringBootProject(projectConfig, apis, dbInfo);

    // Create ZIP
    const zipBuffer = await createZipBuffer(files, projectConfig.artifactId);

    // Send ZIP file
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${projectConfig.artifactId}.zip"`);
    res.setHeader('Content-Length', zipBuffer.length);
    res.send(zipBuffer);

  } catch (error) {
    next(error);
  }
};
