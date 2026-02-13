/**
 * App Version Configuration
 * 
 * This file defines version-specific limits and configurations.
 * Each version can have different limits for databases, storage, requests, and APIs.
 */

export interface VersionLimits {
  maxDatabases: number;           // Maximum number of databases per user
  maxStorageMB: number;           // Maximum storage in MB per user
  maxRequestsPerMonth: number;    // Maximum API requests per month
  maxSavedApis: number;           // Maximum saved/custom APIs per user (Build Query)
  maxSavedQueries: number;        // Maximum saved queries per user (Query Editor)
  maxTablesPerDatabase: number;   // Maximum tables per database (0 = unlimited)
  maxSharedAccounts: number;      // Maximum shared accounts per user
  maxApiTokens: number;           // Maximum API tokens per user
}

export interface VersionConfig {
  version: string;
  name: string;
  description: string;
  releaseDate: string;
  isTestingVersion: boolean;
  limits: VersionLimits;
}

// Version configurations - add new versions here
const versions: Record<string, VersionConfig> = {
  'v1': {
    version: 'v1.0.0',
    name: 'Testing Release',
    description: 'Initial testing version with limited features',
    releaseDate: '2026-02-14',
    isTestingVersion: true,
    limits: {
      maxDatabases: 0,             // Unlimited
      maxStorageMB: 0,             // Unlimited
      maxRequestsPerMonth: 0,      // Unlimited
      maxSavedApis: 20,
      maxSavedQueries: 10,
      maxTablesPerDatabase: 0,     // Unlimited
      maxSharedAccounts: 0,        // Disabled for testing
      maxApiTokens: 5,
    },
  },
  'v2': {
    version: 'v2.0.0',
    name: 'General Release',
    description: 'Full release with expanded limits',
    releaseDate: 'TBD',
    isTestingVersion: false,
    limits: {
      maxDatabases: 5,
      maxStorageMB: 1024,         // 1GB
      maxRequestsPerMonth: 10000,
      maxSavedApis: 500,
      maxSavedQueries: 100,
      maxTablesPerDatabase: 200,  // 200 tables total
      maxSharedAccounts: 10,
      maxApiTokens: 20,
    },
  },
};

// Current active version - change this to switch versions
const CURRENT_VERSION = process.env.APP_VERSION || 'v1';

// Get current version config
export const currentVersionConfig = versions[CURRENT_VERSION] || versions['v1'];

// Export current limits for easy access
export const limits = currentVersionConfig.limits;

// Get version info
export const getVersionInfo = () => ({
  version: currentVersionConfig.version,
  name: currentVersionConfig.name,
  description: currentVersionConfig.description,
  releaseDate: currentVersionConfig.releaseDate,
  isTestingVersion: currentVersionConfig.isTestingVersion,
});

// Get all version configs (for admin purposes)
export const getAllVersions = () => versions;

// Check if a specific feature is available in current version
export const isFeatureAvailable = (feature: keyof VersionLimits): boolean => {
  const limit = limits[feature];
  return limit !== 0;
};

// Format limit for display
export const formatLimit = (limitKey: keyof VersionLimits): string => {
  const value = limits[limitKey];
  if (value === 0) return 'Unlimited';
  if (limitKey === 'maxStorageMB') {
    return value >= 1024 ? `${(value / 1024).toFixed(1)}GB` : `${value}MB`;
  }
  if (limitKey === 'maxRequestsPerMonth') {
    return value >= 1000 ? `${(value / 1000).toFixed(0)}K/month` : `${value}/month`;
  }
  return value.toString();
};

export default currentVersionConfig;
