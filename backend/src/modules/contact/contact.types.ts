export interface ContactDto {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'read' | 'replied';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContactDto {
  name: string;
  email: string;
  subject: string;
  message: string;
}
