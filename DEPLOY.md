# Deploying Chami v24 to GitHub Pages

Upload the **contents** of `Chami_v24_Phonics_Tactile_Scaffolds.zip` to the repository root, preserving every folder. Do not upload only the changed files and do not place the whole release inside an extra wrapper folder.

GitHub Pages should remain:

- Source: Deploy from a branch
- Branch: `main`
- Folder: `/(root)`

After the commit, wait for Pages to finish deploying, then open the live URL in a normal browser tab. Confirm the app loads and `js/phonics-engine.js` is present.

The v24 service-worker cache is `chami-v24-phonics-tactile-scaffolds`. Once the new worker activates, it removes old Chami cache versions. If the installed Home Screen app still looks stale, fully close it, open the live browser version once, then reopen the installed app.

Do not change the browser-storage key: v24 lazily migrates the existing v23 literacy record and preserves local Auro/Teia progress on the same device and site URL.
