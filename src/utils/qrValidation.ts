interface QRCodeData {
  data: string;
  expiresAt?: string;
}

export function parseQRCodeData(qrData: string): QRCodeData | string {
  try {
    const parsed = JSON.parse(qrData);
    if (parsed.data && parsed.expiresAt) {
      return parsed;
    }
    return qrData;
  } catch {
    return qrData;
  }
}

export function isQRCodeExpired(qrData: string): boolean {
  const parsed = parseQRCodeData(qrData);
  
  if (typeof parsed === 'string') {
    return false; // No expiration set
  }
  
  if (!parsed.expiresAt) {
    return false; // No expiration set
  }
  
  const expirationDate = new Date(parsed.expiresAt);
  return new Date() > expirationDate;
}

export function getQRCodeData(qrData: string): string {
  const parsed = parseQRCodeData(qrData);
  return typeof parsed === 'string' ? parsed : parsed.data;
} 