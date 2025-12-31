
-- Farm Alerts Table for Dashboard Integration
create table if not exists farm_alerts (
    id uuid default uuid_generate_v4() primary key,
    type text check (type in ('weather', 'pest', 'market', 'general')),
    severity text check (severity in ('info', 'warning', 'critical')),
    title text not null,
    message text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    is_read boolean default false
);

create policy "Alerts are viewable by everyone (demo)" on farm_alerts for select using ( true );
create policy "Alerts are insertable by everyone (demo)" on farm_alerts for insert with check ( true );
create policy "Alerts are updatable by everyone (demo)" on farm_alerts for update using ( true );
