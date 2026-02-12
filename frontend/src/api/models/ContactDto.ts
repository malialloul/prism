export interface ContactDto {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'read' | 'replied';
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactDto {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface SubmitContactResponse {
  message: string;
  contact: ContactDto;
}
