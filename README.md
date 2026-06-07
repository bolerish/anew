# Min - Minimal New Tab for Bookmarks

![Logo](/public/logo.svg)

Min turns your Chrome bookmarks into a clean, minimal new tab experience.

Every time you open a new tab, you can search, open, and organize your Chrome bookmarks without leaving the page.

## Features

### Bookmark management

- View bookmarks by folder
- Add, edit, delete, and reorder bookmarks

### Quick access

- Search bookmarks and the web
- Navigate with the keyboard

### Display settings

- Customize date and time display
- Adjust theme, font, and bookmark icon display

## Publishing

Min currently publishes to the Chrome Web Store.

For a local release check, run:

```sh
pnpm release:check
```

This runs linting, formatting, type checks, and creates the Chrome ZIP with WXT.

To test Chrome Web Store submission credentials without uploading a package for review, run:

```sh
pnpm submit:chrome:dry-run
```

To submit the current Chrome ZIP for review, run:

```sh
pnpm submit:chrome
```

The release workflow runs when a `v*` tag is pushed. It installs dependencies, verifies the project, creates `.output/min-{version}-chrome.zip`, attaches that ZIP to the GitHub release, and submits it with `wxt submit`.

The release workflow requires these repository secrets:

- `CHROME_EXTENSION_ID`
- `CHROME_CLIENT_ID`
- `CHROME_CLIENT_SECRET`
- `CHROME_REFRESH_TOKEN`

Only include Firefox or Edge submit options after those stores are ready. Passing `--firefox-zip`, `--firefox-sources-zip`, or `--edge-zip` also requires the matching Firefox or Edge credentials, even during `--dry-run`.
