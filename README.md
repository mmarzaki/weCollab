## Update #2

app/api/auth/me/route.ts: GET profil user + PUT update profil, lengkap dengan field rumpun.
app/api/projects/route.ts: GET list project + POST buat project, dengan field bidang, rumpun, cari_langsung, dan applicant_count.
app/api/match/route.ts: POST search dengan logika sorting rumpun (rumpun sama tampil lebih atas).
app/api/projects/[id]/route.ts: GET detail project + DELETE hapus, dengan field is_owner, is_applicant, is_accepted, dan show_owner_contact.
app/api/projects/[id]/apply/route.ts: POST (lamar) dan DELETE (batalkan lamaran), keduanya dengan context.params yang benar.
app/api/projects/[id]/applications/route.ts: GET (lihat pelamar) dan POST (terima/tolak), menggantikan PUT yang salah sebelumnya.
app/api/auth/register/route.ts: menyimpan dan mengindex rumpun user ke Redis.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
