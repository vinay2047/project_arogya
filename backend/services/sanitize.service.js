function sanitizeText(text) {
  const patterns = {
    email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    phone: /\b\d{10,15}\b/g,
    ip: /\b\d{1,3}(?:\.\d{1,3}){3}\b/g,
    creditCard: /\b(?:\d[ -]*?){13,16}\b/g,
    aadhar: /\b\d{4}\s\d{4}\s\d{4}\b/g,
    name: /\b(Name|Patient|Person)\s*:\s*[A-Z][a-z]+\s?[A-Z][a-z]/gi,
  };

  let sanitized = text;
  for (const [key, regex] of Object.entries(patterns)) {
    sanitized = sanitized.replace(regex, `[REDACTED ${key}]`);
  }

  return sanitized;
}

module.exports = { sanitizeText };