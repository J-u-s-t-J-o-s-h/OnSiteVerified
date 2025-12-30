-- Role Enum
create type user_role as enum ('admin', 'employee');

-- Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique,
  full_name text,
  role user_role default 'employee',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Job Sites Table
create table public.job_sites (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  radius_meters integer default 100,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Timesheets Table
create table public.timesheets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  site_id uuid references public.job_sites(id),
  clock_in_time timestamp with time zone default timezone('utc'::text, now()) not null,
  clock_out_time timestamp with time zone,
  clock_in_lat double precision,
  clock_in_lon double precision,
  status text default 'clocked_in', -- 'clocked_in', 'completed'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.job_sites enable row level security;
alter table public.timesheets enable row level security;

-- Policies
-- Profiles
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);

-- Job Sites
create policy "Admins can manage job sites." on job_sites for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Everyone can view job sites." on job_sites for select using (true);

-- Timesheets
create policy "Users can see their own timesheets." on timesheets for select using (auth.uid() = user_id);
create policy "Admins can see all timesheets." on timesheets for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Users can insert their own timesheets." on timesheets for insert with check (auth.uid() = user_id);
create policy "Users can update their own timesheets." on timesheets for update using (auth.uid() = user_id);

-- Auth Trigger
-- This ensures a profile is created whenever a user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'employee');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
