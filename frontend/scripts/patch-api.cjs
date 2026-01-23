/**
 * Post-generate script to patch OpenAPI generated files
 * Replaces default axios with httpClient in request.ts
 */
const fs = require('fs');
const path = require('path');

const REQUEST_FILE = path.join(__dirname, '../src/api/core/request.ts');

function patchRequestFile() {
  let content = fs.readFileSync(REQUEST_FILE, 'utf8');

  // Add httpClient import
  content = content.replace(
    /import type \{ AxiosError, AxiosRequestConfig, AxiosResponse, AxiosInstance \} from 'axios';/,
    `import type { AxiosError, AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';\nimport { httpClient } from '../httpClient';`
  );

  // Replace axiosClient: AxiosInstance = axios with just using httpClient
  content = content.replace(
    /export const request = <T>\(config: OpenAPIConfig, options: ApiRequestOptions, axiosClient: AxiosInstance = axios\)/,
    'export const request = <T>(config: OpenAPIConfig, options: ApiRequestOptions)'
  );

  // Replace axiosClient usage with httpClient
  content = content.replace(
    /const response = await sendRequest<T>\(config, options, url, body, formData, headers, onCancel, axiosClient\);/,
    'const response = await sendRequest<T>(config, options, url, body, formData, headers, onCancel, httpClient);'
  );

  fs.writeFileSync(REQUEST_FILE, content, 'utf8');
  console.log('✓ Patched request.ts to use httpClient');
}

patchRequestFile();
