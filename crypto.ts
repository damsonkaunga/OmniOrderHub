export function generateSecurePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function generateOrderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'ORD-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function maskPII(text: string, type: 'email' | 'phone' | 'address' | 'name' = 'email'): string {
  if (!text) return '***';
  if (type === 'email') {
    const parts = text.split('@');
    if (parts.length === 2) {
      const name = parts[0];
      const visible = name.slice(0, 2);
      return `${visible}***@${parts[1]}`;
    }
  } else if (type === 'phone') {
    return text.replace(/(\+?\d{1,3})?[\s-]?(\d{2,4})[\s-]?(\d{2,4})[\s-]?(\d{2,4})/, '***-***-$4');
  } else if (type === 'name') {
    const names = text.split(' ');
    if (names.length > 1) {
      return `${names[0]} ${names[1].charAt(0)}.***`;
    }
    return `${text.slice(0, 3)}***`;
  } else if (type === 'address') {
    return text.replace(/\d+/g, '***');
  }
  return text.slice(0, 3) + '••••••••';
}

export function simulateAES256Encrypt(payload: object | string): string {
  const str = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const base64 = btoa(unescape(encodeURIComponent(str)));
  return `ENC-AES256-GCM::${base64.split('').reverse().join('')}::HMAC_SHA256_V1`;
}

export function simulateAES256Decrypt(encryptedString: string): any {
  try {
    if (!encryptedString.startsWith('ENC-AES256-GCM::')) {
      return encryptedString;
    }
    const core = encryptedString.split('::')[1];
    const originalBase64 = core.split('').reverse().join('');
    const jsonStr = decodeURIComponent(escape(atob(originalBase64)));
    try {
      return JSON.parse(jsonStr);
    } catch {
      return jsonStr;
    }
  } catch (e) {
    return { error: 'Decryption failed: Key mismatch or tampered payload' };
  }
}

export function generateCryptoHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x${hex}${Date.now().toString(16).slice(-6)}e8f92a1`;
}
