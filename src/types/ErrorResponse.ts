import MessageResponse from './MessageResponse';

type ErrorResponse = MessageResponse & {
  stack?: string;
}

export default ErrorResponse;