/**
 * Tests for scripts/check-overrides.ts helpers
 */

import { describe, expect, it } from 'vitest';
import { normalizeWikiLink } from '../scripts/check-overrides.ts';

describe('normalizeWikiLink', () => {
  it('normalizes scheme, host, query, fragment, and trailing slashes', () => {
    const link =
      'http://www.escapefromtarkov.fandom.com/wiki/New_Beginning/?oldid=1#History';
    expect(normalizeWikiLink(link)).toBe(
      'https://escapefromtarkov.fandom.com/wiki/new_beginning'
    );
  });

  it('returns a trimmed lowercase fallback for malformed URLs', () => {
    expect(normalizeWikiLink('  escapefromtarkov.fandom.com/Wiki/Test/  ')).toBe(
      'escapefromtarkov.fandom.com/wiki/test'
    );
  });

  it('returns undefined for empty values', () => {
    expect(normalizeWikiLink(undefined)).toBeUndefined();
    expect(normalizeWikiLink('   ')).toBeUndefined();
  });
});
