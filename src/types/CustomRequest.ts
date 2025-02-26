import { Request } from 'express'

type CustomRequest = Request & {
    userId?: string;
}

export default CustomRequest;