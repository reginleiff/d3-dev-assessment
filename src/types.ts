import { Request, Response } from 'express';
import Database from './db';

export type Parser = (req: Request) => any[];
export type Handler = (req: Request, res: Response, db: Database) => Promise<void> | void;
export type ResponseHandler = (params: any[], res: Response, db: Database) => Promise<void> | void;
