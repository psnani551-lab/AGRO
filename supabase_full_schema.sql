-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Users)
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  email text,
  location text,
  phone text,
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- FARM PROFILES
create table if not exists farm_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  farm_name text,
  location text,
  sub_district text,
  district text,
  state text,
  country text,
  latitude numeric,
  longitude numeric,
  total_area numeric, -- in acres
  soil_type text,
  irrigation_source text,
  
  -- Current Status
  current_crops text[], -- Array of strings
  sowing_date date,
  
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- ALERTS
create table if not exists alerts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  type text check (type in ('weather', 'market', 'disease', 'pest', 'general')),
  severity text check (severity in ('low', 'medium', 'high', 'critical')),
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- SUSTAINABILITY METRICS
create table if not exists sustainability_metrics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  eco_score numeric default 0,
  water_efficiency numeric default 0,
  fertilizer_usage_score numeric default 0,
  soil_health_score numeric default 0,
  carbon_footprint_score numeric default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- MACHINERY LISTINGS (Marketplace)
create table if not exists machinery_listings (
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
  
  status text default 'active' check (status in ('active', 'sold', 'rented', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- CHAT HISTORY
create table if not exists chat_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  session_id uuid, -- For grouping messages
  role text check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS POLICIES (Security)
alter table profiles enable row level security;
alter table farm_profiles enable row level security;
alter table alerts enable row level security;
alter table sustainability_metrics enable row level security;
alter table machinery_listings enable row level security;
alter table chat_history enable row level security;

-- DROP EXISTING POLICIES TO AVOID DUPLICATION ERRORS
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;

drop policy if exists "Users can view own farm profile." on farm_profiles;
drop policy if exists "Users can insert own farm profile." on farm_profiles;
drop policy if exists "Users can update own farm profile." on farm_profiles;

drop policy if exists "Users can view own alerts." on alerts;
drop policy if exists "Users can management own alerts." on alerts;

drop policy if exists "Users can view own metrics." on sustainability_metrics;
drop policy if exists "Users can manage own metrics." on sustainability_metrics;

drop policy if exists "Listings are viewable by everyone." on machinery_listings;
drop policy if exists "Users can insert own listings." on machinery_listings;
drop policy if exists "Users can update own listings." on machinery_listings;

drop policy if exists "Users can view own chat." on chat_history;
drop policy if exists "Users can insert own chat." on chat_history;

-- CREATE POLICIES
-- PROFILES Policies
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- FARM PROFILES Policies
create policy "Users can view own farm profile." on farm_profiles for select using ( auth.uid() = user_id );
create policy "Users can insert own farm profile." on farm_profiles for insert with check ( auth.uid() = user_id );
create policy "Users can update own farm profile." on farm_profiles for update using ( auth.uid() = user_id );

-- ALERTS Policies
create policy "Users can view own alerts." on alerts for select using ( auth.uid() = user_id );
create policy "Users can management own alerts." on alerts for all using ( auth.uid() = user_id );

-- SUSTAINABILITY Policies
create policy "Users can view own metrics." on sustainability_metrics for select using ( auth.uid() = user_id );
create policy "Users can manage own metrics." on sustainability_metrics for all using ( auth.uid() = user_id );

-- MACHINERY Policies
create policy "Listings are viewable by everyone." on machinery_listings for select using ( true );
create policy "Users can insert own listings." on machinery_listings for insert with check ( auth.uid() = owner_id );
create policy "Users can update own listings." on machinery_listings for update using ( auth.uid() = owner_id );

-- CHAT Policies
create policy "Users can view own chat." on chat_history for select using ( auth.uid() = user_id );
create policy "Users can insert own chat." on chat_history for insert with check ( auth.uid() = user_id );

-- TRIGGERS
-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid duplication error (Postgres doesn't support DROP TRIGGER IF EXISTS cleanly in one line for all versions, but we can wrap it)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- STORAGE BUCKETS (Optional - run only if buckets don't exist)
insert into storage.buckets (id, name, public) 
values ('machinery-images', 'machinery-images', true)
on conflict (id) do nothing;

create policy "Public Access" on storage.objects for select using ( bucket_id = 'machinery-images' );
create policy "Public Upload" on storage.objects for insert with check ( bucket_id = 'machinery-images' );
