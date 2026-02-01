/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SharedAccountDto } from './SharedAccountDto';

export interface SharedAccountsResponseDto {
  status: string;
  message: string;
  data: {
    sharedByMe: SharedAccountDto[];
    sharedWithMe: SharedAccountDto[];
  };
}
