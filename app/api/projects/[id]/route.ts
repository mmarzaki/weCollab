import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const info = await redis.hgetall(`project:${id}:info`);
    if (!info || !info.id) {
      return NextResponse.json({ error: 'Project tidak ditemukan' }, { status: 404 });
    }

    const members = await redis.smembers(`project:${id}:members`);
    const skillsNeeded = await redis.smembers(`project:${id}:skills_needed`);

    // (Opsional) Ambil detail owner
    const owner = await redis.hgetall(`user:${info.owner_id}:profile`);

    return NextResponse.json({
      id: info.id,
      judul: info.judul,
      deskripsi: info.deskripsi,
      kategori: info.kategori,
      created_at: info.created_at,
      owner: owner && owner.id ? { id: owner.id, nama: owner.nama, avatar: owner.avatar } : { id: info.owner_id },
      members,
      skills_needed: skillsNeeded,
    });
  } catch (error) {
    console.error('[Get Project Detail Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;

    const info = await redis.hgetall(`project:${projectId}:info`);
    if (!info || !info.id) {
      return NextResponse.json({ error: 'Project tidak ditemukan' }, { status: 404 });
    }

    if (info.owner_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Hapus info
    await redis.del(`project:${projectId}:info`);
    // 2. Hapus members
    const members = await redis.smembers(`project:${projectId}:members`);
    await redis.del(`project:${projectId}:members`);
    for (const memberId of members) {
      await redis.srem(`user:${memberId}:projects`, projectId);
    }
    // 3. Hapus skills needed
    await redis.del(`project:${projectId}:skills_needed`);
    // 4. Hapus dari active projects
    await redis.zrem('wecollab:active_projects', projectId);

    return NextResponse.json({ message: 'Project berhasil dihapus' });
  } catch (error) {
    console.error('[Delete Project Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
