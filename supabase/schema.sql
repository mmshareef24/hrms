-- Supabase/PostgreSQL schema for the HRMS Matrix application
-- Generated to cover core modules: Employees, Time & Attendance, Payroll,
-- Travel & Expense, Loans, Documents, Onboarding, and Approvals.

-- Enable required extensions (Supabase has some preinstalled)
create extension if not exists pgcrypto;

-- =====================
-- Enums
-- =====================
create type role_enum as enum ('SUPER_ADMIN','HR_ADMIN','MANAGER','EMPLOYEE');
create type employee_status_enum as enum ('Active','Inactive','On_Leave','On_Probation','Terminated');
create type claim_status_enum as enum ('Draft','Submitted','Approved','Rejected');
create type loan_status_enum as enum ('Draft','Submitted','Approved','Rejected','Disbursed','Closed','Cancelled');
create type payroll_status_enum as enum ('Draft','Approved','Paid');
create type attendance_status_enum as enum ('Present','Absent','Late','Excused');
create type currency_enum as enum ('SAR','USD','EUR','AED');

-- =====================
-- Core Org
-- =====================
create table if not exists company (
  id uuid primary key default gen_random_uuid(),
  company_code text unique not null,
  company_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists department (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references company(id) on delete cascade,
  name text not null,
  cost_center text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  unique(company_id, name)
);

create table if not exists shift (
  id uuid primary key default gen_random_uuid(),
  shift_name text not null,
  is_active boolean not null default true,
  start_time time,
  end_time time,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists employee (
  id uuid primary key default gen_random_uuid(),
  employee_id text unique,
  full_name text not null,
  full_name_arabic text,
  nationality text,
  country_of_origin text,
  work_email text unique,
  mobile text,
  department text,
  job_title text,
  employment_type text,
  join_date date,
  company_id uuid references company(id) on delete set null,
  company_name text,
  shift_id uuid references shift(id) on delete set null,
  shift_name text,
  manager_id uuid references employee(id) on delete set null,
  manager_name text,
  role role_enum default 'EMPLOYEE',
  status employee_status_enum default 'Active',
  basic_salary numeric(12,2) default 0,
  housing_allowance numeric(12,2) default 0,
  transportation_allowance numeric(12,2) default 0,
  annual_leave_balance int default 0,
  sick_leave_balance int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists idx_employee_company on employee(company_id);
create index if not exists idx_employee_manager on employee(manager_id);

-- =====================
-- Time & Attendance
-- =====================
create table if not exists timesheet (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employee(id) on delete cascade,
  date date not null,
  hours_worked numeric(6,2) default 0,
  status attendance_status_enum,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  unique(employee_id, date)
);
create index if not exists idx_timesheet_employee_date on timesheet(employee_id, date);

create table if not exists time_log (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employee(id) on delete cascade,
  date date not null,
  clock_in timestamptz,
  clock_out timestamptz,
  hours numeric(6,2) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists idx_time_log_employee_date on time_log(employee_id, date);

create table if not exists punch_record (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employee(id) on delete cascade,
  punch_datetime timestamptz not null,
  punch_type text check (punch_type in ('IN','OUT')),
  location text,
  created_at timestamptz not null default now()
);
create index if not exists idx_punch_employee_dt on punch_record(employee_id, punch_datetime);

create table if not exists attendance_exception (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employee(id) on delete cascade,
  date date not null,
  reason text,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- =====================
-- Leave Management
-- =====================
create table if not exists leave_type (
  id uuid primary key default gen_random_uuid(),
  leave_type_name text not null,
  leave_category text,
  is_active boolean not null default true
);

create table if not exists leave_request (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employee(id) on delete cascade,
  type_id uuid not null references leave_type(id) on delete restrict,
  start_date date not null,
  end_date date not null,
  total_days int not null,
  status text default 'Submitted',
  approved_by uuid references employee(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists idx_leave_request_employee on leave_request(employee_id);

create table if not exists leave_balance (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employee(id) on delete cascade,
  type_id uuid not null references leave_type(id) on delete cascade,
  balance int not null default 0,
  unique(employee_id, type_id)
);

-- =====================
-- Payroll
-- =====================
create table if not exists payroll (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employee(id) on delete cascade,
  company_id uuid references company(id) on delete set null,
  month int not null check (month between 1 and 12),
  year int not null check (year between 2000 and 2100),
  basic_salary numeric(12,2) default 0,
  housing_allowance numeric(12,2) default 0,
  transportation_allowance numeric(12,2) default 0,
  gosi_employee numeric(12,2) default 0,
  gosi_employer numeric(12,2) default 0,
  other_deductions numeric(12,2) default 0,
  absence_deduction numeric(12,2) default 0,
  net_pay numeric(12,2) default 0,
  status payroll_status_enum default 'Draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  unique(employee_id, month, year)
);
create index if not exists idx_payroll_emp_period on payroll(employee_id, year, month);

create table if not exists pay_component (
  id uuid primary key default gen_random_uuid(),
  component_name text not null,
  component_type text check (component_type in ('Allowance','Deduction')),
  default_amount numeric(12,2) default 0,
  is_active boolean default true
);

create table if not exists employee_pay_structure (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employee(id) on delete cascade,
  component_id uuid not null references pay_component(id) on delete cascade,
  amount numeric(12,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  unique(employee_id, component_id)
);

-- =====================
-- Loans & Advances
-- =====================
create table if not exists loan_product (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  currency currency_enum not null default 'SAR',
  max_concurrent_per_employee int default 1,
  exclude_probation boolean default false,
  is_active boolean default true
);

create table if not exists loan_account (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employee(id) on delete cascade,
  product_id uuid not null references loan_product(id) on delete restrict,
  principal_amount numeric(12,2) not null,
  currency currency_enum not null default 'SAR',
  status loan_status_enum not null default 'Submitted',
  applied_date date default current_date,
  approved_by uuid references employee(id) on delete set null,
  approved_date date,
  disbursed_date date,
  closed_date date,
  comments text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists idx_loan_account_employee on loan_account(employee_id);

create table if not exists salary_advance (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employee(id) on delete cascade,
  amount numeric(12,2) not null,
  currency currency_enum not null default 'SAR',
  status text default 'Submitted',
  created_at timestamptz not null default now()
);

create table if not exists eosb (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employee(id) on delete cascade,
  resignation_date date,
  last_working_day date,
  settlement_amount numeric(12,2) default 0,
  status text default 'Draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists asset_assignment (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employee(id) on delete cascade,
  asset_tag text,
  asset_name text,
  assigned_date date,
  returned_date date,
  status text,
  created_at timestamptz not null default now()
);

-- =====================
-- Documents & Compliance
-- =====================
create table if not exists document (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employee(id) on delete cascade,
  document_type text not null,
  file_url text not null,
  issue_date date,
  expiry_date date,
  status text,
  created_at timestamptz not null default now()
);
create index if not exists idx_document_employee on document(employee_id);

-- =====================
-- Onboarding
-- =====================
create table if not exists onboarding_checklist (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employee(id) on delete cascade,
  status text default 'In Progress',
  created_at timestamptz not null default now()
);

create table if not exists onboarding_task (
  id uuid primary key default gen_random_uuid(),
  onboarding_id uuid not null references onboarding_checklist(id) on delete cascade,
  task_name text not null,
  task_category text,
  assigned_to_role role_enum default 'EMPLOYEE',
  status text default 'Pending',
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists onboarding_document (
  id uuid primary key default gen_random_uuid(),
  onboarding_id uuid not null references onboarding_checklist(id) on delete cascade,
  document_type text not null,
  status text default 'Pending',
  file_url text,
  created_at timestamptz not null default now()
);

-- =====================
-- Travel & Expense
-- =====================
create table if not exists travel_request (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employee(id) on delete cascade,
  destination text,
  start_date date,
  end_date date,
  purpose text,
  status text default 'Submitted',
  created_at timestamptz not null default now()
);

create table if not exists expense_claim (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employee(id) on delete cascade,
  claim_date date not null,
  description text,
  status claim_status_enum not null default 'Draft',
  total_amount_sar numeric(12,2) default 0,
  vat_total_sar numeric(12,2) default 0,
  lines_count int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists idx_expense_claim_employee on expense_claim(employee_id);

create table if not exists expense_claim_line (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references expense_claim(id) on delete cascade,
  expense_date date not null,
  category text not null,
  vendor text,
  description text,
  currency currency_enum not null default 'SAR',
  amount numeric(12,2) not null,
  vat_included boolean default false,
  receipt_url text,
  created_at timestamptz not null default now()
);
create index if not exists idx_expense_claim_line_claim on expense_claim_line(claim_id);

create table if not exists expense_policy (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  cap_amount_sar numeric(12,2),
  currency currency_enum default 'SAR',
  is_active boolean default true,
  created_at timestamptz not null default now()
);

create table if not exists expense_report (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employee(id) on delete cascade,
  period_start date,
  period_end date,
  total_amount_sar numeric(12,2) default 0,
  created_at timestamptz not null default now()
);

-- =====================
-- Approvals & Audit
-- =====================
create table if not exists approval_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null, -- e.g., 'ExpenseClaim','LeaveRequest','LoanAccount'
  entity_id uuid not null,
  action text not null, -- e.g., 'Submit','Approve','Reject','Delete'
  actor_employee_id uuid references employee(id) on delete set null,
  comments text,
  created_at timestamptz not null default now()
);
create index if not exists idx_approval_entity on approval_log(entity_type, entity_id);

-- =====================
-- Suggested RLS (enable and add policies as needed)
-- Uncomment to enable RLS and add policies tailored to your org rules
-- alter table employee enable row level security;
-- alter table expense_claim enable row level security;
-- alter table expense_claim_line enable row level security;
-- create policy "employees can view self" on employee
--   for select using (auth.uid() is not null);

-- =====================
-- Done
-- =====================