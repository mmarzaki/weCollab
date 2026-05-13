import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const { skills } = await req.json();

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: 'Array skills wajib diberikan' }, { status: 400 });
    }

    // Normalisasi array skills dan petakan ke nama keys Redis
    const skillKeys = skills.map((s: string) => `skill:${s.toLowerCase().trim()}:users`);

    // SINTER untuk mendapatkan user_id yang memiliki SEMUA skill yang diminta
    const matchedUserIds = await redis.sinter(...skillKeys);

    if (matchedUserIds.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    // Ambil detail profile tiap user yang match
    const matches = [];
    for (const userId of matchedUserIds) {
      const profile = await redis.hgetall(`user:${userId}:profile`);
      if (profile && profile.id) {
        matches.push({
          id: profile.id,
          nama: profile.nama,
          email: profile.email,
          jurusan: profile.jurusan,
          bio: profile.bio,
          skills: profile.skills ? profile.skills.split(',').filter(Boolean) : [],
          avatar: profile.avatar,
        });
      }
    }

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('[Match Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
