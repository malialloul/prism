/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SharePermissions } from './SharedAccountDto';

export interface ShareAccountDto {
  email: string;
  expiresInDays?: number;
  permissions?: Partial<SharePermissions>;
}
