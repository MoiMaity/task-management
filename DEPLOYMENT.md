# Deployment

Three pieces: database (MongoDB Atlas), API (Railway), web (Vercel). All have
usable free tiers. Total time on a first run: about 40 minutes.

Deploy in this order — the web app needs the API's URL, and the API needs the
database's.

---

## 1. Database — MongoDB Atlas

1. Create an account at <https://www.mongodb.com/cloud/atlas/register>.
2. Build a **free M0 cluster**. Pick a region near you (`ap-south-1`, Mumbai).
3. **Database Access** → Add New Database User. Username + password, role
   *Read and write to any database*. Save the password now; Atlas will not show
   it again.
4. **Network Access** → Add IP Address → **Allow access from anywhere**
   (`0.0.0.0/0`).

   This is deliberate, not laziness: Railway does not publish static egress IPs
   on the free tier, so there is no narrower range to allow. Access is still
   gated by the database credentials. Note the trade-off in your README — a
   reviewer who spots it will be glad you did too.
5. **Connect** → *Drivers* → copy the connection string. It looks like:

   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

   Replace `<password>` with the real one, and insert the database name before
   the `?`:

   ```
   mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/task-management?retryWrites=true&w=majority
   ```

   If your password contains `@ : / ? # [ ] %`, URL-encode it or the string
   will not parse. Simplest fix: use a password with only letters and digits.

---

## 2. API — Railway

Railway is the recommendation over Render's free tier, which sleeps after
inactivity and can take 50+ seconds to wake. The brief says non-working URLs
are rejected, and a reviewer opening a hung page a week later will not wait.

1. Sign in at <https://railway.app> with GitHub.
2. **New Project** → *Deploy from GitHub repo* → select your repository.
3. Open the service → **Settings**:
   - **Root Directory**: leave as `/` — the Dockerfile needs the repo root as
     its build context.
   - **Build** → set **Dockerfile Path** to `apps/api/Dockerfile`.
4. **Variables** → add:

   | Name | Value |
   | --- | --- |
   | `MONGODB_URI` | your Atlas string from step 1 |
   | `JWT_SECRET` | 32+ random chars — see below |
   | `NODE_ENV` | `production` |
   | `CORS_ORIGINS` | leave blank for now; filled in step 4 |

   Generate the secret locally:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

   Do not set `PORT`. Railway injects it, and `main.ts` reads it.
5. **Settings** → **Networking** → **Generate Domain**. You get something like
   `tms-api-production.up.railway.app`.
6. Verify:
   ```bash
   curl https://YOUR-API.up.railway.app/api/health
   ```
   Expect `{"success":true,"data":{"status":"ok","database":"connected",...}}`.

   If `database` says `disconnected`, the Atlas string or the network rule is
   wrong. Check the deploy logs before changing anything else.

---

## 3. Web — Vercel

1. Sign in at <https://vercel.com> with GitHub → **Add New** → *Project* →
   import your repository.
2. **Root Directory**: `apps/web`. Leave *Include files outside the root
   directory* enabled — the build needs `packages/shared`.
3. Framework preset should auto-detect **Next.js**. Leave build and install
   commands on their defaults; the root `postinstall` builds the shared package.
4. **Environment Variables** → add for all environments:

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_API_URL` | `https://YOUR-API.up.railway.app/api` |

   Include `/api`, and no trailing slash. `NEXT_PUBLIC_` values are baked in at
   build time, so changing this later requires a redeploy, not just a restart.
5. **Deploy**. You get `your-project.vercel.app`.

---

## 4. Close the CORS loop

Back in Railway → **Variables** → set:

```
CORS_ORIGINS=https://your-project.vercel.app
```

No trailing slash, and `https` not `http` — the origin is matched as an exact
string. Railway redeploys automatically.

Vercel gives every branch and commit its own preview URL, and those origins
will be blocked. That is fine for the assessment; the production URL is what
gets reviewed.

---

## 5. Verify like a reviewer

Do this in a private window, on mobile data, not on your own machine:

- [ ] `https://your-project.vercel.app` loads
- [ ] `https://YOUR-API.up.railway.app/api/health` returns `database: connected`
- [ ] No CORS errors in the browser console
- [ ] Theme survives a hard refresh, with no flash of the wrong theme
- [ ] Layout holds at 375px wide
- [ ] Repository is **public** (Settings → General → Change visibility)

Re-run this list the day you submit. Free-tier services expire, Atlas pauses
idle clusters after 60 days, and the brief requires the link to work for 45
days after submission.

---

## Ongoing

Both platforms redeploy on every push to `main`. Push small commits; if one
breaks the build you will know within two minutes and the previous deploy stays
live in the meantime.

## Alternatives

| Instead of | Use | Note |
| --- | --- | --- |
| Railway | Render (paid), Fly.io | Render's free tier sleeps — avoid, or add an uptime pinger |
| Atlas | Railway's MongoDB plugin | One less account; counts against the same usage credit |
| Vercel | Netlify, Cloudflare Pages | Vercel has the least friction for Next.js App Router |
