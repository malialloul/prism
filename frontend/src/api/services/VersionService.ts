/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export interface VersionLimits {
  maxDatabases: number;
  maxStorageMB: number;
  maxRequestsPerMonth: number;
  maxSavedApis: number;
  maxTablesPerDatabase: number;
  maxSharedAccounts: number;
  maxApiTokens: number;
}

export interface UserUsage {
  databases: number;
  storageMB: number;
  requestsThisMonth: number;
  savedApis: number;
  tables: number;
  sharedAccounts: number;
  apiTokens: number;
}

export interface VersionLimitsResponseDto {
  status: string;
  message: string;
  data: {
    version: string;
    versionName: string;
    limits: VersionLimits;
    usage: UserUsage;
  };
}

export class VersionService {
  /**
   * Get current version info and user's limits/usage
   * @returns VersionLimitsResponseDto Version and limits data
   * @throws ApiError
   */
  public static getVersionLimits(): CancelablePromise<VersionLimitsResponseDto> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/auth/version',
      errors: {
        401: `Unauthorized`,
      },
    });
  }
}
