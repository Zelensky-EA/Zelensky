# Mr. Zelensky's Science Navigator

One GitHub Pages website containing the AP Biology and Anatomy & Physiology course navigators, presented as an aged penny-dreadful science chronicle.

The AP Biology course opens to a single Today dispatch (or the most recent populated class entry) and includes a separate five-day Weekly Navigator with previous/next week controls.

## Local preview

The landing page and Anatomy navigator can be previewed with `python -m http.server 8080` from this folder. For AP Biology, run `npm install` and `npm run dev` inside `ap-biology`.

## Deploy

1. Upload this folder to the root of a GitHub repository.
2. In **Settings → Pages**, select **GitHub Actions** as the source.
3. Add repository variable `VITE_NAVIGATOR_CSV_URL` containing the published AP Biology student-calendar CSV URL.
4. Push to `main`. The workflow builds AP Biology, combines both course sites, and publishes the unified portal.

The Anatomy navigator's published-sheet URL remains embedded in `anatomy-physiology/data.js`, with its saved fallback retained.
