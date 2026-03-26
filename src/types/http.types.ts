import type { Request } from 'express'

// REQUESTS -----------------------------------

export type CustomRequest = Request;

// RESPONSES -----------------------------------

export type MessageResponse = {
  message: string;
}

export type ErrorResponse = MessageResponse & {
  stack?: string;
}
