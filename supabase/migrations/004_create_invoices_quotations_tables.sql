-- Migration: Create Invoices & Quotations System
-- This migration adds complete invoicing and quotation functionality

-- ============================================
-- QUOTATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  quotation_number text NOT NULL UNIQUE,
  title text,
  description text,
  services text,
  amount numeric NOT NULL DEFAULT 0,
  notes text,
  terms text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected')),
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quotations_client_id_idx ON quotations (client_id);
CREATE INDEX IF NOT EXISTS quotations_project_id_idx ON quotations (project_id);
CREATE INDEX IF NOT EXISTS quotations_status_idx ON quotations (status);
CREATE INDEX IF NOT EXISTS quotations_created_at_idx ON quotations (created_at DESC);

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  quotation_id uuid REFERENCES quotations(id) ON DELETE SET NULL,
  invoice_number text NOT NULL UNIQUE,
  title text,
  amount numeric NOT NULL DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  due_date date,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  payment_date date,
  notes text,
  terms text,
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS invoices_client_id_idx ON invoices (client_id);
CREATE INDEX IF NOT EXISTS invoices_project_id_idx ON invoices (project_id);
CREATE INDEX IF NOT EXISTS invoices_quotation_id_idx ON invoices (quotation_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices (status);
CREATE INDEX IF NOT EXISTS invoices_due_date_idx ON invoices (due_date);
CREATE INDEX IF NOT EXISTS invoices_created_at_idx ON invoices (created_at DESC);

-- ============================================
-- INVOICE ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS invoice_items_invoice_id_idx ON invoice_items (invoice_id);

-- ============================================
-- QUOTATION ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quotation_items_quotation_id_idx ON quotation_items (quotation_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;

-- Quotations policies
CREATE POLICY "Admins can do everything with quotations" ON quotations
  FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY "Members can view quotations" ON quotations
  FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'member')
  ));

-- Invoices policies
CREATE POLICY "Admins can do everything with invoices" ON invoices
  FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY "Members can view invoices" ON invoices
  FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'member')
  ));

-- Invoice items policies
CREATE POLICY "Admins can do everything with invoice_items" ON invoice_items
  FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY "Members can view invoice_items" ON invoice_items
  FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'member')
  ));

-- Quotation items policies
CREATE POLICY "Admins can do everything with quotation_items" ON quotation_items
  FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY "Members can view quotation_items" ON quotation_items
  FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'member')
  ));

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for quotations
CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for invoices
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ACTIVITY FEED COLUMN UPDATES
-- ============================================

-- Add quotation_id and invoice_id to activities table
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS quotation_id uuid,
  ADD COLUMN IF NOT EXISTS invoice_id uuid;