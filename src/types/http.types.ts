import type { Request } from 'express'

// REQUESTS -----------------------------------

export type CustomRequest = Request & {
  userId?: string;
}

// RESPONSES -----------------------------------

export type MessageResponse = {
  message: string;
}

export type ErrorResponse = MessageResponse & {
  stack?: string;
}