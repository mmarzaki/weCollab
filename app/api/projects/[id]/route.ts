import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const info = await redis.hgetall(`project:${id}:info`);
    if (!info || Object.keys(info).length === 0 || !info.id) {
      return NextResponse.json({ error: 'Project tidak ditemukan' }, { status: 404 });
    }

    // Ambil data pendukung — masing-masing aman dari error
    let memberIds: string[] = [];
    let skillsNeeded: string[] = [];
    let ownerProfile: Record<string, string> | null = null;

    try {
      memberIds = await redis.smembers(`project:${id}:members`);
    } catch (_) { memberIds = []; }

    try {
      skillsNeeded = await redis.smembers(`project:${id}:skills_needed`);
    } catch (_) { skillsNeeded = []; }

    if (info.owner_id) {
      try {
        ownerProfile = await redis.hgetall(`user:${info.owner_id}:profile`);
      } catch (_) { ownerProfile = null; }
    }

    // Expand setiap member ID ke profil — skip yang gagal
    const members: Array<{
      id: string;
      nama: string;
      jurusan: string;
      avatar: string;
      skills: string[];
    }> = [];

    for (const memberId of memberIds) {
      try {
        const profile = await redis.hgetall(`user:${memberId}:profile`);
        if (profile && profile.id) {
          members.push({
            id: profile.id,
            nama: profile.nama ?? '',
            jurusan: profile.jurusan ?? '',
            avatar: profile.avatar ?? '',
            skills: profile.skills ? profile.skills.split(',').filter(Boolean) : [],
          });
        }
      } catch (_) {
        // skip member yang error, jangan crash seluruh endpoint
      }
    }

    const ownerNama =
      ownerProfile && ownerProfile.nama ? ownerProfile.nama : 'Unknown';
    const owner =
      ownerProfile && ownerProfile.id
        ? { id: ownerProfile.id, nama: ownerProfile.nama ?? '', avatar: ownerProfile.avatar ?? '' }
        : { id: info.owner_id ?? '', nama: 'Unknown' };

    return NextResponse.json({
      project: {
        id: info.id,
        judul: info.judul ?? '',
        deskripsi: info.deskripsi ?? '',
        kategori: info.kategori ?? '',
        status: info.status ?? 'open',
        created_at: info.created_at ?? '',
        owner_id: info.owner_id ?? '',
        owner_nama: ownerNama,
        owner,
        members,
        member_count: members.length,
        skills_needed: skillsNeeded,
      },
    });
  } catch (error) {
    console.error('[Get Project Detail Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await context.params;

    const info = await redis.hgetall(`project:${projectId}:info`);
    if (!info || !info.id) {
      return NextResponse.json({ error: 'Project tidak ditemukan' }, { status: 404 });
    }

    if (info.owner_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const members = await redis.smembers(`project:${projectId}:members`);
    await Promise.all([
      redis.del(`project:${projectId}:info`),
      redis.del(`project:${projectId}:members`),
      redis.del(`project:${projectId}:skills_needed`),
      redis.zrem('wecollab:active_projects', projectId),
    ]);
    for (const memberId of members) {
      await redis.srem(`user:${memberId}:projects`, projectId);
    }

    return NextResponse.json({ message: 'Project berhasil dihapus' });
  } catch (error) {
    console.error('[Delete Project Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}