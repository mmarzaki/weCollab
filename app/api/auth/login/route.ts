import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { comparePassword, createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    // Ambil user_id dari email
    const userId = await redis.get(`email:${email.toLowerCase()}`);
    if (!userId) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    // Ambil profil dari Redis Hash
    const profile = await redis.hgetall(`user:${userId}:profile`);
    if (!profile || !profile.password_hash) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    // Verifikasi password
    const isValid = await comparePassword(password, profile.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    // Buat session baru di Redis
    const token = await createSession(userId);

    const response = NextResponse.json({
      message: 'Login berhasil',
      user: {
        id: userId,
        nama: profile.nama,
        email: profile.email,
        jurusan: profile.jurusan,
        bio: profile.bio,
        skills: profile.skills ? profile.skills.split(',').filter(Boolean) : [],
        avatar: profile.avatar,
      },
    });

    response.cookies.set({
      name: 'wecollab_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // dalam detik
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Login Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
