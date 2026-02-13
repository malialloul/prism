/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateApiTokenDto } from '../models/ApiTokenDto';
import type { ApiTokensResponseDto } from '../models/ApiTokensResponseDto';
import type { CreateApiTokenResponseDto } from '../models/CreateApiTokenResponseDto';
import type { RevealApiTokenResponseDto } from '../models/RevealApiTokenResponseDto';
import type { PasswordActionResponseDto } from '../models/PasswordActionResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ApiTokenService {
  /**
   * Get all API tokens for the current user
   * @returns ApiTokensResponseDto API tokens list
   * @throws ApiError
   */
  public static getApiTokens(): CancelablePromise<ApiTokensResponseDto> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/auth/api-tokens',
      errors: {
        401: `Unauthorized`,
      },
    });
  }

  /**
   * Create a new API token
   * @param requestBody
   * @returns CreateApiTokenResponseDto API token created successfully
   * @throws ApiError
   */
  public static createApiToken(
    requestBody: CreateApiTokenDto,
  ): CancelablePromise<CreateApiTokenResponseDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/auth/api-tokens',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Validation error`,
        401: `Unauthorized`,
      },
    });
  }

  /**
   * Reveal an API token (get plain text)
   * @param tokenId
   * @returns RevealApiTokenResponseDto Token revealed successfully
   * @throws ApiError
   */
  public static revealApiToken(
    tokenId: number,
  ): CancelablePromise<RevealApiTokenResponseDto> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/auth/api-tokens/{tokenId}/reveal',
      path: { tokenId },
      errors: {
        401: `Unauthorized`,
        404: `API token not found`,
      },
    });
  }

  /**
   * Revoke an API token
   * @param tokenId
   * @returns PasswordActionResponseDto API token revoked successfully
   * @throws ApiError
   */
  public static revokeApiToken(
    tokenId: number,
  ): CancelablePromise<PasswordActionResponseDto> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/auth/api-tokens/{tokenId}',
      path: { tokenId },
      errors: {
        401: `Unauthorized`,
        404: `API token not found`,
      },
    });
  }
}
