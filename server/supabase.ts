// ✅ server/supabase.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Always load .env from the server folder explicitly
dotenv.config({ path: path.resolve(__dirname, ".env") });

// ✅ Check environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error("Expected .env at:", path.resolve(__dirname, ".env"));
  throw new Error("Missing Supabase environment variables");
}

// ✅ Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log("✅ Supabase initialized successfully!");

// ✅ Utility: upload QR code
export async function uploadQRCode(fileName: string, buffer: Buffer): Promise<string> {
  const { data, error } = await supabase.storage
    .from("qr-codes")
    .upload(fileName, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) throw new Error(`Failed to upload QR code: ${error.message}`);

  const { data: urlData } = supabase.storage.from("qr-codes").getPublicUrl(data.path);
  return urlData.publicUrl;
}

// ✅ Utility: delete QR code
export async function deleteQRCode(fileName: string): Promise<void> {
  const { error } = await supabase.storage.from("qr-codes").remove([fileName]);
  if (error) console.error(`Failed to delete QR code: ${error.message}`);
  else console.log(`✅ Deleted QR code: ${fileName}`);
}

// ✅ Utility: fetch QR code buffer
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
