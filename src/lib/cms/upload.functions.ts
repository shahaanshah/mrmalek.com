import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireAdminSession } from './admin.functions';

const uploadSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().min(1).max(100),
  base64: z.string().min(1),
  usageNote: z.string().max(255).optional(),
  altText: z.string().max(255).optional(),
});

export const adminUploadFile = createServerFn({ method: 'POST' })
  .validator((input: unknown) => uploadSchema.parse(input))
  .handler(async ({ data }) => {
    await requireAdminSession();
    const { saveUploadedFile } = await import('@/server/media/upload.server');
    return await saveUploadedFile(data);
  });
