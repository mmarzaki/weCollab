import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await context.params;
    const info = await redis.hgetall(`project:${projectId}:info`);
    if (!info || !info.id) return NextResponse.json({ error: 'Project tidak ditemukan' }, { status: 404 });
    if (info.owner_id !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const applicantIds = await redis.smembers(`project:${projectId}:applicants`);
    const applicants = [];
    for (const applicantId of applicantIds) {
      const profile = await redis.hgetall(`user:${applicantId}:profile`);
      if (profile && profile.id) {
        applicants.push({
          id: profile.id, nama: profile.nama, email: profile.email,
          jurusan: profile.jurusan || '', rumpun: profile.rumpun || '',
          bio: profile.bio, skills: profile.skills ? profile.skills.split(',').filter(Boolean) : [],
          avatar: profile.avatar,
        });
      }
    }
    return NextResponse.json({ applicants });
  } catch (error) {
    console.error('[Get Applications Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const ownerId = await getUserFromRequest(req);
    if (!ownerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await context.params;
    const { applicantId, action } = await req.json();

    if (!applicantId || !['accept', 'reject'].includes(action))
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });

    const info = await redis.hgetall(`project:${projectId}:info`);
    if (!info || !info.id) return NextResponse.json({ error: 'Project tidak ditemukan' }, { status: 404 });
    if (info.owner_id !== ownerId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const isApplicant = await redis.sismember(`project:${projectId}:applicants`, applicantId);
    if (!isApplicant) return NextResponse.json({ error: 'Pelamar tidak ditemukan' }, { status: 404 });

    await redis.srem(`project:${projectId}:applicants`, applicantId);

    if (action === 'accept') {
      await redis.sadd(`project:${projectId}:members`, applicantId);
      await redis.sadd(`user:${applicantId}:projects`, projectId);
      await redis.sadd(`project:${projectId}:accepted`, applicantId);
    }

    return NextResponse.json({
      message: action === 'accept' ? 'Lamaran diterima! Pelamar kini bisa melihat kontak kamu.' : 'Lamaran ditolak.',
    });
  } catch (error) {
    console.error('[Respond Application Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}