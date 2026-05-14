import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import redis from '@/lib/redis';
import { getUserFromRequest } from '@/lib/auth';

export async function GET() {
  try {
    const projectIds = await redis.zrevrange('wecollab:active_projects', 0, 19);

    if (projectIds.length === 0) {
      return NextResponse.json({ projects: [] });
    }

    const projects = [];
    for (const id of projectIds) {
      const info = await redis.hgetall(`project:${id}:info`);
      if (info && info.id) {
        const [skillsNeeded, memberCount, ownerProfile] = await Promise.all([
          redis.smembers(`project:${id}:skills_needed`),
          redis.scard(`project:${id}:members`),
          redis.hgetall(`user:${info.owner_id}:profile`),
        ]);

        projects.push({
          id: info.id,
          judul: info.judul,
          deskripsi: info.deskripsi,
          kategori: info.kategori,
          status: info.status || 'open',
          owner_id: info.owner_id,
          owner_nama: ownerProfile?.nama || 'Unknown',
          created_at: info.created_at,
          skills_needed: skillsNeeded,
          member_count: memberCount,
        });
      }
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('[Get Projects Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { judul, deskripsi, kategori, skills_needed } = await req.json();

    if (!judul || !deskripsi || !kategori) {
      return NextResponse.json(
        { error: 'Judul, deskripsi, dan kategori wajib diisi' },
        { status: 400 }
      );
    }

    const projectId = uuidv4();
    const timestamp = Date.now();

    // Simpan info project termasuk field status
    await redis.hset(`project:${projectId}:info`, {
      id: projectId,
      judul,
      deskripsi,
      kategori,
      status: 'open',
      owner_id: userId,
      created_at: timestamp.toString(),
    });

    const skillList: string[] = Array.isArray(skills_needed) ? skills_needed : [];
    for (const skill of skillList) {
      const normalizedSkill = skill.toLowerCase().trim();
      if (normalizedSkill) {
        await redis.sadd(`project:${projectId}:skills_needed`, normalizedSkill);
      }
    }

    await redis.zadd('wecollab:active_projects', timestamp, projectId);
    await redis.sadd(`project:${projectId}:members`, userId);
    await redis.sadd(`user:${userId}:projects`, projectId);

    return NextResponse.json(
      { message: 'Project berhasil dibuat', project_id: projectId },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Create Project Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}