-- Enable UUID extension
CREATE OR REPLACE FUNCTION public.enable_uuid_extension()
RETURNS void AS $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to execute SQL
CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;