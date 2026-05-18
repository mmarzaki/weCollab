import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Pastikan project ada
    const exists = await redis.exists(`project:${projectId}:info`);
    if (!exists) {
      return NextResponse.json({ error: 'Project tidak ditemukan' }, { status: 404 });
    }

    // Pastikan user belum join
    const isMember = await redis.sismember(`project:${projectId}:members`, userId);
    if (isMember) {
      return NextResponse.json({ error: 'Anda sudah bergabung di project ini' }, { status: 400 });
    }

    // Tambahkan user ke set members project
    await redis.sadd(`project:${projectId}:members`, userId);
    // Tambahkan project ke set projects user
    await redis.sadd(`user:${userId}:projects`, projectId);

    return NextResponse.json({ message: 'Berhasil bergabung dengan project' });
  } catch (error) {
    console.error('[Join Project Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
