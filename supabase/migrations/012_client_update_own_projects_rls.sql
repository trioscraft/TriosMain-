-- ============================================
-- 012_client_update_own_projects_rls.sql
-- ============================================
-- Clients can update details of their own projects (due date, budget,
-- description, start date backfill). Without this policy, a client UPDATE on
-- projects is silently filtered by RLS to 0 rows, which makes PostgREST
-- `.single()` fail with PGRST116 "Cannot coerce the result to a single JSON
-- object".
--
-- client_users.id == auth.users.id (portal login), and projects.client_id
-- points to clients(id). client_users has RLS disabled, so the subselect is
-- readable by the client role.

drop policy if exists "Clients can update their own projects" on public.projects;

create policy "Clients can update their own projects"
  on public.projects
  for update
  to authenticated
  using (
    client_id in (
      select cu.client_id from public.client_users cu where cu.id = auth.uid()
    )
  )
  with check (
    client_id in (
      select cu.client_id from public.client_users cu where cu.id = auth.uid()
    )
  );
