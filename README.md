# ThoufTube

A private, single-user site for uploading videos and photos and writing text
posts. Content can be organized into categories you create yourself, and any
item can be marked "sensitive" to blur it until clicked. Only the one
username/password you configure can access the site.

## Stack

- Next.js (App Router, TypeScript), Tailwind CSS
- PostgreSQL via Prisma
- Cloudflare R2 (S3-compatible) for video/photo storage, accessed through
  short-lived presigned URLs (the bucket itself stays private)
- ffmpeg (installed in the deploy container) for automatic video thumbnails

## One-time setup

### 1. Create a Cloudflare R2 bucket

1. In the Cloudflare dashboard, go to R2 and create a bucket (e.g. `thouftube`).
2. Create an API token with read/write access to that bucket (R2 → Manage API
   tokens). Note the **Access Key ID**, **Secret Access Key**, and your
   **Account ID**.

### 2. Generate your login credentials

Pick a username and a password. Hash the password locally:

```bash
npm install
node scripts/hash-password.mjs "your-chosen-password"
```

Copy the printed hash — you'll use it as `AUTH_PASSWORD_HASH` below. Never
store the plain-text password anywhere.

> **Important if you put this in a local `.env` file:** bcrypt hashes contain
> `$` characters, and Next.js's `.env` loader treats `$name` as a variable
> reference and silently mangles it. Escape every `$` as `\$` when putting the
> hash in a local `.env` file, e.g. `AUTH_PASSWORD_HASH="\$2b\$12\$..."`. This
> does **not** apply to Railway's dashboard variables — those are injected
> directly as real environment variables and are never parsed/expanded this
> way, so paste the hash there unescaped.

Also generate a random string for `AUTH_SECRET` (used to sign session
cookies), e.g.:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Deploy on Railway

1. Create a new Railway project from this GitHub repo.
2. Add a **PostgreSQL** plugin to the project — Railway sets `DATABASE_URL`
   automatically for your app service.
3. In the app service's **Variables** tab, set:
   - `AUTH_USERNAME` — your chosen username
   - `AUTH_PASSWORD_HASH` — the bcrypt hash from step 2
   - `AUTH_SECRET` — the random string from step 2
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
     `R2_BUCKET_NAME` — from step 1
4. Deploy. Railway builds with Nixpacks (ffmpeg is installed automatically via
   `nixpacks.toml`), runs `prisma migrate deploy` on start to apply the
   database schema, then starts the server.

## Local development

```bash
cp .env.example .env
# fill in .env with a local/dev Postgres URL and your R2 + auth values
npm install
npx prisma migrate dev
npm run dev
```

## Notes

- All media files are stored privately in R2; the app generates temporary
  signed URLs to display or play them, so files are never publicly
  reachable.
- Deleting a category does not delete the content that used it — items just
  become uncategorized.
- The "sensitive" flag only blurs the preview client-side; it does not alter
  or redact the underlying file.
