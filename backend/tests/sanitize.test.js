const { sanitizeInput } = require('../src/middleware/sanitize');

describe('Input sanitization', () => {
  it('removes dangerous HTML and script tags', () => {
    const raw = { comment: '<script>alert(1)</script><b>bold</b>' };
    const sanitized = sanitizeInput(raw);
    expect(sanitized.comment).toBe('bold');
  });

  it('removes mongo operators from objects', () => {
    const raw = { name: 'Alice', $where: 'this.password == "password"' };
    const sanitized = sanitizeInput(raw);
    expect(sanitized).toHaveProperty('name', 'Alice');
    expect(sanitized).not.toHaveProperty('$where');
  });
});
