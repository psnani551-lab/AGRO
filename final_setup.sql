-- MASTER SETUP SCRIPT for Smart Farming Marketplace
-- Run this ENTIRE script in your Supabase SQL Editor.

-- 1. Enable UUIDs
create extension if not exists "uuid-ossp";

-- 2. Create Profiles Table (Optional but good for structure)
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  location text,
  phone text,
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Create Machinery Listings Table
create table if not exists machinery_listings (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid, -- REMOVED strict foreign key for guest posting
  title text not null,
  description text,
  type text check (type in ('rent', 'sale', 'both')),
  
  -- Pricing
  rent_price_daily numeric,
  sale_price numeric,
  is_negotiable boolean default false,
  
  -- Details
  category text, 
  brand text,
  model text,
  year integer,
  hp integer,
  
  -- Location & Media
  location text,
  location_lat numeric,
  location_lng numeric,
  images text[], 
  
  -- Guest Contact Info
  contact_name text,
  contact_phone text,

  status text default 'active' check (status in ('active', 'sold', 'rented', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Create Messages Table (Real-Time Chat)
CREATE TABLE IF NOT EXISTS messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id uuid REFERENCES machinery_listings(id) ON DELETE CASCADE,
    content text NOT NULL,
    sender_type text DEFAULT 'buyer',
    created_at timestamptz DEFAULT now()
);

-- 5. Create Farm Profiles Table (Dashboard)
create table if not exists farm_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id), -- Optional link to auth
  farm_name text,
  location_address text,
  location_lat numeric,
  location_lng numeric,
  farm_size_acres numeric,
  soil_type text check (soil_type in ('clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky')),
  irrigation_type text check (irrigation_type in ('drip', 'sprinkler', 'flood', 'manual')),
  current_crops text[], -- Array of strings
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. Create Alerts Table
create table if not exists farm_alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  type text check (type in ('weather', 'pest', 'market', 'irrigation', 'general')),
  severity text check (severity in ('info', 'warning', 'critical')),
  title text,
  message text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 7. Create Storage Bucket for Images
insert into storage.buckets (id, name, public) 
values ('machinery-images', 'machinery-images', true)
on conflict (id) do nothing;

-- 8. SECURITY POLICIES (Allow Public Access for this Demo)
-- Enable RLS
alter table machinery_listings enable row level security;
alter table messages enable row level security;
alter table farm_profiles enable row level security;
alter table farm_alerts enable row level security;

-- Drop old policies to avoid conflicts
drop policy if exists "Public listings access" on machinery_listings;
drop policy if exists "Public messages access" on messages;
drop policy if exists "Public farm profiles access" on farm_profiles;
drop policy if exists "Public alerts access" on farm_alerts;
drop policy if exists "Public storage access" on storage.objects;
drop policy if exists "Public storage upload" on storage.objects;

-- Create OPEN Policies (Demo Mode)
create policy "Public listings access" on machinery_listings for select using ( true );
create policy "Public listings insert" on machinery_listings for insert with check ( true );

create policy "Public messages access" on messages for select using ( true );
create policy "Public messages insert" on messages for insert with check ( true );

create policy "Public farm profiles access" on farm_profiles for select using ( true );
create policy "Public farm profiles insert" on farm_profiles for insert with check ( true );

create policy "Public alerts access" on farm_alerts for select using ( true );
create policy "Public alerts insert" on farm_alerts for insert with check ( true );

create policy "Public storage access" on storage.objects for select using ( bucket_id = 'machinery-images' );
create policy "Public storage upload" on storage.objects for insert with check ( bucket_id = 'machinery-images' );

-- 7. Fix Owner ID constraints if table already existed with strict mode
ALTER TABLE machinery_listings DROP CONSTRAINT IF EXISTS machinery_listings_owner_id_fkey;
