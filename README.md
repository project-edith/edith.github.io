# edith.github.io

Static GitHub Pages site for EDITH.

## Local preview

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Files

- `index.html`: GitHub Pages entry point, interactive demos, architecture figure, resources
- `styles.css`: visual design and responsive layout
- `script.js`: demo switching, architecture/method tabs, active navigation, BibTeX copy button
- `assets/hero-edith.png`: temporary hero image generated for the page
- `assets/architecture/*.jpg`: optimized image tiles used inside the architecture figure
- `assets/user.png`: user illustration used inside the architecture figure
- `assets/favicon.svg`: small browser icon
- `assets/videos/*.mp4`: compressed demo previews for the interactive gallery
- `assets/posters/*.jpg`: poster frames for the demo videos

## Deployment

For the existing remote `project-edith/edith.github.io`:

```bash
git init
git add README.md index.html styles.css script.js assets .nojekyll .gitignore
git commit -m "first commit"
git branch -M main
git remote add origin git@github.com:project-edith/edith.github.io.git
git push -u origin main
```

This is a static site. GitHub Pages can serve it directly from the `main`
branch root without a build step.

If the target URL should be `https://project-edith.github.io/`, the organization
Pages repository is usually named `project-edith.github.io`. If this repository
stays named `edith.github.io`, configure Pages in GitHub settings and check the
published URL shown there.
