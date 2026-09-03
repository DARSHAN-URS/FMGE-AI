-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. PAYMENT & SERVICE CATALOG TABLES
-- =========================================================================

CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    short_description VARCHAR(250) NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    icon VARCHAR(50) NOT NULL,
    badge VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100),
    service_id VARCHAR(36) NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    razorpay_order_id VARCHAR(100) UNIQUE NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);
CREATE INDEX IF NOT EXISTS idx_orders_rp_id ON orders(razorpay_order_id);

CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id VARCHAR(36) NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    razorpay_payment_id VARCHAR(100) UNIQUE NOT NULL,
    razorpay_signature VARCHAR(250) NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'captured',
    transaction_date TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    receipt_number VARCHAR(100) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_payments_rp_id ON payments(razorpay_payment_id);


-- =========================================================================
-- 2. ELIGIBILITY EVALUATION TABLES
-- =========================================================================

CREATE TABLE IF NOT EXISTS eligibility_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    country_residence VARCHAR(100) NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    qualification VARCHAR(100) NOT NULL,
    gpa_10th DOUBLE PRECISION NOT NULL,
    gpa_12th DOUBLE PRECISION NOT NULL,
    cgpa_bachelors DOUBLE PRECISION,
    cgpa_masters DOUBLE PRECISION,
    grad_year INTEGER NOT NULL,
    english_exam VARCHAR(50) NOT NULL,
    english_score DOUBLE PRECISION,
    preferred_country VARCHAR(100) NOT NULL,
    preferred_course VARCHAR(100) NOT NULL,
    preferred_intake VARCHAR(50) NOT NULL,
    budget_range VARCHAR(50) NOT NULL,
    scholarship_required BOOLEAN DEFAULT FALSE,
    work_experience DOUBLE PRECISION DEFAULT 0.0,
    gap_years INTEGER DEFAULT 0,
    neet_score INTEGER,
    passport_available BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);
CREATE INDEX IF NOT EXISTS idx_eligibility_requests_email ON eligibility_requests(email);

CREATE TABLE IF NOT EXISTS eligibility_results (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    request_id VARCHAR(36) NOT NULL UNIQUE REFERENCES eligibility_requests(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL,
    admission_probability VARCHAR(20) NOT NULL,
    scholarship_potential VARCHAR(20) NOT NULL,
    visa_readiness VARCHAR(20) NOT NULL,
    strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
    weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
    suggested_improvements JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommended_countries JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommended_universities JSONB NOT NULL DEFAULT '[]'::jsonb,
    suggested_next_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);


-- =========================================================================
-- 3. STATEMENT OF PURPOSE (SOP) BUILDER TABLES
-- =========================================================================

CREATE TABLE IF NOT EXISTS sop_documents (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100),
    title VARCHAR(150) NOT NULL,
    target_country VARCHAR(100) NOT NULL,
    target_university VARCHAR(150) NOT NULL,
    target_course VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    ai_model VARCHAR(50) DEFAULT 'gpt-4o-mini',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS sop_versions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    document_id VARCHAR(36) NOT NULL REFERENCES sop_documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    changes VARCHAR(250) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);


-- =========================================================================
-- 4. VISA DOCUMENT VERIFICATION & CHECKER TABLES
-- =========================================================================

CREATE TABLE IF NOT EXISTS visa_document_checks (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    visa_type VARCHAR(50) DEFAULT 'Student Visa',
    readiness_score INTEGER DEFAULT 0,
    status VARCHAR(30) DEFAULT 'Needs Improvement',
    ai_response JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS uploaded_documents (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    check_id VARCHAR(36) NOT NULL REFERENCES visa_document_checks(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    filename VARCHAR(200) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    file_path VARCHAR(300) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS document_analyses (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    check_id VARCHAR(36) NOT NULL REFERENCES visa_document_checks(id) ON DELETE CASCADE,
    uploaded_document_id VARCHAR(36) REFERENCES uploaded_documents(id) ON DELETE SET NULL,
    document_name VARCHAR(150) NOT NULL,
    status VARCHAR(20) DEFAULT 'Warning',
    issues JSONB NOT NULL DEFAULT '[]'::jsonb,
    suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
    confidence_score DOUBLE PRECISION DEFAULT 1.0,
    critical BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);


-- =========================================================================
-- 5. UNIVERSITY CATALOG & COMPARE & WORKSPACE MATCHES
-- =========================================================================

CREATE TABLE IF NOT EXISTS universities (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(200) UNIQUE NOT NULL,
    country VARCHAR(100) NOT NULL,
    world_ranking INTEGER,
    tuition_fee_range VARCHAR(100) NOT NULL,
    average_living_cost VARCHAR(100) NOT NULL,
    admission_rate VARCHAR(50),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS university_matches (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) DEFAULT 'guest_user',
    profile_data JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS saved_universities (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) DEFAULT 'guest_user',
    name VARCHAR(200) NOT NULL,
    country VARCHAR(100) NOT NULL,
    course VARCHAR(200) NOT NULL,
    tuition_fee VARCHAR(100) NOT NULL,
    match_percentage INTEGER DEFAULT 90,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS university_comparisons (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) DEFAULT 'guest_user',
    name VARCHAR(150) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);


-- =========================================================================
-- 6. APPLICATIONS TRACKING WORKSPACE PIPELINE
-- =========================================================================

CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) DEFAULT 'guest_user',
    university VARCHAR(200) NOT NULL,
    country VARCHAR(100) NOT NULL,
    course VARCHAR(200) NOT NULL,
    degree VARCHAR(100) NOT NULL,
    intake VARCHAR(100) NOT NULL,
    tuition_fee VARCHAR(100),
    application_fee VARCHAR(100),
    deadline VARCHAR(100),
    current_status VARCHAR(50) DEFAULT 'Interested',
    priority VARCHAR(30) DEFAULT 'Medium',
    notes VARCHAR(2000),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS application_tasks (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    application_id VARCHAR(36) NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    title VARCHAR(250) NOT NULL,
    status VARCHAR(30) DEFAULT 'pending',
    due_date VARCHAR(100),
    priority VARCHAR(30) DEFAULT 'Medium',
    notes VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS application_documents (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    application_id VARCHAR(36) NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    document_name VARCHAR(150) NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending',
    file_path VARCHAR(300),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS application_notes (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    application_id VARCHAR(36) NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS application_timeline (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    application_id VARCHAR(36) NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    event_title VARCHAR(150) NOT NULL,
    event_description VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS application_calendar (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    application_id VARCHAR(36) REFERENCES applications(id) ON DELETE CASCADE,
    event_title VARCHAR(250) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_date VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);


-- =========================================================================
-- 7. VISA PREPARATION SUITE (VISA SUCCESS PORTAL)
-- =========================================================================

CREATE TABLE IF NOT EXISTS visa_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) DEFAULT 'guest_user',
    country VARCHAR(100) NOT NULL,
    visa_type VARCHAR(100) NOT NULL,
    current_stage VARCHAR(100) DEFAULT 'Application',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS visa_readiness_reports (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id VARCHAR(36) NOT NULL REFERENCES visa_profiles(id) ON DELETE CASCADE,
    overall_score INTEGER DEFAULT 50,
    risk_level VARCHAR(50) DEFAULT 'Medium',
    critical_issues JSONB DEFAULT '[]'::jsonb,
    suggested_improvements JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS visa_checklists (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id VARCHAR(36) NOT NULL REFERENCES visa_profiles(id) ON DELETE CASCADE,
    item_name VARCHAR(200) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    notes VARCHAR(1000),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS visa_tasks (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id VARCHAR(36) NOT NULL REFERENCES visa_profiles(id) ON DELETE CASCADE,
    title VARCHAR(250) NOT NULL,
    due_date VARCHAR(100),
    status VARCHAR(30) DEFAULT 'pending',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS visa_interviews (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id VARCHAR(36) NOT NULL REFERENCES visa_profiles(id) ON DELETE CASCADE,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS visa_financials (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id VARCHAR(36) NOT NULL REFERENCES visa_profiles(id) ON DELETE CASCADE,
    tuition_fee DOUBLE PRECISION DEFAULT 0.0,
    living_expenses DOUBLE PRECISION DEFAULT 0.0,
    scholarship_amount DOUBLE PRECISION DEFAULT 0.0,
    education_loan DOUBLE PRECISION DEFAULT 0.0,
    savings DOUBLE PRECISION DEFAULT 0.0,
    required_funds DOUBLE PRECISION DEFAULT 0.0,
    available_funds DOUBLE PRECISION DEFAULT 0.0,
    funding_gap DOUBLE PRECISION DEFAULT 0.0,
    readiness_score INTEGER DEFAULT 50,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS visa_timelines (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id VARCHAR(36) NOT NULL REFERENCES visa_profiles(id) ON DELETE CASCADE,
    event_title VARCHAR(200) NOT NULL,
    event_date VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS visa_recommendations (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id VARCHAR(36) NOT NULL REFERENCES visa_profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    actionable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);


-- =========================================================================
-- 8. SCHOLARSHIPS PORTAL TABLES
-- =========================================================================

CREATE TABLE IF NOT EXISTS scholarships (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(250) NOT NULL,
    provider VARCHAR(250) NOT NULL,
    country VARCHAR(100) NOT NULL,
    university VARCHAR(250),
    funding_amount VARCHAR(150) NOT NULL,
    coverage VARCHAR(150) NOT NULL,
    eligibility_criteria VARCHAR(2000) NOT NULL,
    difficulty_level VARCHAR(50) DEFAULT 'Medium',
    deadline VARCHAR(100),
    website_placeholder VARCHAR(300) DEFAULT 'https://auraroutes.com/scholarships',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS scholarship_matches (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) DEFAULT 'guest_user',
    profile_data JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS saved_scholarships (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) DEFAULT 'guest_user',
    scholarship_id VARCHAR(36),
    name VARCHAR(250) NOT NULL,
    provider VARCHAR(250) NOT NULL,
    country VARCHAR(100) NOT NULL,
    funding_amount VARCHAR(150) NOT NULL,
    match_percentage INTEGER DEFAULT 80,
    deadline VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS funding_plans (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) DEFAULT 'guest_user',
    tuition_fee DOUBLE PRECISION DEFAULT 0.0,
    living_cost DOUBLE PRECISION DEFAULT 0.0,
    travel_cost DOUBLE PRECISION DEFAULT 0.0,
    visa_cost DOUBLE PRECISION DEFAULT 0.0,
    insurance DOUBLE PRECISION DEFAULT 0.0,
    misc_expenses DOUBLE PRECISION DEFAULT 0.0,
    scholarship_amount DOUBLE PRECISION DEFAULT 0.0,
    loan_amount DOUBLE PRECISION DEFAULT 0.0,
    savings DOUBLE PRECISION DEFAULT 0.0,
    funding_gap DOUBLE PRECISION DEFAULT 0.0,
    total_cost DOUBLE PRECISION DEFAULT 0.0,
    total_available DOUBLE PRECISION DEFAULT 0.0,
    readiness_score INTEGER DEFAULT 50,
    suggested_plan TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS scholarship_deadlines (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) DEFAULT 'guest_user',
    event_title VARCHAR(250) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_date VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS scholarship_reports (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) DEFAULT 'guest_user',
    report_data JSONB NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);


-- =========================================================================
-- 9. USER SETTINGS, NOTIFICATIONS & WHATSAPP INTEGRATION
-- =========================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) DEFAULT 'guest_user',
    type VARCHAR(30) DEFAULT 'info',
    title VARCHAR(150) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) DEFAULT 'guest_user',
    consultant_name VARCHAR(100) NOT NULL,
    date_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    meeting_link VARCHAR(300) NOT NULL,
    status VARCHAR(30) DEFAULT 'upcoming',
    notes VARCHAR(1000),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS user_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) DEFAULT 'guest_user' UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    privacy_profile_public BOOLEAN DEFAULT FALSE,
    language VARCHAR(50) DEFAULT 'English',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);
CREATE INDEX IF NOT EXISTS idx_user_settings_uid ON user_settings(user_id);

CREATE TABLE IF NOT EXISTS dashboard_activities (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) DEFAULT 'guest_user',
    activity_type VARCHAR(50) NOT NULL,
    description VARCHAR(250) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS notification_templates (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(150) NOT NULL,
    event VARCHAR(100) UNIQUE NOT NULL,
    template VARCHAR(1000) NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS whatsapp_notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) DEFAULT 'guest_user',
    event_type VARCHAR(100) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    template_name VARCHAR(150) NOT NULL,
    message VARCHAR(2000) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    retry_count INTEGER DEFAULT 0,
    provider_message_id VARCHAR(150),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) DEFAULT 'guest_user',
    enable_whatsapp BOOLEAN DEFAULT TRUE,
    categories JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);


-- =========================================================================
-- 10. STUDENT SETTINGS, MASTER PROFILE & PERSONALIZATION ENGINE
-- =========================================================================

CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    nationality VARCHAR(100),
    country_residence VARCHAR(100),
    city VARCHAR(100),
    gender VARCHAR(20),
    date_of_birth VARCHAR(20),
    passport_number VARCHAR(50),
    passport_expiry VARCHAR(20),
    emergency_contact_name VARCHAR(100),
    emergency_contact_relation VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    photo_url VARCHAR(300),
    verification_status VARCHAR(20) DEFAULT 'Unverified',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

CREATE TABLE IF NOT EXISTS academic_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id VARCHAR(36) NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    highest_qualification VARCHAR(100),
    gpa_10th DOUBLE PRECISION,
    gpa_12th DOUBLE PRECISION,
    cgpa_bachelors DOUBLE PRECISION,
    cgpa_masters DOUBLE PRECISION,
    grad_year INTEGER,
    university VARCHAR(200),
    college VARCHAR(200),
    backlogs INTEGER DEFAULT 0,
    research_papers JSONB NOT NULL DEFAULT '[]'::jsonb,
    projects JSONB NOT NULL DEFAULT '[]'::jsonb,
    work_experience JSONB NOT NULL DEFAULT '[]'::jsonb,
    internships JSONB NOT NULL DEFAULT '[]'::jsonb,
    certifications JSONB NOT NULL DEFAULT '[]'::jsonb,
    ielts_score DOUBLE PRECISION,
    ielts_expiry VARCHAR(20),
    toefl_score DOUBLE PRECISION,
    toefl_expiry VARCHAR(20),
    pte_score DOUBLE PRECISION,
    pte_expiry VARCHAR(20),
    duolingo_score DOUBLE PRECISION,
    duolingo_expiry VARCHAR(20),
    gre_score DOUBLE PRECISION,
    gre_expiry VARCHAR(20),
    gmat_score DOUBLE PRECISION,
    gmat_expiry VARCHAR(20),
    sat_score DOUBLE PRECISION,
    sat_expiry VARCHAR(20),
    neet_score DOUBLE PRECISION,
    neet_expiry VARCHAR(20),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS study_preferences (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id VARCHAR(36) NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    preferred_countries JSONB NOT NULL DEFAULT '[]'::jsonb,
    preferred_universities JSONB NOT NULL DEFAULT '[]'::jsonb,
    preferred_courses JSONB NOT NULL DEFAULT '[]'::jsonb,
    degree_level VARCHAR(100),
    budget VARCHAR(100),
    target_intake VARCHAR(100),
    scholarship_required BOOLEAN DEFAULT FALSE,
    preferred_city VARCHAR(100),
    preferred_language VARCHAR(50),
    career_goals VARCHAR(2000),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS financial_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id VARCHAR(36) NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    annual_family_income VARCHAR(100),
    savings DOUBLE PRECISION DEFAULT 0.0,
    education_loan DOUBLE PRECISION DEFAULT 0.0,
    sponsor VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'INR',
    financial_readiness INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS language_preferences (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id VARCHAR(36) NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    preferred_language VARCHAR(50) DEFAULT 'English',
    supported_languages JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS notification_preferences (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id VARCHAR(36) NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    email BOOLEAN DEFAULT TRUE,
    whatsapp BOOLEAN DEFAULT TRUE,
    sms BOOLEAN DEFAULT FALSE,
    in_app BOOLEAN DEFAULT TRUE,
    ai_updates BOOLEAN DEFAULT TRUE,
    consultation BOOLEAN DEFAULT TRUE,
    payments BOOLEAN DEFAULT TRUE,
    scholarships BOOLEAN DEFAULT TRUE,
    visa BOOLEAN DEFAULT TRUE,
    application BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS security_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id VARCHAR(36) NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_method VARCHAR(50) DEFAULT 'email',
    two_factor_secret VARCHAR(100),
    login_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    active_sessions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS connected_accounts (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id VARCHAR(36) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    connected_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS student_documents (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    filename VARCHAR(200) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    file_path VARCHAR(300) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);
CREATE INDEX IF NOT EXISTS idx_student_documents_user_id ON student_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_category ON student_documents(category);

-- =========================================================================
-- 12. FMGE AI EXAMINATION & CLINICAL PREP TABLES
-- =========================================================================

CREATE TABLE IF NOT EXISTS fmge_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) UNIQUE NOT NULL,
    target_exam VARCHAR(50) DEFAULT 'FMGE Dec 2026',
    medical_college VARCHAR(150),
    country VARCHAR(100) DEFAULT 'Russia',
    graduation_year VARCHAR(10) DEFAULT '2026',
    study_streak_days INTEGER DEFAULT 1,
    readiness_score DOUBLE PRECISION DEFAULT 84.5,
    estimated_marks VARCHAR(20) DEFAULT '194 / 300',
    subscription_plan VARCHAR(50) DEFAULT 'Pro Clinical Pass',
    onboarding_completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);
CREATE INDEX IF NOT EXISTS idx_fmge_profiles_user_id ON fmge_profiles(user_id);

CREATE TABLE IF NOT EXISTS fmge_questions (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(150) NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'Hard (NBE Level)',
    question_stem TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option INTEGER NOT NULL,
    explanation JSONB NOT NULL,
    is_ibq BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);
CREATE INDEX IF NOT EXISTS idx_fmge_questions_subject ON fmge_questions(subject);

CREATE TABLE IF NOT EXISTS fmge_question_attempts (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) NOT NULL,
    question_id INTEGER NOT NULL REFERENCES fmge_questions(id) ON DELETE CASCADE,
    selected_option INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INTEGER NOT NULL,
    attempted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);
CREATE INDEX IF NOT EXISTS idx_fmge_attempts_user_id ON fmge_question_attempts(user_id);

CREATE TABLE IF NOT EXISTS fmge_bookmarks (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) NOT NULL,
    question_id INTEGER NOT NULL REFERENCES fmge_questions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    UNIQUE (user_id, question_id)
);
CREATE INDEX IF NOT EXISTS idx_fmge_bookmarks_user_id ON fmge_bookmarks(user_id);

CREATE TABLE IF NOT EXISTS fmge_mock_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) NOT NULL,
    template_id VARCHAR(50) NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    score INTEGER DEFAULT 0,
    max_marks INTEGER DEFAULT 300,
    result VARCHAR(10) DEFAULT 'PENDING',
    time_taken_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_fmge_mock_sessions_user ON fmge_mock_sessions(user_id);

CREATE TABLE IF NOT EXISTS fmge_daily_targets (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100) NOT NULL,
    title VARCHAR(150) NOT NULL,
    subtitle VARCHAR(200),
    estimated_mins INTEGER DEFAULT 30,
    completed BOOLEAN DEFAULT FALSE,
    due_date DATE DEFAULT CURRENT_DATE
);
CREATE INDEX IF NOT EXISTS idx_fmge_daily_targets_user ON fmge_daily_targets(user_id);
