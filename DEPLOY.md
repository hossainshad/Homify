# Homify — Deploy to Vercel

## Heads up: Supabase vs MongoDB

Your app uses **Mongoose/MongoDB** across every model and controller. Switching to Supabase (Postgres) would mean rewriting the entire data layer. To keep effort minimal, this is configured for **Vercel + MongoDB Atlas** (MongoDB's free cloud tier — same Mongoose code, zero rewrite).

If you specifically need Supabase, that's a separate, much larger refactor.

---

## 1. Set up MongoDB Atlas (free)

1. Go to https://cloud.mongodb.com and create a free account
2. Create a free M0 cluster
3. Database Access → add a user with a password
4. Network Access → add IP `0.0.0.0/0` (allow from anywhere — required for Vercel)
5. Click **Connect → Drivers** → copy the connection string. It looks like:
   `mongodb+srv://USER:PASS@cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. Add `/homify` before the `?`:
   `mongodb+srv://USER:PASS@cluster.xxxxx.mongodb.net/homify?retryWrites=true&w=majority`

## 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<you>/homify.git
git push -u origin main
```

## 3. Deploy on Vercel

1. Go to https://vercel.com → New Project → import your GitHub repo
2. Framework Preset: **Other**
3. Build Command: leave empty
4. Output Directory: leave empty
5. Environment Variables — add these two:
   - `MONGODB_URI` = your Atlas connection string from step 1
   - `SESSION_SECRET` = any long random string (e.g. `openssl rand -hex 32`)
6. Click **Deploy**

That's it. Your app will be live at `https://<project>.vercel.app`.

## Known limitation — file uploads

Vercel's filesystem is **read-only**, so the existing `multer.diskStorage()` upload for flat images will fail on Vercel. The site works fine without it (browsing, login, requests all work), but new image uploads won't persist.

When you want to fix that later, the standard options are Cloudinary, UploadThing, or S3. Cloudinary has a generous free tier and is the smallest change — swap `multer.diskStorage` for `multer-storage-cloudinary` in `src/middlewares/uploadMiddleware.js`.

## Local development

```bash
npm install
cp .env.example .env
# fill in MONGODB_URI and SESSION_SECRET
npm run dev
```
