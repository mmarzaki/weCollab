import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth';

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('wecollab_token')?.value;

    if (token) {
      await deleteSession(token);
    }

    const response = NextResponse.json({ message: 'Logout berhasil' });
    response.cookies.delete('wecollab_token');

    return response;
  } catch (error) {
    console.error('[Logout Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
