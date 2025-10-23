import QRCode from "qrcode";
import type { System } from "@shared/schema";

export interface QRPayload {
  idCode: string;
  labName: string;
  description: string;
  systemUrl: string;
}

export function createQRPayload(system: {
  idCode: string;
  labName: string;
  description: string;
  id: string;
}): QRPayload {
  // Use environment variable for API URL, fallback to localhost for development
  const baseUrl = process.env.API_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://your-backend-app.onrender.com' // Replace with your actual Render backend URL
      : 'http://localhost:5000');
  
  return {
    idCode: system.idCode,
    labName: system.labName,
    description: system.description,
    systemUrl: `${baseUrl}/system/${system.id}`,
  };
}

export async function generateQRCode(payload: QRPayload): Promise<Buffer> {
  const qrData = JSON.stringify(payload);
  
  const qrBuffer = await QRCode.toBuffer(qrData, {
    errorCorrectionLevel: "M",
    type: "png",
    width: 512,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  return qrBuffer;
}

export function getQRFileName(idCode: string): string {
  return `${idCode}.png`;
}
