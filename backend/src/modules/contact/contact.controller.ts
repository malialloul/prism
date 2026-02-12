import type { Request, Response, NextFunction } from 'express';
import * as contactService from './contact.service';
import type { CreateContactDto } from './contact.types';

export const submitContact = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: CreateContactDto = req.body;
    
    // Basic validation
    if (!data.name || !data.email || !data.subject || !data.message) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      res.status(400).json({ error: 'Invalid email address' });
      return;
    }

    const contact = await contactService.createContact(data);
    res.status(201).json({ message: 'Message sent successfully', contact });
  } catch (error) {
    next(error);
  }
};

export const getContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const contacts = await contactService.getAllContacts();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    
    if (!['pending', 'read', 'replied'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const contact = await contactService.updateContactStatus(parseInt(id, 10), status);
    if (!contact) {
      res.status(404).json({ error: 'Contact message not found' });
      return;
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
};
