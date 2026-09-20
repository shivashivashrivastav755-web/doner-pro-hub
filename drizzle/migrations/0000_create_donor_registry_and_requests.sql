-- Donor Pro Connect: public donor registry + live blood request board

CREATE TABLE public.donors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  blood_group text NOT NULL,
  city text NOT NULL,
  phone text NOT NULL,
  last_donation date,
  note text,
  available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT donors_blood_group_check CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  CONSTRAINT donors_name_check CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 80),
  CONSTRAINT donors_city_check CHECK (char_length(btrim(city)) BETWEEN 2 AND 60),
  CONSTRAINT donors_phone_check CHECK (char_length(btrim(phone)) BETWEEN 6 AND 20)
);

CREATE INDEX donors_group_city_idx ON public.donors (blood_group, city);
CREATE INDEX donors_created_idx ON public.donors (created_at DESC);

GRANT SELECT, INSERT ON public.donors TO anon, authenticated;
GRANT ALL ON public.donors TO service_role;

ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can browse donors" ON public.donors
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can register as a donor" ON public.donors
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_ref text NOT NULL,
  blood_group text NOT NULL,
  units integer NOT NULL DEFAULT 1,
  city text NOT NULL,
  hospital text,
  contact text NOT NULL,
  message text,
  urgency text NOT NULL DEFAULT 'soon',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '14 days',
  CONSTRAINT requests_blood_group_check CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  CONSTRAINT requests_units_check CHECK (units BETWEEN 1 AND 20),
  CONSTRAINT requests_urgency_check CHECK (urgency IN ('critical','soon','planned')),
  CONSTRAINT requests_status_check CHECK (status IN ('open','fulfilled')),
  CONSTRAINT requests_patient_check CHECK (char_length(btrim(patient_ref)) BETWEEN 2 AND 60),
  CONSTRAINT requests_city_check CHECK (char_length(btrim(city)) BETWEEN 2 AND 60),
  CONSTRAINT requests_contact_check CHECK (char_length(btrim(contact)) BETWEEN 6 AND 60)
);

CREATE INDEX requests_open_idx ON public.requests (status, expires_at DESC, created_at DESC);

GRANT SELECT, INSERT ON public.requests TO anon, authenticated;
GRANT ALL ON public.requests TO service_role;

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can browse requests" ON public.requests
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can post a request" ON public.requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Demo seed data so the board is usable on first visit
INSERT INTO public.donors (full_name, blood_group, city, phone, last_donation, note, available, created_at) VALUES
  ('Ananya Bose', 'O+', 'Kolkata', '+91 98300 41127', DATE '2026-06-14', 'Available weekday mornings after 10 am.', true, now() - interval '41 days'),
  ('Rohit Sen', 'A+', 'Howrah', '+91 98311 77205', DATE '2026-07-02', 'Near Howrah station, can travel across the city.', true, now() - interval '38 days'),
  ('Meera Iyer', 'B+', 'Salt Lake', '+91 98367 20981', DATE '2026-05-20', 'Willing for platelet donation too.', true, now() - interval '35 days'),
  ('Farhan Ahmed', 'O-', 'New Town', '+91 99030 66412', DATE '2026-08-01', 'Rare negative group — call any time.', true, now() - interval '30 days'),
  ('Sreya Das', 'AB+', 'Kolkata', '+91 90070 33891', DATE '2026-06-28', NULL, true, now() - interval '26 days'),
  ('Vikram Rao', 'A-', 'Behala', '+91 98305 12448', DATE '2026-04-11', 'Can donate within 2 hours of a call.', true, now() - interval '22 days'),
  ('Priya Nair', 'B-', 'Dum Dum', '+91 98744 90233', DATE '2026-07-19', 'Available after office hours.', true, now() - interval '18 days'),
  ('Imran Sheikh', 'O+', 'Barasat', '+91 98322 45610', DATE '2026-08-12', NULL, true, now() - interval '12 days'),
  ('Kabir Ghosh', 'AB-', 'Kolkata', '+91 98301 88277', DATE '2026-03-30', 'Happy to help for emergencies.', true, now() - interval '8 days'),
  ('Nabanita Roy', 'O+', 'Barrackpore', '+91 99035 71120', DATE '2026-08-25', 'First donation done, ready for the next.', true, now() - interval '4 days');

INSERT INTO public.requests (patient_ref, blood_group, units, city, hospital, contact, message, urgency, status, created_at, expires_at) VALUES
  ('R. K., 34', 'O-', 2, 'Kolkata', 'Medical Research Institute', '+91 98310 55018', 'Road accident victim, surgery scheduled this afternoon. Negative O donors urgently needed.', 'critical', 'open', now() - interval '6 hours', now() + interval '13 days'),
  ('Baby A., 9 days', 'B+', 1, 'Howrah', 'Shibpur State General Hospital', '+91 98311 40276', 'Newborn jaundice, exchange transfusion may be required within 24 hours.', 'critical', 'open', now() - interval '1 day', now() + interval '13 days'),
  ('S. Mukherjee, 61', 'A+', 3, 'Salt Lake', 'Apollo Gleneagles', '+91 98367 11440', 'Scheduled cardiac bypass next Monday. Looking for three donors to join the registry.', 'soon', 'open', now() - interval '2 days', now() + interval '12 days'),
  ('T. Biswas, 28', 'AB-', 1, 'New Town', 'Rabindranath Tagore Hospital', '+91 99030 22817', 'Dengue with low platelet count. Platelet apheresis donor needed.', 'critical', 'open', now() - interval '3 days', now() + interval '11 days'),
  ('Cancer ward drive', 'O+', 6, 'Kolkata', 'Tata Medical, Belle Busta', '+91 90070 61903', 'Monthly thalassaemia and oncology ward drive. Donors can book any weekend slot.', 'planned', 'open', now() - interval '5 days', now() + interval '9 days');