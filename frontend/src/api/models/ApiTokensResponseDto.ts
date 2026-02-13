/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApiTokensListDto } from './ApiTokenDto';

export interface ApiTokensResponseDto {
  status: string;
  message: string;
  data: ApiTokensListDto;
}
