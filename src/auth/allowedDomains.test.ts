import { describe, it, expect } from 'vitest';
import { isAllowedEmailDomain, emailDomain } from './allowedDomains';

describe('allowed email domains', () => {
  it('accepts the permitted domains (case-insensitive)', () => {
    expect(isAllowedEmailDomain('jane.doe@nhs.net')).toBe(true);
    expect(isAllowedEmailDomain('Jane.Doe@NHS.net')).toBe(true);
    expect(isAllowedEmailDomain('dev@abtrace.co')).toBe(true);
    expect(isAllowedEmailDomain('  dev@abtrace.co  ')).toBe(true);
  });

  it('rejects other domains, including look-alikes', () => {
    expect(isAllowedEmailDomain('person@gmail.com')).toBe(false);
    expect(isAllowedEmailDomain('person@nhs.uk')).toBe(false);
    expect(isAllowedEmailDomain('person@abtrace.com')).toBe(false);
    expect(isAllowedEmailDomain('person@evil-nhs.net.attacker.com')).toBe(false);
    expect(isAllowedEmailDomain('not-an-email')).toBe(false);
    expect(isAllowedEmailDomain('')).toBe(false);
  });

  it('extracts the domain part', () => {
    expect(emailDomain('a@b.com')).toBe('b.com');
    expect(emailDomain('A@B.COM')).toBe('b.com');
  });
});
