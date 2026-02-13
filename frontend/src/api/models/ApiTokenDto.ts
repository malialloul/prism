/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export interface ApiTokenDto {
  id: number;
  userId: number;
  name: string;
  tokenPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface CreateApiTokenDto {
  name: string;
  expiresInDays?: number;
}

export interface CreateApiTokenResultDto {
  token: ApiTokenDto;
  plainToken: string;
}

export interface ApiTokensListDto {
  tokens: ApiTokenDto[];
}

export interface RevealApiTokenResultDto {
  plainToken: string;
}
