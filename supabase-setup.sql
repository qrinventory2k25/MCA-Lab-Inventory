-- Create systems table
CREATE TABLE IF NOT EXISTS systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_code VARCHAR(20) UNIQUE NOT NULL,
    lab_name VARCHAR(10) NOT NULL,
    description TEXT DEFAULT 'INTEL CORE 2 DUO 2.90 GHZ, 4GB RAM, 360GB HDD, LED MONITOR, KB & MOUSE',
    qr_image_url TEXT,
    qr_payload TEXT,
    system_url TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Create storage bucket for QR codes
INSERT INTO storage.buckets (id, name, public)
VALUES ('qr-codes', 'qr-codes', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies to allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'qr-codes');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'qr-codes');

CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'qr-codes');

CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'qr-codes');

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_systems_lab_name ON systems(lab_name);
CREATE INDEX IF NOT EXISTS idx_systems_id_code ON systems(id_code);
