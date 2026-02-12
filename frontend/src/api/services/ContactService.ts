import type { CreateContactDto, SubmitContactResponse } from '../models/ContactDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ContactService {
  /**
   * Submit a contact message (public endpoint)
   * @param requestBody
   * @returns SubmitContactResponse Contact submission result
   * @throws ApiError
   */
  public static submit(
    requestBody: CreateContactDto
  ): CancelablePromise<SubmitContactResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/contact',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
