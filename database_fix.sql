-- RUN THIS IN SUPABASE SQL EDITOR TO FIX "Failed to Post" ERROR

-- 1. Allow 'owner_id' to point to purely mock users (remove strict link to real auth users)
ALTER TABLE machinery_listings DROP CONSTRAINT IF EXISTS machinery_listings_owner_id_fkey;

-- 2. Add Contact Name and Phone for "Guest" postings
ALTER TABLE machinery_listings ADD COLUMN IF NOT EXISTS contact_name text;
ALTER TABLE machinery_listings ADD COLUMN IF NOT EXISTS contact_phone text;

-- 3. Create the Storage Bucket for images (if not exists)
insert into storage.buckets (id, name, public) 
values ('machinery-images', 'machinery-images', true)
on conflict (id) do nothing;

-- 4. Create Messages table for Real-Time Chat
CREATE TABLE IF NOT EXISTS messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id uuid REFERENCES machinery_listings(id) ON DELETE CASCADE,
    content text NOT NULL,
    sender_type text DEFAULT 'buyer', -- 'buyer' or 'owner'
    created_at timestamptz DEFAULT now()
);

-- 5. Open Access Policy for Demo (Disable RLS or allow all)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON messages FOR UPDATE USING (true);

-- 4. Allow Public Uploads to Storage
create policy "Public Upload" on storage.objects 
for insert with check ( bucket_id = 'machinery-images' );

create policy "Public Access" on storage.objects 
for select using ( bucket_id = 'machinery-images' );

-- 4. Insert a mock profile just in case (optional if FK dropped, but good for joins)
-- This might fail if '0000...' is not in auth.users, so we only run it if we removed the FK above.
-- If you kept the FK, you'd need a real user. 
