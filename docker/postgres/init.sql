-- ================================
-- PostgreSQL Initialization Script
-- ================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS xuperb_admin;

-- Create user if not exists
DO
$$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE rolname = 'xuperb_user') THEN

      CREATE ROLE xuperb_user LOGIN PASSWORD 'xuperb_secure_password_2024';
   END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE xuperb_admin TO xuperb_user;

-- Connect to the database
\c xuperb_admin;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set search path
ALTER DATABASE xuperb_admin SET search_path TO public;

-- Create schema for audit logging (optional)
CREATE SCHEMA IF NOT EXISTS audit;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO xuperb_user;
GRANT ALL ON SCHEMA audit TO xuperb_user;

-- Insert initial data or create tables here if needed
-- This script runs only on initial database creation