/**
 * Limits Service
 * 
 * Service to check and enforce version-specific limits for users.
 */

import { pool } from '../config/db';
import { limits, currentVersionConfig, formatLimit, VersionLimits } from '../config/version';
import { ValidationError } from '../utils/errors';

export interface UserUsage {
  databases: number;
  storageMB: number;
  requestsThisMonth: number;
  savedApis: number;
  savedQueries: number;
  tables: number;
  sharedAccounts: number;
  apiTokens: number;
}

export interface LimitCheckResult {
  allowed: boolean;
  currentUsage: number;
  limit: number;
  limitFormatted: string;
  message?: string;
}

export interface EnforceLimitResult {
  warning?: string;
}

/**
 * Get current usage for a user
 */
export const getUserUsage = async (userId: string): Promise<UserUsage> => {
  // Get database count
  const dbResult = await pool.query(
    'SELECT COUNT(*) as count FROM database_connections WHERE user_id = $1',
    [userId]
  );
  const databases = parseInt(dbResult.rows[0].count, 10);

  // Get total storage (sum of all database storage bytes)
  const storageResult = await pool.query(
    'SELECT COALESCE(SUM(storage_bytes), 0) as total FROM database_connections WHERE user_id = $1',
    [userId]
  );
  const storageMB = Math.ceil(parseInt(storageResult.rows[0].total, 10) / (1024 * 1024));

  // Get requests this month from query_execution_logs
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  let requestsThisMonth = 0;
  try {
    const requestsResult = await pool.query(
      `SELECT COUNT(*) as count FROM query_execution_logs 
       WHERE user_id = $1 AND created_at >= $2`,
      [userId, startOfMonth]
    );
    requestsThisMonth = parseInt(requestsResult.rows[0].count, 10);
  } catch {
    // Table may not exist yet, default to 0
    requestsThisMonth = 0;
  }

  // Get saved APIs count (from Build Query page)
  const apisResult = await pool.query(
    `SELECT COUNT(*) as count FROM saved_queries WHERE user_id = $1 AND (save_type = 'api' OR save_type IS NULL)`,
    [userId]
  );
  const savedApis = parseInt(apisResult.rows[0].count, 10);

  // Get saved queries count (from Query Editor page)
  const queriesResult = await pool.query(
    `SELECT COUNT(*) as count FROM saved_queries WHERE user_id = $1 AND save_type = 'query'`,
    [userId]
  );
  const savedQueries = parseInt(queriesResult.rows[0].count, 10);

  // Get shared accounts count
  const sharedResult = await pool.query(
    `SELECT COUNT(*) as count FROM shared_accounts 
     WHERE owner_user_id = $1 AND status IN ('pending', 'accepted')`,
    [userId]
  );
  const sharedAccounts = parseInt(sharedResult.rows[0].count, 10);

  // Get API tokens count
  const tokensResult = await pool.query(
    'SELECT COUNT(*) as count FROM api_tokens WHERE user_id = $1 AND revoked_at IS NULL',
    [userId]
  );
  const apiTokens = parseInt(tokensResult.rows[0].count, 10);

  // Get total tables count across all databases
  const tablesResult = await pool.query(
    'SELECT COALESCE(SUM(tables), 0) as total FROM database_connections WHERE user_id = $1',
    [userId]
  );
  const tables = parseInt(tablesResult.rows[0].total, 10);

  return {
    databases,
    storageMB,
    requestsThisMonth,
    savedApis,
    savedQueries,
    tables,
    sharedAccounts,
    apiTokens,
  };
};

/**
 * Check if user can create a new database
 */
export const canCreateDatabase = async (userId: string): Promise<LimitCheckResult> => {
  const usage = await getUserUsage(userId);
  const allowed = limits.maxDatabases === 0 || usage.databases < limits.maxDatabases;
  
  return {
    allowed,
    currentUsage: usage.databases,
    limit: limits.maxDatabases,
    limitFormatted: formatLimit('maxDatabases'),
    message: allowed ? undefined : `Database limit reached. Maximum ${limits.maxDatabases} database(s) allowed in ${currentVersionConfig.name}.`,
  };
};

/**
 * Check if user can save a new API
 */
export const canSaveApi = async (userId: string): Promise<LimitCheckResult> => {
  const usage = await getUserUsage(userId);
  const allowed = limits.maxSavedApis === 0 || usage.savedApis < limits.maxSavedApis;
  
  return {
    allowed,
    currentUsage: usage.savedApis,
    limit: limits.maxSavedApis,
    limitFormatted: formatLimit('maxSavedApis'),
    message: allowed ? undefined : `You've reached your saved API limit (${usage.savedApis}/${limits.maxSavedApis}). [View Limits](/limits)`,
  };
};

/**
 * Check if user can make more requests
 */
export const canMakeRequest = async (userId: string): Promise<LimitCheckResult> => {
  const usage = await getUserUsage(userId);
  const allowed = limits.maxRequestsPerMonth === 0 || usage.requestsThisMonth < limits.maxRequestsPerMonth;
  
  return {
    allowed,
    currentUsage: usage.requestsThisMonth,
    limit: limits.maxRequestsPerMonth,
    limitFormatted: formatLimit('maxRequestsPerMonth'),
    message: allowed ? undefined : `Monthly request limit reached. Maximum ${limits.maxRequestsPerMonth} requests allowed in ${currentVersionConfig.name}.`,
  };
};

/**
 * Check if user can create a shared account
 */
export const canCreateSharedAccount = async (userId: string): Promise<LimitCheckResult> => {
  const usage = await getUserUsage(userId);
  const allowed = limits.maxSharedAccounts === 0 || usage.sharedAccounts < limits.maxSharedAccounts;
  
  // Special case: if limit is 0, feature is disabled
  if (limits.maxSharedAccounts === 0) {
    return {
      allowed: false,
      currentUsage: usage.sharedAccounts,
      limit: limits.maxSharedAccounts,
      limitFormatted: 'Disabled',
      message: `Account sharing is not available in ${currentVersionConfig.name}.`,
    };
  }
  
  return {
    allowed,
    currentUsage: usage.sharedAccounts,
    limit: limits.maxSharedAccounts,
    limitFormatted: formatLimit('maxSharedAccounts'),
    message: allowed ? undefined : `Shared account limit reached. Maximum ${limits.maxSharedAccounts} shared accounts allowed in ${currentVersionConfig.name}.`,
  };
};

/**
 * Check if user can create an API token
 */
export const canCreateApiToken = async (userId: string): Promise<LimitCheckResult> => {
  const usage = await getUserUsage(userId);
  const allowed = limits.maxApiTokens === 0 || usage.apiTokens < limits.maxApiTokens;
  
  return {
    allowed,
    currentUsage: usage.apiTokens,
    limit: limits.maxApiTokens,
    limitFormatted: formatLimit('maxApiTokens'),
    message: allowed ? undefined : `You've reached your API token limit (${usage.apiTokens}/${limits.maxApiTokens}). [View Limits](/limits)`,
  };
};

/**
 * Check storage limit
 */
export const canUseStorage = async (userId: string, additionalMB: number = 0): Promise<LimitCheckResult> => {
  const usage = await getUserUsage(userId);
  const totalUsage = usage.storageMB + additionalMB;
  const allowed = limits.maxStorageMB === 0 || totalUsage <= limits.maxStorageMB;
  
  return {
    allowed,
    currentUsage: usage.storageMB,
    limit: limits.maxStorageMB,
    limitFormatted: formatLimit('maxStorageMB'),
    message: allowed ? undefined : `Storage limit reached. Maximum ${formatLimit('maxStorageMB')} allowed in ${currentVersionConfig.name}.`,
  };
};

/**
 * Enforce database creation limit - throws if limit exceeded
 * Returns warning if this action reaches the limit
 */
export const enforceCreateDatabaseLimit = async (userId: string): Promise<EnforceLimitResult> => {
  const check = await canCreateDatabase(userId);
  if (!check.allowed) {
    throw new ValidationError(check.message || 'Database limit reached');
  }
  
  // Check if this action will reach the limit
  const willReachLimit = check.limit > 0 && (check.currentUsage + 1) >= check.limit;
  return {
    warning: willReachLimit ? `You've reached your database limit (${check.currentUsage + 1}/${check.limit}). [View Limits](/limits)` : undefined,
  };
};

/**
 * Enforce API save limit - throws if limit exceeded
 * Returns warning if this action reaches the limit
 */
export const enforceSaveApiLimit = async (userId: string): Promise<EnforceLimitResult> => {
  const check = await canSaveApi(userId);
  if (!check.allowed) {
    throw new ValidationError(check.message || 'API limit reached');
  }
  
  const willReachLimit = check.limit > 0 && (check.currentUsage + 1) >= check.limit;
  return {
    warning: willReachLimit ? `You've reached your saved API limit (${check.currentUsage + 1}/${check.limit}). [View Limits](/limits)` : undefined,
  };
};

/**
 * Enforce request limit - throws if limit exceeded
 * Returns warning if this action reaches the limit
 */
export const enforceRequestLimit = async (userId: string): Promise<EnforceLimitResult> => {
  const check = await canMakeRequest(userId);
  if (!check.allowed) {
    throw new ValidationError(check.message || 'Request limit reached');
  }
  
  const willReachLimit = check.limit > 0 && (check.currentUsage + 1) >= check.limit;
  return {
    warning: willReachLimit ? `You've reached your monthly request limit (${check.currentUsage + 1}/${check.limit}). [View Limits](/limits)` : undefined,
  };
};

/**
 * Enforce shared account limit - throws if limit exceeded
 * Returns warning if this action reaches the limit
 */
export const enforceSharedAccountLimit = async (userId: string): Promise<EnforceLimitResult> => {
  const check = await canCreateSharedAccount(userId);
  if (!check.allowed) {
    throw new ValidationError(check.message || 'Shared account limit reached');
  }
  
  const willReachLimit = check.limit > 0 && (check.currentUsage + 1) >= check.limit;
  return {
    warning: willReachLimit ? `You've reached your shared account limit (${check.currentUsage + 1}/${check.limit}). [View Limits](/limits)` : undefined,
  };
};

/**
 * Enforce API token limit - throws if limit exceeded
 * Returns warning if this action reaches the limit
 */
export const enforceApiTokenLimit = async (userId: string): Promise<EnforceLimitResult> => {
  const check = await canCreateApiToken(userId);
  if (!check.allowed) {
    throw new ValidationError(check.message || 'API token limit reached');
  }
  
  const willReachLimit = check.limit > 0 && (check.currentUsage + 1) >= check.limit;
  return {
    warning: willReachLimit ? `You've reached your API token limit (${check.currentUsage + 1}/${check.limit}). [View Limits](/limits)` : undefined,
  };
};

/**
 * Check if user can save a query (Query Editor)
 */
export const canSaveQuery = async (userId: string): Promise<LimitCheckResult> => {
  const usage = await getUserUsage(userId);
  const allowed = limits.maxSavedQueries === 0 || usage.savedQueries < limits.maxSavedQueries;
  
  return {
    allowed,
    currentUsage: usage.savedQueries,
    limit: limits.maxSavedQueries,
    limitFormatted: formatLimit('maxSavedQueries'),
    message: allowed ? undefined : `You've reached your saved query limit (${usage.savedQueries}/${limits.maxSavedQueries}). [View Limits](/limits)`,
  };
};

/**
 * Enforce saved query limit - throws if limit exceeded
 * Returns warning if this action reaches the limit
 */
export const enforceSaveQueryLimit = async (userId: string): Promise<EnforceLimitResult> => {
  const check = await canSaveQuery(userId);
  if (!check.allowed) {
    throw new ValidationError(check.message || 'Saved query limit reached');
  }
  
  const willReachLimit = check.limit > 0 && (check.currentUsage + 1) >= check.limit;
  return {
    warning: willReachLimit ? `You've reached your saved query limit (${check.currentUsage + 1}/${check.limit}). [View Limits](/limits)` : undefined,
  };
};

/**
 * Get all limits and current usage for a user
 */
export const getUserLimitsAndUsage = async (userId: string) => {
  const usage = await getUserUsage(userId);
  
  return {
    version: currentVersionConfig.version,
    versionName: currentVersionConfig.name,
    limits: {
      maxDatabases: limits.maxDatabases,
      maxStorageMB: limits.maxStorageMB,
      maxRequestsPerMonth: limits.maxRequestsPerMonth,
      maxSavedApis: limits.maxSavedApis,
      maxSavedQueries: limits.maxSavedQueries,
      maxTablesPerDatabase: limits.maxTablesPerDatabase,
      maxSharedAccounts: limits.maxSharedAccounts,
      maxApiTokens: limits.maxApiTokens,
    },
    usage: {
      databases: usage.databases,
      storageMB: usage.storageMB,
      requestsThisMonth: usage.requestsThisMonth,
      savedApis: usage.savedApis,
      savedQueries: usage.savedQueries,
      tables: usage.tables,
      sharedAccounts: usage.sharedAccounts,
      apiTokens: usage.apiTokens,
    },
  };
};
