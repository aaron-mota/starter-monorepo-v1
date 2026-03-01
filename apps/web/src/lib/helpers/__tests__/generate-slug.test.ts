import { generateSlug } from '../generate-slug';
import { describe, expect, it } from 'vitest';

describe('generateSlug', () => {
  it('converts a normal name to a slug', () => {
    expect(generateSlug('Washer')).toBe('washer');
    expect(generateSlug('Front Door')).toBe('front-door');
  });

  it('strips special characters', () => {
    expect(generateSlug('Hello World!')).toBe('hello-world');
    expect(generateSlug('tag@#$name')).toBe('tag-name');
  });

  it('caps length at 16 characters', () => {
    expect(generateSlug('this is a very long tag name that exceeds sixteen').length).toBeLessThanOrEqual(16);
  });

  it('removes leading and trailing hyphens', () => {
    expect(generateSlug('--hello--')).toBe('hello');
    expect(generateSlug('  spaced  ')).toBe('spaced');
  });

  it('handles empty string', () => {
    expect(generateSlug('')).toBe('');
  });

  it('handles numeric input', () => {
    expect(generateSlug('123')).toBe('123');
  });

  it('collapses multiple consecutive hyphens', () => {
    expect(generateSlug('a   b   c')).toBe('a-b-c');
  });
});
