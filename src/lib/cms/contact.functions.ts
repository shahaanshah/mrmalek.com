import { createServerFn } from '@tanstack/react-start';
import { redirect } from '@tanstack/react-router';
import { z } from 'zod';
import type { ContactSubmission } from '@/server/repositories/contactRepository.server';

export const contactInquiryInputSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(150, 'Name is too long'),
  email: z.string().trim().email('Please enter a valid email address').max(150),
  phone: z.string().trim().max(50).optional().default(''),
  topic: z.string().trim().max(150).optional().default('General Inquiry'),
  message: z.string().trim().min(2, 'Please include a message or inquiry details').max(5000),
});

export type ContactInquiryInput = z.infer<typeof contactInquiryInputSchema>;

async function requireAdmin(): Promise<{ id: number; email: string }> {
  const { currentAdminId } = await import('@/server/auth/session.server');
  const adminId = await currentAdminId();
  if (!adminId) throw redirect({ to: '/admin/login' });
  const { adminRepository } = await import('@/server/repositories/adminRepository.server');
  const profile = await adminRepository.findById(adminId);
  return { id: adminId, email: profile?.email ?? '' };
}

/** Public submission endpoint invoked from the contact section form. */
export const submitContactInquiry = createServerFn({ method: 'POST' })
  .validator((input: unknown) => contactInquiryInputSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const { contactRepository } = await import('@/server/repositories/contactRepository.server');
      const { id } = await contactRepository.create({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        topic: data.topic || null,
        message: data.message,
      });

      return { ok: true, id };
    } catch (error) {
      console.error('[contact] submitContactInquiry failed:', error);
      throw new Error('Failed to submit message. Please try again.');
    }
  });

/** Admin listing of inquiries with filtering and search. */
export const adminListContactInquiries = createServerFn({ method: 'GET' })
  .validator((input: unknown) =>
    z
      .object({
        status: z.enum(['all', 'unread', 'read', 'archived']).optional(),
        search: z.string().trim().max(120).optional(),
        limit: z.coerce.number().int().positive().max(200).optional(),
        offset: z.coerce.number().int().min(0).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<{ items: ContactSubmission[]; stats: { total: number; unread: number; read: number } }> => {
    await requireAdmin();
    const { contactRepository } = await import('@/server/repositories/contactRepository.server');
    const [items, stats] = await Promise.all([
      contactRepository.list({
        status: data.status,
        search: data.search,
        limit: data.limit ?? 100,
        offset: data.offset ?? 0,
      }),
      contactRepository.stats(),
    ]);
    return { items, stats };
  });

/** Admin update status (mark read, unread, archived). */
export const adminUpdateInquiryStatus = createServerFn({ method: 'POST' })
  .validator((input: unknown) =>
    z
      .object({
        id: z.coerce.number().int().positive(),
        status: z.enum(['unread', 'read', 'archived']),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { contactRepository } = await import('@/server/repositories/contactRepository.server');
    await contactRepository.updateStatus(data.id, data.status);
    return { ok: true };
  });

/** Admin delete inquiry. */
export const adminDeleteContactInquiry = createServerFn({ method: 'POST' })
  .validator((input: unknown) =>
    z
      .object({
        id: z.coerce.number().int().positive(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    const [{ contactRepository }, { activityRepository }] = await Promise.all([
      import('@/server/repositories/contactRepository.server'),
      import('@/server/repositories/activityRepository.server'),
    ]);
    const existing = await contactRepository.findById(data.id);
    await contactRepository.delete(data.id);

    await activityRepository.log({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'delete',
      entityType: 'contact_submission',
      entityId: data.id,
      summary: `Deleted inquiry from ${existing?.name || 'visitor'} (${existing?.email || ''})`,
    });

    return { ok: true };
  });

/** Admin stats summary for overview badge. */
export const adminGetInquiriesStats = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin();
  const { contactRepository } = await import('@/server/repositories/contactRepository.server');
  return contactRepository.stats();
});
