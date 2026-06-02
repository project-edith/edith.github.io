# edith.github.io

Static project page for EDITH.

## Local preview

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Files

- `index.html`: page structure, paper copy, resource links, citation
- `styles.css`: visual design and responsive layout
- `script.js`: active navigation state and BibTeX copy button
- `assets/hero-edith.png`: temporary hero image generated for the page

## Deployment

For GitHub Pages under `project-edith/edith.github.io`:

```bash
git init
git add README.md index.html styles.css script.js assets/hero-edith.png .nojekyll .gitignore
git commit -m "first commit"
git branch -M main
git remote add origin git@github.com:project-edith/edith.github.io.git
git push -u origin main
```
