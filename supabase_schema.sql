-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Users)
create table profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  location text,
  phone text,
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- MACHINERY LISTINGS
create table machinery_listings (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id) not null,
  title text not null,
  description text,
  type text check (type in ('rent', 'sale', 'both')),
  
  -- Pricing
  rent_price_daily numeric,
  sale_price numeric,
  is_negotiable boolean default false,
  
  -- Details
  category text, -- Tractor, Harvester, Implement
  brand text,
  model text,
  year integer,
  hp integer,
  
  -- Location & Media
  location text,
  location_lat numeric,
  location_lng numeric,
  images text[], -- Array of image URLs
  
  status text default 'active' check (status in ('active', 'sold', 'rented', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS POLICIES (Security)
alter table profiles enable row level security;
alter table machinery_listings enable row level security;

-- Public read access
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Listings are viewable by everyone." on machinery_listings for select using ( true );

-- Owner write access
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

create policy "Users can insert their own listings." on machinery_listings for insert with check ( auth.uid() = owner_id );
create policy "Users can update own listings." on machinery_listings for update using ( auth.uid() = owner_id );

-- STORAGE SETUP (Run this in Supabase SQL Editor if 'storage' schema is available)
-- insert into storage.buckets (id, name, public) values ('machinery-images', 'machinery-images', true);
-- create policy "Public Access" on storage.objects for select using ( bucket_id = 'machinery-images' );
-- create policy "Public Upload" on storage.objects for insert with check ( bucket_id = 'machinery-images' );
