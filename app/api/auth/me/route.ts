import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await redis.hgetall(`user:${userId}:profile`);
    if (!profile || !profile.id) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });

    const projectIds = await redis.smembers(`user:${userId}:projects`);

    return NextResponse.json({
      user: {
        id: profile.id,
        nama: profile.nama,
        email: profile.email,
        jurusan: profile.jurusan || '',
        rumpun: profile.rumpun || '',
        bio: profile.bio,
        skills: profile.skills ? profile.skills.split(',').filter(Boolean) : [],
        avatar: profile.avatar,
        projectIds,
      },
    });
  } catch (error) {
    console.error('[Get Me Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { nama, jurusan, rumpun, bio, skills } = await req.json();

    const existingProfile = await redis.hgetall(`user:${userId}:profile`);
    if (!existingProfile || !existingProfile.id)
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });

    const skillList: string[] = Array.isArray(skills)
      ? skills.map((s: string) => s.toLowerCase().trim())
      : [];

    const updatedProfile = {
      ...existingProfile,
      nama: nama || existingProfile.nama,
      jurusan: jurusan || existingProfile.jurusan,
      rumpun: rumpun || existingProfile.rumpun,
      bio: bio ?? existingProfile.bio,
      skills: skillList.join(','),
    };

    await redis.hset(`user:${userId}:profile`, updatedProfile);

    const oldSkills = existingProfile.skills ? existingProfile.skills.split(',').filter(Boolean) : [];
    for (const old of oldSkills) {
      if (old && !skillList.includes(old)) await redis.srem(`skill:${old}:users`, userId);
    }
    for (const skill of skillList) {
      if (skill) await redis.sadd(`skill:${skill}:users`, userId);
    }

    if (existingProfile.rumpun && existingProfile.rumpun !== rumpun) {
      await redis.srem(`rumpun:${existingProfile.rumpun}:users`, userId);
    }
    if (rumpun) await redis.sadd(`rumpun:${rumpun}:users`, userId);

    return NextResponse.json({
      message: 'Profil berhasil diperbarui',
      user: { nama: updatedProfile.nama, jurusan: updatedProfile.jurusan, rumpun: updatedProfile.rumpun, bio: updatedProfile.bio, skills: skillList },
    });
  } catch (error) {
    console.error('[Update Me Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}