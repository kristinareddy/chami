# Deploying Chami v26 to GitHub Pages

Upload the **contents** of `Chami_v26_Illustrated_Characters.zip` to the repository root, preserving every folder.

Do not upload the ZIP itself, do not upload only changed files, and do not place the release inside an extra `Chami_v26_Illustrated_Characters/` wrapper folder. At the repository root you should see `index.html`, `service-worker.js`, `css/`, `js/`, `assets/`, and the other release folders.

GitHub Pages should remain:

- Source: Deploy from a branch
- Branch: `main`
- Folder: `/(root)`

## After committing

1. Wait for the GitHub Pages deployment indicator to finish.
2. Open `https://kristinareddy.github.io/chami/?v=25` in Safari or Chrome.
3. Confirm Auro, Teia, Chami, and Peach appear as the new separate illustrations.
4. Confirm Words, Listen, Build, Stories, Garden, and My Growth respond to taps.
5. Open the installed Home Screen app only after the browser version has loaded once.
6. Fully close/reopen the installed app if an older service worker view remains.
7. Test one load offline after the new worker is active.

The v26 cache name is `chami-v26-illustrated-characters`. When it activates, it removes older Chami cache versions and stores the new character module, the four approved PNGs, and the existing runtime assets.

The browser storage key is unchanged. Uploading v26 at the same GitHub Pages URL preserves the existing local Auro/Teia progress on that device. Do not clear Safari website data unless you intentionally accept losing local prototype progress.

After GitHub Pages finishes, verify that `assets/character-bible/` contains exactly the four approved PNG files. Real reference photographs must not be uploaded.
