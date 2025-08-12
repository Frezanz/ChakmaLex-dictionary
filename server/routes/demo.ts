import { Request, Response } from 'express';

export function handleDemo(_req: Request, res: Response) {
  res.json({ message: 'hello from demo' });
}
