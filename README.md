# Insta-Cyborg

## Setup

- Use volta
- Place the configuration in `config/lib/index.ts`
- Place authentication secret in `server/.env` and `bot/.env`
- Ensure you have the required fonts installed (see `server/lib/graphics.ts`)
- Run `npx lerna bootstrap` to install and link packages

### Example `server/.env` / `bot/.env`

```
INSTA_CYBORG_AUTHORIZATION="correct horse battery staple"
CHROMIUM_EXECUTABLE="/usr/bin/google-chrome"
```
(`CHROMIUM_EXECUTABLE` is only necessary in `server/.env`)