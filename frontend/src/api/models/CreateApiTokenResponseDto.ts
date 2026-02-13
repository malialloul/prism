/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CreateApiTokenResultDto } from './ApiTokenDto';

export interface CreateApiTokenResponseDto {
  status: string;
  message: string;
  data: CreateApiTokenResultDto;
}
