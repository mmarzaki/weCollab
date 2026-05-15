import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await context.params;
    const info = await redis.hgetall(`project:${projectId}:info`);
    if (!info || !info.id) return NextResponse.json({ error: 'Project tidak ditemukan' }, { status: 404 });
    if (info.status !== 'open') return NextResponse.json({ error: 'Project sudah ditutup' }, { status: 400 });
    if (info.owner_id === userId) return NextResponse.json({ error: 'Kamu adalah pemilik project ini' }, { status: 400 });

    const isMember = await redis.sismember(`project:${projectId}:members`, userId);
    if (isMember) return NextResponse.json({ error: 'Kamu sudah bergabung di project ini' }, { status: 400 });

    const alreadyApplied = await redis.sismember(`project:${projectId}:applicants`, userId);
    if (alreadyApplied) return NextResponse.json({ error: 'Kamu sudah mengirim lamaran ke project ini' }, { status: 400 });

    await redis.sadd(`project:${projectId}:applicants`, userId);
    return NextResponse.json({ message: 'Lamaran berhasil dikirim! Tunggu konfirmasi dari pemilik project.' });
  } catch (error) {
    console.error('[Apply Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await context.params;
    await redis.srem(`project:${projectId}:applicants`, userId);
    return NextResponse.json({ message: 'Lamaran dibatalkan' });
  } catch (error) {
    console.error('[Cancel Apply Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}