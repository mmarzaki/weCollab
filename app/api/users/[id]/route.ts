import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const profile = await redis.hgetall(`user:${id}:profile`);
    if (!profile || !profile.id) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Ambil list project yang diikuti user
    const userProjects = await redis.smembers(`user:${id}:projects`);

    return NextResponse.json({
      id: profile.id,
      nama: profile.nama,
      email: profile.email,
      jurusan: profile.jurusan,
      bio: profile.bio,
      skills: profile.skills ? profile.skills.split(',') : [],
      avatar: profile.avatar,
      projects: userProjects,
    });
  } catch (error) {
    console.error('[Get User Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
