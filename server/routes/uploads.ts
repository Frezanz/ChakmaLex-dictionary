import { Router } from 'express';
import { getRepoFile, putRepoFile, getRawFileUrl, triggerNetlifyBuildIfConfigured } from './github';

export const uploadsRouter = Router();

uploadsRouter.post('/:kind', async (req, res) => {
  try {
    const kind = req.params.kind as 'audio' | 'image';
    if (!['audio', 'image'].includes(kind)) {
      return res.status(400).json({ success: false, error: 'Invalid kind' });
    }
    const { fileName, contentBase64 } = req.body as { fileName?: string; contentBase64?: string };
    if (!fileName || !contentBase64) {
      return res.status(400).json({ success: false, error: 'fileName and contentBase64 required' });
    }
    const folder = kind === 'audio' ? (process.env.AUDIO_FOLDER_PATH || 'assets/audio') : (process.env.IMAGE_FOLDER_PATH || 'assets/images');
    const path = `${folder}/${fileName}`;

    // Determine content from base64
    const buffer = Buffer.from(contentBase64, 'base64');

    // Ensure parent folder file exists or not needed; GitHub API can create new file directly
    // Create/Update file
    const existing = await getRepoFile(path);
    const resPut = await putRepoFile(path, buffer.toString('base64'), `feat(upload): add ${kind} ${fileName}`, existing.sha || undefined);

    await triggerNetlifyBuildIfConfigured();

    const url = getRawFileUrl(path);
    res.json({ success: true, url });
  } catch (e: any) {
    console.error('Upload failed', e);
    res.status(500).json({ success: false, error: e?.message || 'Upload failed' });
  }
});