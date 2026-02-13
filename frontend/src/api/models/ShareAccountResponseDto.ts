/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SharedAccountDto } from './SharedAccountDto';

export interface ShareAccountResponseDto {
  status: string;
  message: string;
  data: {
    share: SharedAccountDto;
    message: string;
  };
  warning?: string;
}
