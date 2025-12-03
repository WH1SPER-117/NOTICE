// lib/adminMiddleware.ts
import type { NextApiRequest } from 'next';
import { adminAuth, adminDb } from './firebaseAdmin';

export async function verifyIdTokenFromHeader(req: NextApiRequest) {
  const header = req.headers.authorization || '';
  const token = header.toString().replace('Bearer ', '').trim();
  if (!token) throw new Error('No token provided');

  const decoded = await adminAuth.verifyIdToken(token);
  const userSnap = await adminDb.collection('users').doc(decoded.uid).get();
  const user = userSnap.exists ? userSnap.data() : null;
  return { uid: decoded.uid, token: decoded, user };
}
