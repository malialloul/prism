/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export interface SharedAccountDto {
  id: number;
  ownerUserId: number;
  ownerEmail: string;
  ownerFullName: string | null;
  sharedWithEmail: string;
  sharedWithUserId: number | null;
  status: 'pending' | 'accepted' | 'revoked';
  tempPassword?: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}
