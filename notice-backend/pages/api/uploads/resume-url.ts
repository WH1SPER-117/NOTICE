// pages/api/uploads/resume-url.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyIdTokenFromHeader } from '../../../lib/adminMiddleware';
import { adminBucket } from '../../../lib/firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { uid, user } = await verifyIdTokenFromHeader(req);
    if (!user || user.role !== 'applicant') return res.status(403).json({ error: 'Only applicants can upload resumes' });

    const { filename, contentType } = req.body;
    if (!filename) return res.status(400).json({ error: 'filename required' });

    const safeContentType = contentType || 'application/pdf';
    const destination = `resumes/${uid}/${Date.now()}_${filename}`;
    const file = adminBucket.file(destination);

    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: expiresAt,
      contentType: safeContentType,
    });

    return res.status(200).json({ uploadUrl, path: destination });
  } catch (err: any) {
    console.error('resume-url error', err);
    return res.status(401).json({ error: err.message || 'Unauthorized' });
  }
}
