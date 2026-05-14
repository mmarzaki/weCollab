import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const currentUserId = await getUserFromRequest(req);

    const { skills } = await req.json();

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: 'Array skills wajib diberikan' }, { status: 400 });
    }

    const normalizedSkills = skills.map((s: string) => s.toLowerCase().trim());
    const skillKeys = normalizedSkills.map((s: string) => `skill:${s}:users`);

    const matchedUserIds = await redis.sinter(...skillKeys);

    if (matchedUserIds.length === 0) {
      return NextResponse.json({ candidates: [], searched_skills: normalizedSkills });
    }

    const candidates = [];
    for (const userId of matchedUserIds) {
      // Saring user saat ini dari hasil
      if (currentUserId && userId === currentUserId) continue;

      const profile = await redis.hgetall(`user:${userId}:profile`);
      if (profile && profile.id) {
        candidates.push({
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

    return NextResponse.json({ candidates, searched_skills: normalizedSkills });
  } catch (error) {
    console.error('[Match Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}