# tarkov-data-overlay

Community-maintained data overlay for [tarkov.dev](https://tarkov.dev) API corrections and additions.

## Why?

The tarkov.dev API is an excellent resource, but game updates sometimes outpace data updates. This overlay provides:

- **Corrections**: Fix incorrect data (task levels, map requirements, etc.)
- **Additions**: New data types not in tarkov.dev (game editions, etc.)

## Usage

Fetch the overlay from jsDelivr CDN:

```
https://cdn.jsdelivr.net/gh/tarkovtracker-org/tarkov-data-overlay@main/dist/overlay.json
```

Then merge it with tarkov.dev responses. See [Integration Guide](docs/INTEGRATION.md) for details.

## Current Corrections

| Entity | Field | tarkov.dev | Correct |
|--------|-------|------------|---------|
| Grenadier | minPlayerLevel | 20 | 10 |
| Easy Money - Part 1 | minPlayerLevel | 20 | 10 |
| Test Drive - Part 1 | minPlayerLevel | 30 | 18 |
| Test Drive - Part 2 | minPlayerLevel | 30 | 22 |
| Test Drive - Part 3 | minPlayerLevel | 30 | 25 |
| Test Drive - Part 4 | minPlayerLevel | 40 | 28 |
| Test Drive - Part 5 | minPlayerLevel | 40 | 32 |
| Test Drive - Part 6 | minPlayerLevel | 40 | 35 |

## Current Additions

- **Game Editions**: Standard, Left Behind, Prepare for Escape, Edge of Darkness, Unheard

## Contributing

Found incorrect data? See [Contributing Guide](docs/CONTRIBUTING.md).

## Data Governance

- This is **community-maintained, best-effort** data
- All corrections require proof (wiki links, screenshots)
- Not a replacement for tarkov.dev - a bridge during data gaps
- Transparent history via Git

## License

MIT
