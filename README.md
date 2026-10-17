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

## Clone all seven repositories

Yuvoy is one system in seven repositories. Clone every one you have access to,
side by side in one folder, even if you work in only one of them. The team rules
are in [`AGENTS.md`](AGENTS.md).

| Repository       | What it is                                    | Built by  |
| ---------------- | --------------------------------------------- | --------- |
| `yuvoy-api`      | Go API, the source of truth for every app     | Hima      |
| `yuvoy-admin`    | staff console                                 | Hima      |
| `yuvoy-lens`     | internal view of the lead pipeline            | Hima      |
| `yuvoy-mobile`   | the traveller app and the operator app (Expo) | Vishwanth |
| `yuvoy-app`      | traveller web app, app.yuvoy.in               | Vishwanth |
| `yuvoy-operator` | operator web portal, operators.yuvoy.in       | Vishwanth |
| `yuvoy-web`      | yuvoy.in landing page                         | Vishwanth |

```bash
mkdir -p ~/yuvoy && cd ~/yuvoy
git clone https://github.com/yuvoy-in/yuvoy-api.git
git clone https://github.com/yuvoy-in/yuvoy-admin.git
git clone https://github.com/yuvoy-in/yuvoy-lens.git
git clone https://github.com/yuvoy-in/yuvoy-mobile.git
git clone https://github.com/yuvoy-in/yuvoy-app.git
git clone https://github.com/yuvoy-in/yuvoy-operator.git
git clone https://github.com/yuvoy-in/yuvoy-web.git
```
