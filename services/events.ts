import { EventEmitter } from 'events';

export const eventEmitter = new EventEmitter();

export const Events = {
  BOOK_ADDED: 'BOOK_ADDED',
} as const;