import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function uploadQRCode(
  fileName: string,
  buffer: Buffer
): Promise<string> {
  const { data, error } = await supabase.storage
    .from("qr-codes")
    .upload(fileName, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload QR code: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from("qr-codes")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function deleteQRCode(fileName: string): Promise<void> {
  const { error } = await supabase.storage
    .from("qr-codes")
    .remove([fileName]);

  if (error) {
    console.error(`Failed to delete QR code: ${error.message}`);
  }
}

export async function getQRCodeBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Failed to fetch QR code:", error);
    return null;
  }
}
