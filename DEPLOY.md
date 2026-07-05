# Deploy Homemakers Superinfras website on GitHub Pages (free)

This folder is a fully static website — no server needed. GitHub Pages will
host it free, publicly, with HTTPS.

## Method A — no coding tools needed (GitHub website only)

1. Create a free account at https://github.com (skip if you have one).
2. Click the "+" (top-right) → **New repository**.
   - Repository name: `homemakers-website` (any name works)
   - Visibility: **Public** (required for free GitHub Pages)
   - Click **Create repository**.
3. On the new repo page, click **uploading an existing file**.
   Drag ALL the contents of this folder in — `index.html`, `404.html`,
   `.nojekyll`, and the `images` and `docs` folders.
   (Drag the files/folders themselves, not the parent zip folder —
   `index.html` must sit at the top level of the repository.)
   Click **Commit changes** and wait for the upload to finish.
4. Go to **Settings** (repo tab) → **Pages** (left sidebar).
5. Under "Build and deployment":
   - Source: **Deploy from a branch**
   - Branch: **main**, folder: **/ (root)** → **Save**.
6. Wait 1–2 minutes, refresh the Pages screen. Your public URL appears:

   https://YOUR-USERNAME.github.io/homemakers-website/

   Share that link — anyone in the world can open it.

## Method B — using Git (if installed)

```bash
cd homemakers-static
git init
git add .
git commit -m "Homemakers Superinfras website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/homemakers-website.git
git push -u origin main
```
Then do steps 4–6 above.

## Updating the site later

Edit `index.html` (or replace an image in `images/`) and upload/commit the
changed file the same way. GitHub Pages republishes automatically in a
minute or two.

## Custom domain (optional, also free on GitHub's side)

If you own a domain like homemakerssuperinfra.com, open Settings → Pages →
Custom domain, enter it, and add the DNS records GitHub shows you at your
domain registrar. HTTPS is provided automatically.

## Notes

- `.nojekyll` tells GitHub to publish files as-is — keep it.
- `404.html` redirects any wrong URL back to the home page.
- The enquiry form works without a server: it opens WhatsApp
  (+91 70213 62405) or the visitor's email app with the enquiry pre-filled.
- Free GitHub Pages soft limits: 1 GB site size, ~100 GB bandwidth/month —
  far more than this site needs.
