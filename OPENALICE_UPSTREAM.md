# OpenAlice Upstream Information

## Upstream Project

- **Name**: OpenAlice
- **Repository**: https://github.com/TraderAlice/OpenAlice
- **Description**: Your one-person Wall Street. An AI trading agent covering equities, crypto, commodities, forex, and macro.
- **License**: AGPL-3.0-only

## Current Bundled Version

- **Commit**: _(to be filled at build time)_
- **Date**: _(to be filled at build time)_
- **Tag**: _(none, development version)_

## Build Date

_(to be filled by CI)_

## Local Patches

_(none yet — patches will be tracked in `patches/` directory)_

## Compliance Notes

As an AGPL-3.0 derivative work:

1. This repository's source code is publicly available
2. The upstream LICENSE file is preserved
3. Copyright notices are retained
4. Modifications are documented here
5. Users can obtain the complete source code from this repository

## How to Update

```bash
cd vendor/OpenAlice
git fetch origin
git checkout <desired-commit-or-tag>
cd ../..
git add vendor/OpenAlice
git commit -m "chore: update OpenAlice to <commit>"
```
