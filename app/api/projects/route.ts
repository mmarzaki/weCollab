import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import redis from '@/lib/redis';
import { getUserFromRequest } from '@/lib/auth';

export async function GET() {
  try {
    // Ambil 20 project terbaru dari Sorted Set (score = timestamp terbalik atau ZREVRANGE)
    const projectIds = await redis.zrevrange('wecollab:active_projects', 0, 19);

    if (projectIds.length === 0) {
      return NextResponse.json({ projects: [] });
    }

    const projects = [];
    for (const id of projectIds) {
      const info = await redis.hgetall(`project:${id}:info`);
      if (info && info.id) {
        // Ambil skills needed
        const skillsNeeded = await redis.smembers(`project:${id}:skills_needed`);
        projects.push({
          id: info.id,
          judul: info.judul,
          deskripsi: info.deskripsi,
          kategori: info.kategori,
          owner_id: info.owner_id,
          created_at: info.created_at,
          skills_needed: skillsNeeded,
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
      return NextResponse.json({ error: 'Judul, deskripsi, dan kategori wajib diisi' }, { status: 400 });
    }

    const projectId = uuidv4();
    const timestamp = Date.now();

    // 1. Simpan info project
    await redis.hset(`project:${projectId}:info`, {
      id: projectId,
      judul,
      deskripsi,
      kategori,
      owner_id: userId,
      created_at: timestamp.toString(),
    });

    // 2. Simpan skills yang dibutuhkan
    const skillList: string[] = Array.isArray(skills_needed) ? skills_needed : [];
    for (const skill of skillList) {
      const normalizedSkill = skill.toLowerCase().trim();
      if (normalizedSkill) {
        await redis.sadd(`project:${projectId}:skills_needed`, normalizedSkill);
      }
    }

    // 3. Tambahkan ke Sorted Set global active projects
    await redis.zadd('wecollab:active_projects', timestamp, projectId);

    // 4. Owner otomatis jadi member
    await redis.sadd(`project:${projectId}:members`, userId);
    await redis.sadd(`user:${userId}:projects`, projectId);

    return NextResponse.json(
      {
        message: 'Project berhasil dibuat',
        project_id: projectId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Create Project Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
