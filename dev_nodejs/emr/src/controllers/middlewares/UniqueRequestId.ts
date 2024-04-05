import { NextFunction, Request, Response } from 'express';
const uuidv1 = require('uuid/v1');

let count = (new Date).getTime() % 1000;

export const UniqueRequestId = async function(req: Request, res: Response, next: NextFunction) {
    const nextDigit = count; count = (count + 1) % 1000;
    req.headers["id"] = uuidv1() + "-" + nextDigit;

    next()
};