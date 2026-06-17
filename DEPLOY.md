# AI Art Masters - Landing Page

Standalone, self-contained static site. `index.html` is the landing page.
No build step. Fonts load from Google Fonts; mission images load from ai-art-masters.com.
Add `#tune` to the URL to open the "How it works" animation tuner.

## Files
- `index.html` - the landing page
- `brand/aam.css` - design system / styles
- `welcome-quiz.html`, `home.html` - linked pages
- `assets/` - user-score.js + trust SVGs

## 1. Push to a new GitHub repo

```bash
cd ai-art-masters-landing-page
git init
git add -A
git commit -m "AI Art Masters landing page"
git branch -M main
```

Then either with the GitHub CLI (creates the repo + pushes in one step):

```bash
gh repo create ai-art-masters-landing-page --public --source=. --remote=origin --push
```

Or manually: create an empty repo named `ai-art-masters-landing-page` on github.com (no README), then:

```bash
git remote add origin https://github.com/<your-username>/ai-art-masters-landing-page.git
git push -u origin main
```

## 2. Deploy to Vercel

```bash
npm i -g vercel      # if you don't have the CLI
cd ai-art-masters-landing-page
vercel               # first run: log in; accept project name "ai-art-masters-landing-page"; framework = Other; keep defaults
vercel --prod        # promote to production
```

Or, after the repo is on GitHub, import it in the Vercel dashboard (New Project -> Import) for automatic deploys on every push. Set the project name to `ai-art-masters-landing-page`.
