/**
 * Robust sanitization for text that will be interpolated into LLM prompts.
 * Prevents prompt injection by stripping control characters, normalizing Unicode,
 * and clearly marking data boundaries.
 */

/** Strip characters that could be used for prompt injection */
export function sanitizeForPrompt(val: string | null | undefined, maxLen = 200): string {
  if (!val) return '-'
  let s = typeof val === 'string' ? val : String(val)

  // Normalize Unicode (NFKC) to prevent homoglyph attacks
  s = s.normalize('NFKC')

  // Remove control characters (keep newline, tab for readability)
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // Remove common prompt injection patterns (broader matching)
  const injectionPatterns = [
    // Instruction overrides
    /\bignore\s+(all\s+)?(previous|above|prior|earlier)\s+(instructions?|prompts?|rules?|directions?)/gi,
    /\bdisregard\s+(all\s+)?(previous|above|prior|earlier)\s+(instructions?|prompts?|rules?)/gi,
    /\bforget\s+(all\s+)?(previous|above|your)\s+(instructions?|prompts?|rules?)/gi,
    /\bnew\s+instructions?\b/gi,
    /\boverride\s+/gi,
    // Role manipulation
    /\byou\s+are\s+(now|no longer|instead|a)\b/gi,
    /\bact\s+as\s+(if|a|an|like)\b/gi,
    /\bpretend\s+(you|to\s+be|that)\b/gi,
    /\brole\s*:/gi,
    /\bsystem\s*:/gi,
    /\bassistant\s*:/gi,
    // Output manipulation
    /\boutput\s+(only|just|the)\b/gi,
    /\brespond\s+(only|just|with)\b/gi,
    /\breturn\s+(only|just)\b/gi,
    /\bprint\s+(the|your|all)\b/gi,
    /\bexpose\s+/gi,
    /\breveal\s+/gi,
    /\bleak\s+/gi,
    /\bsecret\s+/gi,
    // Delimiter/structure manipulation
    /\b```/g,
    /\b<\/?(system|assistant|user)>/gi,
  ]

  for (const pattern of injectionPatterns) {
    s = s.replace(pattern, '[filtered]')
  }

  // Collapse multiple newlines to max 2
  s = s.replace(/\n{3,}/g, '\n\n')

  // Trim and enforce length limit
  s = s.trim().slice(0, maxLen) || '-'
  return s
}

/** Wrap user data section in the prompt with clear boundary markers */
export function wrapPromptData(label: string, content: string): string {
  return `[DATA: ${label} START]\n${content}\n[DATA: ${label} END]`
}