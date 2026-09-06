-- ROLES ------------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('customer', 'staff', 'operator', 'admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES ----------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  community text,
  address text,
  notify_email boolean NOT NULL DEFAULT true,
  notify_sms boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PUBLIC CONTENT ----------------------------------------------------------
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'connectivity',
  icon text NOT NULL DEFAULT 'wifi',
  summary text NOT NULL,
  body text,
  highlights text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published services are public" ON public.services
  FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "Admins manage services" ON public.services
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'news',
  excerpt text,
  body text,
  external_url text,
  image_url text,
  published_at date NOT NULL DEFAULT current_date,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.resources TO anon, authenticated;
GRANT ALL ON public.resources TO service_role;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published resources are public" ON public.resources
  FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "Admins manage resources" ON public.resources
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text,
  description text,
  specifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published products are public" ON public.products
  FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "Admins manage products" ON public.products
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CUSTOMER DATA -----------------------------------------------------------
CREATE TABLE public.customer_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  plan text,
  status text NOT NULL DEFAULT 'active',
  location text,
  monthly_price numeric(10,2),
  started_on date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_services TO authenticated;
GRANT ALL ON public.customer_services TO service_role;
ALTER TABLE public.customer_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own services" ON public.customer_services
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference text NOT NULL DEFAULT ('AH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))),
  subject text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own tickets select" ON public.support_tickets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own tickets insert" ON public.support_tickets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own tickets update" ON public.support_tickets
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER support_tickets_updated_at BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL DEFAULT 'You',
  is_from_acsess boolean NOT NULL DEFAULT false,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ticket_messages TO authenticated;
GRANT ALL ON public.ticket_messages TO service_role;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Messages on own tickets" ON public.ticket_messages
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
  );
CREATE POLICY "Add messages to own tickets" ON public.ticket_messages
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
  );

CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  file_url text,
  size_label text,
  issued_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own documents" ON public.documents
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  organisation text,
  audience text,
  topic text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.enquiries TO anon, authenticated;
GRANT SELECT ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit an enquiry" ON public.enquiries
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read enquiries" ON public.enquiries
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- SEED CONTENT ------------------------------------------------------------
INSERT INTO public.services (slug, name, category, icon, summary, body, highlights, sort_order) VALUES
('village-internet', 'Village internet', 'connectivity', 'wifi',
 'Fast, reliable internet across an entire retirement village — delivered over existing wiring, with no digging and no rewiring.',
 'We deliver fast internet over existing copper networks using GFAST technology, with speeds ranging from 50 Mbps up to 1000 Mbps. Deployment is quick and simple, with no digging, no rewiring and no fuss, so residents stay connected while the upgrade happens around them.',
 ARRAY['50 Mbps to 1000 Mbps over existing copper','No digging or rewiring required','Village-wide Wi-Fi in homes and common areas','Monitored and managed by Acsess'], 1),
('matv-foxtel', 'Foxtel and MATV', 'entertainment', 'tv',
 'Village-wide television — Foxtel, free-to-air and MATV head-end systems designed for retirement and healthcare communities.',
 'Acsess designs, installs and maintains MATV head-end systems and Foxtel distribution across villages, hospitals and care communities, so every home and common room receives a clear, reliable picture.',
 ARRAY['Foxtel distribution across the community','MATV head-end design and maintenance','Free-to-air and digital channel support','Resident-level fault response'], 2),
('telephone', 'Telephone', 'connectivity', 'phone',
 'Resident and site telephone services, including nurse-call-friendly lines and reliable voice for people who rely on the phone every day.',
 'Voice services engineered for older residents and care environments — dependable dial tone, simple handsets, clear billing and support from an Australian team who understand the setting.',
 ARRAY['Resident phone lines and site voice','Clear, itemised billing','Australian-based customer support','Works alongside existing nurse-call systems'], 3),
('thermal-imaging', 'Thermal imaging and safety', 'safety', 'thermometer',
 'Thermal imaging solutions that detect heat risk early — helping protect residents, staff and property.',
 'Thermal imaging cameras and monitoring detect abnormal heat signatures in switchboards, plant rooms and charging areas before they become incidents.',
 ARRAY['Early heat and fire risk detection','Switchboard and plant room monitoring','Integrates with site safety procedures','Reporting for operators and boards'], 4),
('das-mobile-coverage', 'DAS and mobile coverage', 'connectivity', 'radio-tower',
 'Carrier-grade Distributed Antenna Systems that eliminate mobile blackspots across buildings and campuses.',
 'As industry leaders in high-performance internet infrastructure, advanced MATV systems and carrier-grade DAS, we eliminate blackspots and improve reception through buildings, basements and campuses.',
 ARRAY['Carrier-grade Distributed Antenna Systems','Blackspot elimination in buildings and basements','Coverage for residents, staff and emergency services','Designed for multi-building campuses'], 5),
('facial-recognition', 'Facial recognition and access', 'safety', 'scan-face',
 'Facial recognition and access technology for controlled entries, visitor management and resident safety.',
 'Access technology that keeps entries controlled without making residents feel policed — supporting visitor management, staff access and after-hours security.',
 ARRAY['Contactless resident and staff access','Visitor and contractor management','Works with existing door hardware','Privacy-considered deployment'], 6);

INSERT INTO public.products (slug, name, tagline, description, specifications) VALUES
('switchstar', 'SWITCH STAR',
 'A revolutionary solution to lithium-ion battery risks.',
 'The SWITCH STAR is an Australian-designed power outlet built to help protect your property: safe outlets, safe spaces. Recognising the risk of overcharging lithium-ion batteries in mobility devices, e-bikes and scooters, it automatically cuts power after eight hours of charging — reducing fire risk in homes, villages and care communities.',
 '[{"label":"Design","value":"Australian-designed double GPO"},{"label":"Safety feature","value":"Automatic 8-hour charging cut-off"},{"label":"Rating","value":"10A x 2"},{"label":"Finishes","value":"White and black"},{"label":"Application","value":"Mobility devices, e-bikes, scooters and general use"},{"label":"Standards","value":"Manufactured to Australian electrical standards"}]'::jsonb);

INSERT INTO public.resources (slug, title, kind, excerpt, external_url, published_at) VALUES
('introducing-a-revolutionary-new-safety-product', 'Introducing a Revolutionary New Safety Product', 'news',
 'Protection for the home and the environment. Managing Director John O''Callaghan recognised a gap in the market for a product that automatically switches off and safeguards mobility devices.',
 'https://acsess.com.au/introducing-a-revolutionary-new-safety-product/', '2024-01-15'),
('shaping-the-future-insights-from-the-retirement-outlook-2024', 'Shaping the Future: Insights from the Retirement Outlook 2024', 'news',
 'Reflections on what the Retirement Outlook 2024 means for connectivity and technology in retirement living.',
 'https://acsess.com.au/shaping-the-future-insights-from-the-retirement-outlook-2024/', '2024-03-12'),
('acsess-health-20-years', 'Acsess Health 20 Years', 'news',
 'Twenty years of building and supporting networks for retirement living, healthcare and care communities across Australia.',
 'https://acsess.com.au/acsess-health-20-years/', '2024-02-20'),
('reflections-on-the-nrl-summit-2024', 'Reflections on the NRL Summit 2024', 'news',
 'Acsess Health sponsored the Revitalisation category and exhibited the Switch Star power outlet at the National Retirement Living Summit.',
 'https://acsess.com.au/reflections-on-the-nrl-summit-2024/', '2024-07-08'),
('village-summit-2024-announcement', 'Village Summit 2024 Announcement', 'news',
 'Acsess Health at the Village Summit 2024.',
 'https://acsess.com.au/village-summit-2024-announcement/', '2024-11-04'),
('true-solar-announcement', 'True Solar announcement', 'news',
 'A new partnership announcement from the Acsess Health team.',
 'https://acsess.com.au/true-solar-announcement/', '2024-05-16');

INSERT INTO public.resources (slug, title, kind, excerpt, body, published_at) VALUES
('faq-internet-slow', 'My internet feels slow — what should I check first?', 'faq',
 'Simple first steps before you call us.',
 'Restart your modem by switching it off at the wall, waiting thirty seconds, and switching it back on. Wait two minutes for the lights to settle. If it is still slow, check whether other devices in the home are also affected, then call us on 1300 736 785 or raise a support request in your account.',
 '2024-01-01'),
('faq-tv-no-signal', 'My television says "no signal"', 'faq',
 'What a no-signal message usually means.',
 'A no-signal message usually means the wall outlet connection has come loose. Check the cable at the back of the television and at the wall. If both are firm and the message remains, it may be a village-wide issue — call 1300 736 785 and we will check the head-end for you.',
 '2024-01-01'),
('faq-moving-in', 'I am moving into a village — how do I get connected?', 'faq',
 'Getting connected in a village Acsess already services.',
 'If Acsess services your village, contact us with your village name and unit number and we will arrange connection, usually without any new cabling. Your village manager can also lodge the request on your behalf.',
 '2024-01-01');