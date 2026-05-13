import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await redis.hgetall(`user:${userId}:profile`);
    if (!profile || !profile.id) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    const userProjects = await redis.smembers(`user:${userId}:projects`);

    return NextResponse.json({
      id: profile.id,
      nama: profile.nama,
      email: profile.email,
      jurusan: profile.jurusan,
      bio: profile.bio,
      skills: profile.skills ? profile.skills.split(',').filter(Boolean) : [],
      avatar: profile.avatar,
      projects: userProjects,
    });
  } catch (error) {
    console.error('[Get Me Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nama, jurusan, bio, skills } = await req.json();

    const existingProfile = await redis.hgetall(`user:${userId}:profile`);
    if (!existingProfile || !existingProfile.id) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    const skillList: string[] = Array.isArray(skills)
      ? skills.map((s: string) => s.toLowerCase().trim())
      : [];

    // Update profil di Hash
    await redis.hset(`user:${userId}:profile`, {
      ...existingProfile,
      nama: nama || existingProfile.nama,
      jurusan: jurusan || existingProfile.jurusan,
      bio: bio ?? existingProfile.bio,
      skills: skillList.join(','),
    });

    // Update index skills
    // 1. Hapus user dari semua skill lama (opsional, jika kita track, tapi untuk simpelnya kita update di sini)
    // Sebaiknya, kita ambil skill lama, hitung selisih, tapi untuk kemudahan kita asumsikan skill lama ada di existingProfile.skills
    const oldSkills = existingProfile.skills ? existingProfile.skills.split(',') : [];
    for (const old of oldSkills) {
      if (old && !skillList.includes(old)) {
        await redis.srem(`skill:${old}:users`, userId);
      }
    }
    // 2. Tambah ke skill baru
    for (const skill of skillList) {
      if (skill) {
        await redis.sadd(`skill:${skill}:users`, userId);
      }
    }

    return NextResponse.json({ message: 'Profil berhasil diperbarui' });
  } catch (error) {
    console.error('[Update Me Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
