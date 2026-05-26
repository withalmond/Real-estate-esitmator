-- Supabase schema for property walkthrough submissions.
-- Run this in the Supabase SQL editor before submitting walkthroughs.

create extension if not exists "pgcrypto";

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  room_type text not null,
  length_ft numeric(10, 2),
  width_ft numeric(10, 2),
  square_footage numeric(10, 2),
  notes text,
  image_urls text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists rooms_property_id_idx on public.rooms(property_id);

alter table public.properties enable row level security;
alter table public.rooms enable row level security;

-- The app writes through a serverless API route using SUPABASE_SERVICE_ROLE_KEY,
-- which bypasses RLS. No public table policies are required for anonymous users.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'room-images',
  'room-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
