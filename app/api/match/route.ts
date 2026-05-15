import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const currentUserId = await getUserFromRequest(req);
    const { skills, rumpun } = await req.json();

    if (!skills || !Array.isArray(skills) || skills.length === 0)
      return NextResponse.json({ error: 'Array skills wajib diberikan' }, { status: 400 });

    const normalizedSkills = skills.map((s: string) => s.toLowerCase().trim());
    const skillKeys = normalizedSkills.map((s: string) => `skill:${s}:users`);

    const matchedUserIds = await redis.sinter(...skillKeys);
    if (matchedUserIds.length === 0)
      return NextResponse.json({ candidates: [], searched_skills: normalizedSkills });

    // Set rumpun sama untuk prioritas tampil atas
    let rumpunSet: Set<string> = new Set();
    if (rumpun) {
      const rumpunUsers = await redis.smembers(`rumpun:${rumpun}:users`);
      rumpunSet = new Set(rumpunUsers);
    }

    const priorityCandidates: object[] = [];
    const otherCandidates: object[] = [];

    for (const userId of matchedUserIds) {
      if (currentUserId && userId === currentUserId) continue;
      const profile = await redis.hgetall(`user:${userId}:profile`);
      if (profile && profile.id) {
        const candidate = {
          id: profile.id,
          nama: profile.nama,
          email: profile.email,
          jurusan: profile.jurusan || '',
          rumpun: profile.rumpun || '',
          bio: profile.bio,
          skills: profile.skills ? profile.skills.split(',').filter(Boolean) : [],
          avatar: profile.avatar,
          same_rumpun: rumpun ? rumpunSet.has(userId) : false,
        };
        if (candidate.same_rumpun) priorityCandidates.push(candidate);
        else otherCandidates.push(candidate);
      }
    }

    // Rumpun sama tampil paling atas
    const candidates = [...priorityCandidates, ...otherCandidates];
    return NextResponse.json({ candidates, searched_skills: normalizedSkills });
  } catch (error) {
    console.error('[Match Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}