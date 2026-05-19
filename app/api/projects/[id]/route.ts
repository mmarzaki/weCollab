import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });

    const currentUserId = await getUserFromRequest(req);

    const info = await redis.hgetall(`project:${id}:info`);
    if (!info || Object.keys(info).length === 0 || !info.id)
      return NextResponse.json({ error: 'Project tidak ditemukan' }, { status: 404 });

    let memberIds: string[] = [];
    let skillsNeeded: string[] = [];
    let ownerProfile: Record<string, string> | null = null;
    let applicantIds: string[] = [];
    let acceptedIds: string[] = [];

    try { memberIds = await redis.smembers(`project:${id}:members`); } catch (_) {}
    try { skillsNeeded = await redis.smembers(`project:${id}:skills_needed`); } catch (_) {}
    try { if (info.owner_id) ownerProfile = await redis.hgetall(`user:${info.owner_id}:profile`); } catch (_) {}
    try { applicantIds = await redis.smembers(`project:${id}:applicants`); } catch (_) {}
    try { acceptedIds = await redis.smembers(`project:${id}:accepted`); } catch (_) {}

    const members: Array<{ id: string; nama: string; jurusan: string; avatar: string; skills: string[] }> = [];
    for (const memberId of memberIds) {
      try {
        const p = await redis.hgetall(`user:${memberId}:profile`);
        if (p && p.id) members.push({ id: p.id, nama: p.nama ?? '', jurusan: p.jurusan ?? '', avatar: p.avatar ?? '', skills: p.skills ? p.skills.split(',').filter(Boolean) : [] });
      } catch (_) {}
    }

    const ownerNama = ownerProfile?.nama ?? 'Unknown';
    const owner = ownerProfile?.id
      ? { id: ownerProfile.id, nama: ownerProfile.nama ?? '', avatar: ownerProfile.avatar ?? '', email: ownerProfile.email ?? '' }
      : { id: info.owner_id ?? '', nama: 'Unknown', avatar: '', email: '' };

    const isOwner = !!currentUserId && currentUserId === info.owner_id;
    const isMember = !!currentUserId && memberIds.includes(currentUserId);
    const isApplicant = !!currentUserId && applicantIds.includes(currentUserId);
    const isAccepted = !!currentUserId && acceptedIds.includes(currentUserId);

    return NextResponse.json({
      project: {
        id: info.id,
        judul: info.judul ?? '',
        deskripsi: info.deskripsi ?? '',
        bidang: info.bidang ?? '',
        kategori: info.kategori ?? info.bidang ?? '',
        rumpun: info.rumpun ?? '',
        status: info.status ?? 'open',
        cari_langsung: info.cari_langsung === 'true',
        created_at: info.created_at ?? '',
        owner_id: info.owner_id ?? '',
        owner_nama: ownerNama,
        owner,
        members,
        member_count: members.length,
        applicant_count: applicantIds.length,
        skills_needed: skillsNeeded,
        is_owner: isOwner,
        is_member: isMember,
        is_applicant: isApplicant,
        is_accepted: isAccepted,
        show_owner_contact: isAccepted || isOwner,
      },
    });
  } catch (error) {
    console.error('[Get Project Detail Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await context.params;
    const info = await redis.hgetall(`project:${projectId}:info`);
    if (!info || !info.id) return NextResponse.json({ error: 'Project tidak ditemukan' }, { status: 404 });
    if (info.owner_id !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const members = await redis.smembers(`project:${projectId}:members`);
    await Promise.all([
      redis.del(`project:${projectId}:info`),
      redis.del(`project:${projectId}:members`),
      redis.del(`project:${projectId}:skills_needed`),
      redis.del(`project:${projectId}:applicants`),
      redis.del(`project:${projectId}:accepted`),
      redis.zrem('wecollab:active_projects', projectId),
    ]);
    for (const memberId of members) await redis.srem(`user:${memberId}:projects`, projectId);

    return NextResponse.json({ message: 'Project berhasil dihapus' });
  } catch (error) {
    console.error('[Delete Project Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await context.params;
    const info = await redis.hgetall(`project:${projectId}:info`);
    if (!info || !info.id) return NextResponse.json({ error: 'Project tidak ditemukan' }, { status: 404 });
    if (info.owner_id !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { judul, deskripsi, bidang, kategori, rumpun, status, skills_needed } = await req.json();
    const finalBidang = bidang || kategori || '';

    const updateFields: Record<string, string> = {};
    if (judul !== undefined) updateFields.judul = judul;
    if (deskripsi !== undefined) updateFields.deskripsi = deskripsi;
    if (finalBidang !== undefined) {
      updateFields.bidang = finalBidang;
      updateFields.kategori = finalBidang;
    }
    if (rumpun !== undefined) updateFields.rumpun = rumpun || '';
    if (status !== undefined) updateFields.status = status || 'open';

    if (Object.keys(updateFields).length > 0) {
      await redis.hset(`project:${projectId}:info`, updateFields);
    }

    if (skills_needed !== undefined && Array.isArray(skills_needed)) {
      await redis.del(`project:${projectId}:skills_needed`);
      for (const skill of skills_needed) {
        const ns = skill.trim();
        if (ns) await redis.sadd(`project:${projectId}:skills_needed`, ns);
      }
    }

    return NextResponse.json({ message: 'Project berhasil diperbarui' });
  } catch (error) {
    console.error('[Update Project Error]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}