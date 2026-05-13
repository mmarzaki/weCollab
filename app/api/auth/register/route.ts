import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import redis from '@/lib/redis';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { nama, email, password, jurusan, bio, skills } = await req.json();

    // Validasi input
    if (!nama || !email || !password || !jurusan) {
      return NextResponse.json({ error: 'Nama, email, password, dan jurusan wajib diisi' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    // Cek email sudah dipakai (cek di wecollab:emails set)
    const emailExists = await redis.sismember('wecollab:emails', email.toLowerCase());
    if (emailExists) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 });
    }

    const userId = uuidv4();
    const passwordHash = await hashPassword(password);
    const skillList: string[] = Array.isArray(skills)
      ? skills.map((s: string) => s.toLowerCase().trim())
      : [];

    // Simpan profil user ke Redis Hash
    await redis.hset(`user:${userId}:profile`, {
      id: userId,
      nama,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      jurusan,
      bio: bio || '',
      skills: skillList.join(','),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      created_at: Date.now().toString(),
    });

    // Daftarkan email ke Set global
    await redis.sadd('wecollab:emails', email.toLowerCase());
    // Map email ke user_id
    await redis.set(`email:${email.toLowerCase()}`, userId);
    // Tambahkan ke set semua user
    await redis.sadd('wecollab:users', userId);

    // Daftarkan user ke setiap skill Set
    for (const skill of skillList) {
      if (skill) {
        await redis.sadd(`skill:${skill}:users`, userId);
      }
    }

    // Buat session
    const token = await createSession(userId);

    const response = NextResponse.json(
      {
        message: 'Registrasi berhasil',
        user: { id: userId, nama, email, jurusan, skills: skillList },
      },
      { status: 201 }
    );

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
    console.error('[Register Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
