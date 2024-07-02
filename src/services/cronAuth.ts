import jwt from 'jsonwebtoken';

export const authToken = jwt.sign({ id: 'system' }, process.env.JWT_SECRET as string, { expiresIn: '1d' });