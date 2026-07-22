-- Create tables

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  business_type text NOT NULL CHECK (business_type IN ('clinic', 'salon')),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  default_price numeric NOT NULL,
  created_by text NOT NULL CHECK (created_by IN ('preset', 'manual')),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE stylists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_by text NOT NULL CHECK (created_by IN ('preset', 'manual')),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(org_id, phone)
);

CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  service_name_snapshot text NOT NULL,
  price numeric NOT NULL,
  stylist_id uuid REFERENCES stylists(id) ON DELETE SET NULL,
  stylist_name_snapshot text NOT NULL,
  booking_date date NOT NULL,
  time_slot text NOT NULL,
  status text NOT NULL CHECK (status IN ('confirmed', 'completed', 'no_show')),
  follow_up_date date,
  follow_up_note text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create Policies

-- Organizations: users can only see and manage their own org
CREATE POLICY "Users can manage their own org" ON organizations
  FOR ALL USING (auth.uid() = owner_user_id);

-- Services: users can manage services for their org
CREATE POLICY "Users can manage services for their org" ON services
  FOR ALL USING (org_id IN (SELECT id FROM organizations WHERE owner_user_id = auth.uid()));

-- Stylists: users can manage stylists for their org
CREATE POLICY "Users can manage stylists for their org" ON stylists
  FOR ALL USING (org_id IN (SELECT id FROM organizations WHERE owner_user_id = auth.uid()));

-- Customers: users can manage customers for their org
CREATE POLICY "Users can manage customers for their org" ON customers
  FOR ALL USING (org_id IN (SELECT id FROM organizations WHERE owner_user_id = auth.uid()));

-- Bookings: users can manage bookings for their org
CREATE POLICY "Users can manage bookings for their org" ON bookings
  FOR ALL USING (org_id IN (SELECT id FROM organizations WHERE owner_user_id = auth.uid()));
