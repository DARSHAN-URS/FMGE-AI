-- =============================================================================
-- HEALTHCARE & STUDY ABROAD AI SUITE — UNIFIED MASTER DATABASE SCHEMA
-- Platforms: Aura Routes | NursePass | FMGE AI
-- Target Engine: Supabase (PostgreSQL 15+)
-- Architecture: Multi-Tenant Unified Identity + Isolated Product Verticals
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- PRE-MIGRATION CLEANUP: Remove any legacy VARCHAR id tables to enable UUID auth
-- =============================================================================
DO $$
BEGIN
    -- Drop legacy profiles if id is VARCHAR (incompatible with Supabase auth.users UUID)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND data_type = 'character varying' AND column_name = 'id'
    ) THEN
        DROP TABLE IF EXISTS public.profiles CASCADE;
    END IF;

    -- Drop legacy orders if id is VARCHAR
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'orders' AND data_type = 'character varying' AND column_name = 'id'
    ) THEN
        DROP TABLE IF EXISTS public.orders CASCADE;
    END IF;

    -- Drop legacy payments if id is VARCHAR
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'payments' AND data_type = 'character varying' AND column_name = 'id'
    ) THEN
        DROP TABLE IF EXISTS public.payments CASCADE;
    END IF;

    -- Drop dependent user_product_access if conflicting
    DROP TABLE IF EXISTS public.user_product_access CASCADE;
END $$;

-- =============================================================================
-- SECTION 1: CORE IDENTITY & SHARED MULTI-TENANT ARCHITECTURE
-- =============================================================================

-- Master User Profiles (Linked 1:1 to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'candidate', 'doctor', 'nurse', 'faculty', 'institution_admin', 'platform_admin')),
    default_product VARCHAR(50) DEFAULT 'fmge' CHECK (default_product IN ('aura', 'nursepass', 'fmge')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Multi-Product Access & Enrolment Mapping
CREATE TABLE IF NOT EXISTS user_product_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product VARCHAR(50) NOT NULL,
    tier VARCHAR(50) DEFAULT 'free',
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product)
);
CREATE INDEX IF NOT EXISTS idx_user_product_access_lookup ON user_product_access(user_id, product);

-- =============================================================================
-- SECTION 2: UNIFIED BILLING & COMMERCIAL LEDGER (ALL 3 PRODUCTS)
-- =============================================================================

-- Universal Pricing & Subscription Plans
CREATE TABLE IF NOT EXISTS pricing_plans (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'fmge-pro-monthly', 'nursepass-nclex-6m', 'aura-premium-consult'
    product VARCHAR(50) NOT NULL CHECK (product IN ('aura', 'nursepass', 'fmge')),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DOUBLE PRECISION NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    billing_period VARCHAR(20) DEFAULT 'monthly' CHECK (billing_period IN ('one_time', 'monthly', 'quarterly', 'biannual', 'annual')),
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    badge VARCHAR(50),
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_product ON pricing_plans(product);

-- Orders Ledger
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    product VARCHAR(50) NOT NULL DEFAULT 'fmge',
    plan_id VARCHAR(50),
    razorpay_order_id VARCHAR(150),
    amount DOUBLE PRECISION,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'created',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_rp_id ON orders(razorpay_order_id);

-- Payments & Verification Receipts
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    razorpay_payment_id VARCHAR(150),
    razorpay_signature VARCHAR(300),
    amount DOUBLE PRECISION,
    payment_method VARCHAR(50),
    receipt_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'captured',
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_payments_rp_id ON payments(razorpay_payment_id);

-- =============================================================================
-- SECTION 3: SHARED INFRASTRUCTURE (NOTIFICATIONS & AI AUDIT LOGS)
-- =============================================================================

-- Universal Notifications Inbox
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product VARCHAR(50) NOT NULL DEFAULT 'suite',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);

-- AI Inference & Token Audit Logs (LLM Observability)
CREATE TABLE IF NOT EXISTS ai_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    product VARCHAR(50) NOT NULL CHECK (product IN ('aura', 'nursepass', 'fmge')),
    feature VARCHAR(100) NOT NULL, -- e.g. 'ai_tutor', 'sop_generator', 'visa_predictor'
    model VARCHAR(100) NOT NULL,   -- e.g. 'gpt-4o', 'gemini-1.5-pro'
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_audit_product ON ai_audit_logs(product);

-- =============================================================================
-- SECTION 4: AURA ROUTES DOMAIN (STUDY ABROAD & IMMIGRATION)
-- =============================================================================

-- Aura Student Profile (Academic & Study Abroad Background)
CREATE TABLE IF NOT EXISTS aura_student_profiles (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    target_countries JSONB NOT NULL DEFAULT '["United States", "United Kingdom", "Canada"]'::jsonb,
    target_intake VARCHAR(50) DEFAULT 'Fall 2027',
    preferred_course VARCHAR(150),
    gpa_10th DOUBLE PRECISION,
    gpa_12th DOUBLE PRECISION,
    ug_cgpa DOUBLE PRECISION,
    english_exam VARCHAR(50), -- 'IELTS', 'TOEFL', 'PTE', 'Duolingo'
    english_score DOUBLE PRECISION,
    budget_range VARCHAR(50),
    scholarship_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Universities Catalog
CREATE TABLE IF NOT EXISTS aura_universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(150) UNIQUE NOT NULL,
    name VARCHAR(250) NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    qs_world_rank INTEGER,
    tuition_fee_range VARCHAR(100),
    acceptance_rate VARCHAR(50),
    popular_courses JSONB DEFAULT '[]'::jsonb,
    badge VARCHAR(50),
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_aura_universities_country ON aura_universities(country);

-- Student Applications Tracker
CREATE TABLE IF NOT EXISTS aura_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    university_id UUID REFERENCES aura_universities(id) ON DELETE SET NULL,
    course_name VARCHAR(200) NOT NULL,
    intake VARCHAR(50) NOT NULL,
    stage VARCHAR(50) DEFAULT 'Drafting' CHECK (stage IN ('Drafting', 'Submitted', 'Under Review', 'Interview', 'Offer Received', 'Visa In-Progress', 'Enrolled')),
    notes TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_aura_applications_user ON aura_applications(user_id);

-- AI Statement of Purpose (SOP) Builder
CREATE TABLE IF NOT EXISTS aura_sop_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    target_country VARCHAR(100) NOT NULL,
    target_university VARCHAR(200) NOT NULL,
    target_course VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Visa Document Verification & Readiness
CREATE TABLE IF NOT EXISTS aura_visa_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    country VARCHAR(100) NOT NULL,
    visa_type VARCHAR(50) DEFAULT 'Student Visa',
    readiness_score INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'In Review',
    ai_evaluation JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- SECTION 5: NURSEPASS DOMAIN (AI NURSING LICENSURE PLATFORM)
-- =============================================================================

-- Nurse Candidate Profile
CREATE TABLE IF NOT EXISTS nursepass_profiles (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    target_exam VARCHAR(100) DEFAULT 'NCLEX-RN' CHECK (target_exam IN ('NCLEX-RN', 'UK-CBT', 'OET-Nursing', 'DHA', 'HAAD', 'MOH', 'Prometric')),
    target_country VARCHAR(100) DEFAULT 'USA',
    nursing_qualification VARCHAR(100), -- 'BSc Nursing', 'GNM Diploma', 'Post-Basic', 'MSc'
    clinical_experience_years VARCHAR(50),
    current_hospital VARCHAR(200),
    target_exam_date DATE,
    daily_study_goal_mins INTEGER DEFAULT 60,
    readiness_score DOUBLE PRECISION DEFAULT 82.0,
    onboarding_completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Nursing Examination Taxonomy Catalog
CREATE TABLE IF NOT EXISTS nursepass_exams (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    title VARCHAR(300) NOT NULL,
    category VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    exam_pattern JSONB NOT NULL,
    syllabus JSONB NOT NULL,
    passing_criteria TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Nursing NextGen NCLEX (NGN) Question Bank
CREATE TABLE IF NOT EXISTS nursepass_questions (
    id SERIAL PRIMARY KEY,
    exam_slug VARCHAR(100) NOT NULL DEFAULT 'nclex-rn',
    domain VARCHAR(150) NOT NULL, -- e.g. 'Physiological Adaptation', 'Safe Care Environment'
    topic VARCHAR(150) NOT NULL,
    item_type VARCHAR(50) DEFAULT 'Extended Multiple Response', -- 'Case Study', 'Matrix', 'Bow-tie', 'Hotspot'
    clinical_vignette TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option JSONB NOT NULL, -- Supports multiple selection indices
    rationale TEXT NOT NULL,
    client_needs_category VARCHAR(100),
    cognitive_level VARCHAR(50) DEFAULT 'Application / Analysis',
    is_ngn BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_nursepass_questions_domain ON nursepass_questions(exam_slug, domain);

-- Candidate Question Attempts & CAT Logs
CREATE TABLE IF NOT EXISTS nursepass_question_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES nursepass_questions(id) ON DELETE CASCADE,
    selected_option JSONB NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INTEGER NOT NULL,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_nursepass_attempts_user ON nursepass_question_attempts(user_id);

-- Computerized Adaptive Testing (CAT) Mock Simulation Runs
CREATE TABLE IF NOT EXISTS nursepass_cat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    exam_type VARCHAR(100) DEFAULT 'NCLEX-RN',
    total_questions_administered INTEGER DEFAULT 85,
    final_logit_score DOUBLE PRECISION NOT NULL,
    passing_probability_pct DOUBLE PRECISION NOT NULL,
    result VARCHAR(20) DEFAULT 'PENDING' CHECK (result IN ('PASS', 'FAIL', 'PENDING')),
    domain_breakdown JSONB DEFAULT '{}'::jsonb,
    completed_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_nursepass_cat_user ON nursepass_cat_sessions(user_id);

-- OET Nursing AI Writing Letters & Speech Audio Evaluations
CREATE TABLE IF NOT EXISTS nursepass_oet_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    submission_type VARCHAR(50) CHECK (submission_type IN ('writing_letter', 'speaking_audio')),
    case_title VARCHAR(200) NOT NULL,
    content_text TEXT,
    audio_url TEXT,
    overall_band VARCHAR(10), -- 'Grade A', 'Grade B', '350/500'
    ai_feedback JSONB NOT NULL, -- Criterion breakdown (Grammar, Conciseness, Clinical Tone)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Nursing Institution / Hospital College B2B Batches
CREATE TABLE IF NOT EXISTS nursepass_institution_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    batch_name VARCHAR(150) NOT NULL,
    cohort_year VARCHAR(20) NOT NULL,
    target_exam VARCHAR(100) DEFAULT 'NCLEX-RN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- SECTION 6: FMGE AI DOMAIN (MEDICAL GRADUATE LICENSURE PLATFORM)
-- =============================================================================

-- FMGE Candidate Profile
CREATE TABLE IF NOT EXISTS fmge_profiles (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    target_exam VARCHAR(50) DEFAULT 'FMGE Dec 2026',
    medical_college VARCHAR(200),
    country VARCHAR(100) DEFAULT 'Russia',
    graduation_year VARCHAR(10) DEFAULT '2026',
    study_streak_days INTEGER DEFAULT 1,
    readiness_score DOUBLE PRECISION DEFAULT 84.5,
    estimated_marks VARCHAR(20) DEFAULT '194 / 300',
    subscription_plan VARCHAR(50) DEFAULT 'Pro Clinical Pass',
    onboarding_completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 19-Subject Medical Question Bank (NBE FMGE / NExT Standard)
CREATE TABLE IF NOT EXISTS fmge_questions (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(150) NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'Hard (NBE Level)',
    question_stem TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option INTEGER NOT NULL,
    explanation JSONB NOT NULL, -- { summary, distractor_analysis, high_yield_mnemonic, clinical_correlation, nmc_guideline_reference }
    is_ibq BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_fmge_questions_subject_topic ON fmge_questions(subject, topic);

-- Candidate Question Attempt Records
CREATE TABLE IF NOT EXISTS fmge_question_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES fmge_questions(id) ON DELETE CASCADE,
    selected_option INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INTEGER NOT NULL,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_fmge_attempts_user_id ON fmge_question_attempts(user_id);

-- Doctor Question Bookmarks
CREATE TABLE IF NOT EXISTS fmge_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES fmge_questions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, question_id)
);
CREATE INDEX IF NOT EXISTS idx_fmge_bookmarks_user ON fmge_bookmarks(user_id);

-- 300-Question Official NBE Computer-Based Test (CBT) Simulations
CREATE TABLE IF NOT EXISTS fmge_mock_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    template_id VARCHAR(50) NOT NULL, -- 'gt-01', 'rapid-50', 'subject-test'
    title VARCHAR(150) NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    score INTEGER DEFAULT 0,
    max_marks INTEGER DEFAULT 300,
    result VARCHAR(20) DEFAULT 'PENDING' CHECK (result IN ('PASS', 'FAIL', 'PENDING')),
    time_taken_seconds INTEGER DEFAULT 0,
    part_a_score INTEGER DEFAULT 0,
    part_b_score INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_fmge_mock_sessions_user ON fmge_mock_sessions(user_id);

-- Spaced-Repetition Daily Study Planner Tasks
CREATE TABLE IF NOT EXISTS fmge_daily_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    subtitle VARCHAR(200),
    estimated_mins INTEGER DEFAULT 30,
    completed BOOLEAN DEFAULT FALSE,
    due_date DATE DEFAULT CURRENT_DATE
);
CREATE INDEX IF NOT EXISTS idx_fmge_daily_targets_user ON fmge_daily_targets(user_id);

-- Clinical Patient Case Solver & Virtual Ward Records
CREATE TABLE IF NOT EXISTS fmge_clinical_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    case_slug VARCHAR(100) NOT NULL,
    patient_chief_complaint TEXT NOT NULL,
    differential_diagnosis_selected JSONB NOT NULL,
    diagnostic_accuracy_pct DOUBLE PRECISION NOT NULL,
    emergency_action_success BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- SECTION 7: ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS across all customer tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_product_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE aura_student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE aura_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE aura_sop_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE aura_visa_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursepass_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursepass_question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursepass_cat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursepass_oet_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fmge_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fmge_question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fmge_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE fmge_mock_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fmge_daily_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE fmge_clinical_cases ENABLE ROW LEVEL SECURITY;

-- Catalog tables are publicly readable by authenticated users
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE aura_universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursepass_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursepass_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fmge_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Pricing Plans" ON pricing_plans FOR SELECT USING (true);
CREATE POLICY "Public Read Universities" ON aura_universities FOR SELECT USING (true);
CREATE POLICY "Public Read NursePass Exams" ON nursepass_exams FOR SELECT USING (true);
CREATE POLICY "Public Read NursePass Questions" ON nursepass_questions FOR SELECT USING (true);
CREATE POLICY "Public Read FMGE Questions" ON fmge_questions FOR SELECT USING (true);

-- User-Isolation Policies: Users can only view and update their own records
CREATE POLICY "Users own profiles select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users own profiles update" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users own product access" ON user_product_access FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own orders" ON orders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own Aura profile" ON aura_student_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own Aura applications" ON aura_applications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own Aura SOPs" ON aura_sop_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own Aura visa checks" ON aura_visa_checks FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own NursePass profile" ON nursepass_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own NursePass attempts" ON nursepass_question_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own NursePass CAT" ON nursepass_cat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own NursePass OET" ON nursepass_oet_submissions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own FMGE profile" ON fmge_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own FMGE attempts" ON fmge_question_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own FMGE bookmarks" ON fmge_bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own FMGE mocks" ON fmge_mock_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own FMGE daily targets" ON fmge_daily_targets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own FMGE cases" ON fmge_clinical_cases FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- SECTION 8: AUTOMATIC TRIGGERS (AUTH & TIMESTAMP SYNCHRONIZATION)
-- =============================================================================

-- Automatically provision user profile and product profiles on Supabase Auth SignUp
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_prod VARCHAR(50);
    user_name VARCHAR(255);
    user_role VARCHAR(50);
BEGIN
    default_prod := COALESCE(new.raw_user_meta_data->>'product', 'fmge');
    user_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
    user_role := COALESCE(new.raw_user_meta_data->>'role', 'student');

    -- 1. Insert Master Profile
    INSERT INTO public.profiles (id, email, full_name, role, default_product)
    VALUES (new.id, new.email, user_name, user_role, default_prod)
    ON CONFLICT (id) DO NOTHING;

    -- 2. Insert Product Access
    INSERT INTO public.user_product_access (user_id, product, tier)
    VALUES (new.id, default_prod, 'free')
    ON CONFLICT (user_id, product) DO NOTHING;

    -- 3. Provision Product-Specific Default Record
    IF default_prod = 'fmge' THEN
        INSERT INTO public.fmge_profiles (user_id, medical_college, country)
        VALUES (
            new.id,
            COALESCE(new.raw_user_meta_data->>'medical_college', 'Foreign Medical University'),
            COALESCE(new.raw_user_meta_data->>'country', 'Russia')
        )
        ON CONFLICT (user_id) DO NOTHING;
    ELSIF default_prod = 'nursepass' THEN
        INSERT INTO public.nursepass_profiles (user_id, target_exam)
        VALUES (
            new.id,
            COALESCE(new.raw_user_meta_data->>'target_exam', 'NCLEX-RN')
        )
        ON CONFLICT (user_id) DO NOTHING;
    ELSIF default_prod = 'aura' THEN
        INSERT INTO public.aura_student_profiles (user_id)
        VALUES (new.id)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =============================================================================
-- SECTION 9: INITIAL PRODUCTION SEED DATA
-- =============================================================================

-- Seed Pricing Plans for all 3 Products
INSERT INTO pricing_plans (id, product, name, price, currency, billing_period, is_popular, features)
VALUES
    ('aura-sop-builder', 'aura', 'AI SOP & Visa Builder', 4999.0, 'INR', 'one_time', false, '["AI Statement of Purpose Generator", "Visa Probability Predictor", "University Fit Analysis"]'),
    ('aura-elite-counseling', 'aura', 'Global Admissions Elite', 24999.0, 'INR', 'one_time', true, '["1-on-1 Senior Counselor", "Full Application Management", "Visa Interview Mock"]'),
    ('nursepass-nclex-pass', 'nursepass', 'NCLEX-RN Complete Pass', 8999.0, 'INR', 'biannual', true, '["NextGen NCLEX CAT Simulator", "3,500+ Rationales", "AI Nursing Tutor 24/7"]'),
    ('nursepass-oet-pro', 'nursepass', 'OET Nursing Mastery', 5999.0, 'INR', 'quarterly', false, '["AI Speech & Audio Evaluator", "AI Letter Correction", "Clinical Roleplay"]'),
    ('fmge-pro-pass', 'fmge', 'FMGE 2026 Clinical Pass', 9999.0, 'INR', 'biannual', true, '["19 Medical Subjects QBank", "300-Q CBT NBE Simulator", "Medical Image Lab (ECG/X-Ray)", "Harrison-Cited AI Tutor"]'),
    ('fmge-ultimate-next', 'fmge', 'FMGE & NExT 1 Ultimate', 15999.0, 'INR', 'annual', false, '["Complete 2-Year Validity", "Unlimited AI Doubt Solver", "1-on-1 Faculty Mentorship"]')
ON CONFLICT (id) DO NOTHING;

-- Seed Initial High-Yield FMGE NBE Questions
INSERT INTO fmge_questions (id, subject, topic, difficulty, question_stem, options, correct_option, explanation, is_ibq, image_url)
VALUES
    (
        101,
        'General Medicine',
        'Cardiology',
        'Hard (NBE Level)',
        'A 45-year-old diabetic male presents with acute onset crushing chest pain radiating to his left shoulder for 2 hours. ECG demonstrates ST-segment elevation in leads II, III, and aVF with reciprocal depression in I and aVL. Which coronary vessel is acutely occluded?',
        '[{"id": 0, "text": "Left Anterior Descending Artery (LAD)"}, {"id": 1, "text": "Right Coronary Artery (RCA)"}, {"id": 2, "text": "Left Circumflex Artery (LCx)"}, {"id": 3, "text": "Left Main Coronary Artery (LMCA)"}]'::jsonb,
        1,
        '{"summary": "ST-elevation in inferior leads (II, III, aVF) is diagnostic of Inferior Wall Myocardial Infarction (IWMI). The Right Coronary Artery (RCA) supplies the inferior LV wall in 85-90% of individuals.", "distractor_analysis": [{"option": "A. LAD", "status": "Incorrect", "reason": "LAD occlusion causes Anterior Wall MI (V1-V4)."}, {"option": "B. RCA", "status": "CORRECT", "reason": "RCA supplies Inferior Wall & AV node."}, {"option": "C. LCx", "status": "Incorrect", "reason": "LCx causes Lateral Wall MI (I, aVL, V5-V6)."}, {"option": "D. LMCA", "status": "Incorrect", "reason": "Causes massive antero-lateral infarction."}], "high_yield_mnemonic": "Inferior Wall MI = RCA (II, III, aVF) | Anterior MI = LAD (V1-V4) | Lateral MI = LCx (I, aVL)", "clinical_correlation": "Inferior MIs are frequently associated with bradycardia and AV nodal blocks. Avoid Nitrates if right ventricular infarction is suspected!", "nmc_guideline_reference": "Harrison''s Principles of Internal Medicine (21st Ed, Ch 275)"}'::jsonb,
        true,
        'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80'
    ),
    (
        102,
        'Pharmacology',
        'Antimicrobial Chemotherapy',
        'Medium',
        'A 30-year-old pregnant woman at 14 weeks gestation develops acute pyelonephritis. Which of the following antimicrobial agents is safest for empirical parenteral treatment in this patient?',
        '[{"id": 0, "text": "Ciprofloxacin (Fluoroquinolone)"}, {"id": 1, "text": "Ceftriaxone (3rd Gen Cephalosporin)"}, {"id": 2, "text": "Doxycycline (Tetracycline)"}, {"id": 3, "text": "Trimethoprim-Sulfamethoxazole"}]'::jsonb,
        1,
        '{"summary": "Ceftriaxone is a category B cephalosporin and the drug of choice for acute pyelonephritis in pregnancy.", "distractor_analysis": [{"option": "A. Ciprofloxacin", "status": "Incorrect", "reason": "Fluoroquinolones cause arthropathy and cartilage damage in the fetus."}, {"option": "B. Ceftriaxone", "status": "CORRECT", "reason": "Safe and highly effective in pregnancy."}, {"option": "C. Doxycycline", "status": "Incorrect", "reason": "Tetracyclines cause fetal teeth discoloration and bone growth inhibition."}, {"option": "D. TMP-SMX", "status": "Incorrect", "reason": "Avoid in 1st trimester due to neural tube defects and near term due to kernicterus."}], "high_yield_mnemonic": "Safe in pregnancy: Penicillins, Cephalosporins, Erythromycin, Azithromycin", "clinical_correlation": "Pyelonephritis in pregnancy carries high risk of preterm labor and ARDS; inpatient parenteral therapy is standard.", "nmc_guideline_reference": "Harrison''s Principles of Internal Medicine (21st Ed, Ch 130)"}'::jsonb,
        false,
        null
    ),
    (
        103,
        'Pathology',
        'Lymphoreticular System',
        'Hard (NBE Level)',
        'A 22-year-old male presents with painless cervical lymphadenopathy and B-symptoms (fever, night sweats, weight loss). Lymph node biopsy reveals large binucleated cells with prominent owl-eye nucleoli. What surface immunophenotype is characteristically expressed by these Reed-Sternberg cells?',
        '[{"id": 0, "text": "CD3+ and CD4+"}, {"id": 1, "text": "CD15+ and CD30+"}, {"id": 2, "text": "CD19+ and CD20+"}, {"id": 3, "text": "CD138+ and Kappa Light Chains"}]'::jsonb,
        1,
        '{"summary": "Classic Reed-Sternberg cells of Hodgkin Lymphoma characteristically express CD15 and CD30, while typically lacking conventional B-cell markers like CD20.", "distractor_analysis": [{"option": "A. CD3/CD4", "status": "Incorrect", "reason": "T-cell markers."}, {"option": "B. CD15/CD30", "status": "CORRECT", "reason": "Classic diagnostic surface markers for RS cells in Hodgkin Lymphoma."}, {"option": "C. CD19/CD20", "status": "Incorrect", "reason": "Present on normal B cells, absent or weak on classic RS cells."}, {"option": "D. CD138", "status": "Incorrect", "reason": "Plasma cell marker seen in Multiple Myeloma."}], "high_yield_mnemonic": "Hodgkin RS cells: 15 x 2 = 30 (CD15+ & CD30+)", "clinical_correlation": "Nodular Sclerosis is the most common subtype of Hodgkin Lymphoma in young adults, presenting with mediastinal mass.", "nmc_guideline_reference": "Robbins and Cotran Pathologic Basis of Disease (10th Ed, Ch 13)"}'::jsonb,
        true,
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80'
    )
ON CONFLICT (id) DO NOTHING;

-- Seed Initial NextGen NCLEX Questions for NursePass
INSERT INTO nursepass_questions (id, exam_slug, domain, topic, item_type, clinical_vignette, options, correct_option, rationale, client_needs_category, cognitive_level)
VALUES
    (
        1,
        'nclex-rn',
        'Physiological Adaptation',
        'Cardiovascular Emergencies',
        'Extended Multiple Response',
        'A nurse in the emergency department is caring for a 62-year-old client with suspected acute myocardial infarction receiving IV nitroglycerin. Which of the following findings require IMMEDIATE nurse intervention? (Select all that apply)',
        '[{"id": 0, "text": "Blood pressure drops from 142/86 mmHg to 88/54 mmHg"}, {"id": 1, "text": "Client reports a mild frontal throbbing headache"}, {"id": 2, "text": "Heart rate increases to 118 bpm with dizzy sensation"}, {"id": 3, "text": "Client reports relief of retrosternal chest pain from 8/10 to 2/10"}]'::jsonb,
        '[0, 2]'::jsonb,
        'Hypotension (systolic < 90 mmHg) and compensatory tachycardia with dizziness indicate significant hemodynamic compromise and reduced coronary perfusion. The infusion must be titrated down or stopped immediately and the healthcare provider notified. Headache is an expected side effect of vasodilation. Pain relief indicates desired therapeutic effect.',
        'Reduction of Risk Potential',
        'Clinical Judgment / Prioritization'
    )
ON CONFLICT (id) DO NOTHING;
