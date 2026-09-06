-- helper: staff or admin
CREATE OR REPLACE FUNCTION public.is_acsess_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('staff','admin'))
$$;

-- ORGANISATIONS -----------------------------------------------------------
CREATE TABLE public.organisations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  kind text NOT NULL DEFAULT 'operator',
  contact_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.organisations TO authenticated;
GRANT ALL ON public.organisations TO service_role;
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.organisation_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, user_id)
);
GRANT SELECT ON public.organisation_members TO authenticated;
GRANT ALL ON public.organisation_members TO service_role;
ALTER TABLE public.organisation_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _organisation_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organisation_members
    WHERE user_id = _user_id AND organisation_id = _organisation_id
  )
$$;

CREATE POLICY "Members read own organisation" ON public.organisations
  FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), id) OR public.is_acsess_staff(auth.uid()));
CREATE POLICY "Admins manage organisations" ON public.organisations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Read own membership rows" ON public.organisation_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_acsess_staff(auth.uid()));
CREATE POLICY "Admins manage memberships" ON public.organisation_members
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- SITES -------------------------------------------------------------------
CREATE TABLE public.sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  suburb text,
  state text,
  dwellings integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'live',
  services text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sites TO authenticated;
GRANT ALL ON public.sites TO service_role;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read their sites" ON public.sites
  FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), organisation_id) OR public.is_acsess_staff(auth.uid()));
CREATE POLICY "Admins manage sites" ON public.sites
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PROJECTS ----------------------------------------------------------------
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  site_id uuid REFERENCES public.sites(id) ON DELETE SET NULL,
  name text NOT NULL,
  summary text,
  stage text NOT NULL DEFAULT 'design',
  status text NOT NULL DEFAULT 'on_track',
  progress integer NOT NULL DEFAULT 0,
  target_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read their projects" ON public.projects
  FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), organisation_id) OR public.is_acsess_staff(auth.uid()));
CREATE POLICY "Admins manage projects" ON public.projects
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  due_on date,
  status text NOT NULL DEFAULT 'pending',
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.project_milestones TO authenticated;
GRANT ALL ON public.project_milestones TO service_role;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read their milestones" ON public.project_milestones
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
      AND (public.is_org_member(auth.uid(), p.organisation_id) OR public.is_acsess_staff(auth.uid()))
  ));
CREATE POLICY "Admins manage milestones" ON public.project_milestones
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- TICKETS: link to a site, staff access ------------------------------------
ALTER TABLE public.support_tickets ADD COLUMN site_id uuid REFERENCES public.sites(id) ON DELETE SET NULL;
GRANT DELETE ON public.support_tickets TO authenticated;

CREATE POLICY "Staff read all tickets" ON public.support_tickets
  FOR SELECT TO authenticated USING (public.is_acsess_staff(auth.uid()));
CREATE POLICY "Staff update all tickets" ON public.support_tickets
  FOR UPDATE TO authenticated
  USING (public.is_acsess_staff(auth.uid())) WITH CHECK (public.is_acsess_staff(auth.uid()));
CREATE POLICY "Operators read tickets at their sites" ON public.support_tickets
  FOR SELECT TO authenticated USING (
    site_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.sites s
      WHERE s.id = site_id AND public.is_org_member(auth.uid(), s.organisation_id)
    )
  );

CREATE POLICY "Staff read all ticket messages" ON public.ticket_messages
  FOR SELECT TO authenticated USING (public.is_acsess_staff(auth.uid()));
CREATE POLICY "Staff reply to tickets" ON public.ticket_messages
  FOR INSERT TO authenticated WITH CHECK (public.is_acsess_staff(auth.uid()));

CREATE POLICY "Staff read profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_acsess_staff(auth.uid()));
CREATE POLICY "Staff read customer services" ON public.customer_services
  FOR SELECT TO authenticated USING (public.is_acsess_staff(auth.uid()));
CREATE POLICY "Staff read enquiries" ON public.enquiries
  FOR SELECT TO authenticated USING (public.is_acsess_staff(auth.uid()));
CREATE POLICY "Admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- DEMO ORGANISATIONS, SITES AND PROJECTS -----------------------------------
INSERT INTO public.organisations (id, name, slug, kind, contact_email) VALUES
('11111111-1111-4111-8111-111111111111', 'Riverbend Living Group', 'riverbend-living', 'operator', 'operations@riverbendliving.example'),
('22222222-2222-4222-8222-222222222222', 'Northshore Developments', 'northshore-developments', 'developer', 'projects@northshoredev.example');

INSERT INTO public.sites (id, organisation_id, name, address, suburb, state, dwellings, status, services) VALUES
('aaaaaaaa-0001-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Riverbend Gardens', '18 Riverbend Drive', 'Castle Hill', 'NSW', 148, 'live', ARRAY['Village internet','Foxtel and MATV','Telephone']),
('aaaaaaaa-0001-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'Riverbend Waters', '2 Marina Parade', 'Shellharbour', 'NSW', 96, 'live', ARRAY['Village internet','DAS and mobile coverage']),
('aaaaaaaa-0001-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'Riverbend Meadows', '55 Meadow Road', 'Bendigo', 'VIC', 62, 'installing', ARRAY['Village internet','Thermal imaging and safety']),
('bbbbbbbb-0002-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Northshore Stage 3', 'Lot 42 Harbour Way', 'Gosford', 'NSW', 120, 'planning', ARRAY['Village internet','Foxtel and MATV','SWITCH STAR']);

INSERT INTO public.projects (id, organisation_id, site_id, name, summary, stage, status, progress, target_date) VALUES
('cccccccc-0003-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'bbbbbbbb-0002-4000-8000-000000000001', 'Northshore Stage 3 — network build', 'Full village network, MATV head-end and SWITCH STAR outlets across 120 dwellings.', 'design', 'on_track', 35, '2026-11-30'),
('cccccccc-0003-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-0001-4000-8000-000000000003', 'Riverbend Meadows — internet rollout', 'Village-wide internet over existing wiring, 62 dwellings.', 'installation', 'at_risk', 68, '2026-10-15');

INSERT INTO public.project_milestones (project_id, title, due_on, status, sort_order) VALUES
('cccccccc-0003-4000-8000-000000000001', 'Site survey and design sign-off', '2026-07-15', 'complete', 1),
('cccccccc-0003-4000-8000-000000000001', 'Head-end equipment ordered', '2026-08-20', 'complete', 2),
('cccccccc-0003-4000-8000-000000000001', 'Cabling to dwellings', '2026-10-05', 'in_progress', 3),
('cccccccc-0003-4000-8000-000000000001', 'Resident connection and handover', '2026-11-30', 'pending', 4),
('cccccccc-0003-4000-8000-000000000002', 'Existing wiring assessment', '2026-06-30', 'complete', 1),
('cccccccc-0003-4000-8000-000000000002', 'Head-end installation', '2026-08-30', 'complete', 2),
('cccccccc-0003-4000-8000-000000000002', 'Dwelling activations', '2026-10-01', 'in_progress', 3),
('cccccccc-0003-4000-8000-000000000002', 'Resident information sessions', '2026-10-15', 'pending', 4);