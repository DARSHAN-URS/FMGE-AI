from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, JSON, Date
from datetime import datetime
from .database import Base

class NursePassExam(Base):
    __tablename__ = "nursepass_exams"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    title = Column(String(300), nullable=False)
    icon = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False) # e.g. Licensing, Language, Regional
    country = Column(String(100), nullable=False) # e.g. USA, UK, UAE, Saudi Arabia, International
    short_description = Column(Text, nullable=False)
    full_overview = Column(Text, nullable=False)
    eligibility = Column(JSON, nullable=False) # array of requirement strings
    exam_pattern = Column(JSON, nullable=False) # object with questions, duration, format, passing_score
    syllabus = Column(JSON, nullable=False) # array of topics with weightage and descriptions
    passing_criteria = Column(Text, nullable=False)
    ai_prep_features = Column(JSON, nullable=False) # array of relevant AI feature slugs/names
    faqs = Column(JSON, nullable=False) # array of Q&A objects
    hero_stat = Column(String(100), nullable=True) # e.g. "98.4% Pass Rate"
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassAIFeature(Base):
    __tablename__ = "nursepass_ai_features"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    subtitle = Column(String(300), nullable=False)
    icon = Column(String(100), nullable=False)
    badge = Column(String(100), nullable=True)
    short_description = Column(Text, nullable=False)
    full_description = Column(Text, nullable=False)
    key_benefits = Column(JSON, nullable=False) # list of benefit strings
    how_it_works = Column(JSON, nullable=False) # list of step objects {step, title, description}
    tech_specs = Column(JSON, nullable=False) # object with AI model specs, speed, precision
    demo_type = Column(String(100), nullable=False) # qbank, planner, tutor, voice, analytics
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassPricingPlan(Base):
    __tablename__ = "nursepass_pricing_plans"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(String(50), unique=True, index=True, nullable=False) # free, basic, premium, ultimate
    name = Column(String(100), nullable=False)
    tagline = Column(String(200), nullable=False)
    monthly_price = Column(Float, nullable=False) # in USD or INR
    annual_price = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    badge = Column(String(100), nullable=True) # e.g. "Most Popular", "Best Value"
    is_popular = Column(Boolean, default=False)
    features = Column(JSON, nullable=False) # array of feature objects {name, included: true/false, limit: string}
    cta_text = Column(String(100), default="Get Started")
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassCoupon(Base):
    __tablename__ = "nursepass_coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    discount_percent = Column(Float, default=0.0)
    discount_flat = Column(Float, default=0.0)
    description = Column(String(200), nullable=False)
    is_active = Column(Boolean, default=True)
    expiry_date = Column(DateTime, nullable=True)

class NursePassTestimonial(Base):
    __tablename__ = "nursepass_testimonials"

    id = Column(Integer, primary_key=True, index=True)
    student_name = Column(String(150), nullable=False)
    role_title = Column(String(150), default="Registered Nurse")
    country = Column(String(100), nullable=False)
    exam_passed = Column(String(100), nullable=False)
    score = Column(String(100), nullable=False)
    review = Column(Text, nullable=False)
    photo_url = Column(String(500), nullable=False)
    video_url = Column(String(500), nullable=True)
    rating = Column(Float, default=5.0)
    is_featured = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassBlogPost(Base):
    __tablename__ = "nursepass_blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(200), unique=True, index=True, nullable=False)
    title = Column(String(300), nullable=False)
    excerpt = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    author_name = Column(String(100), nullable=False)
    author_role = Column(String(100), nullable=False)
    author_avatar = Column(String(500), nullable=False)
    cover_image = Column(String(500), nullable=False)
    read_time = Column(String(50), nullable=False)
    tags = Column(JSON, nullable=False) # list of tag strings
    published_at = Column(DateTime, default=datetime.utcnow)

class NursePassFAQ(Base):
    __tablename__ = "nursepass_faqs"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False) # Platform, AI Features, Courses, Pricing, Refund, Technical Support
    question = Column(String(300), nullable=False)
    answer = Column(Text, nullable=False)
    order = Column(Integer, default=0)

class NursePassContactLead(Base):
    __tablename__ = "nursepass_contact_leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(200), nullable=False)
    phone = Column(String(50), nullable=True)
    target_exam = Column(String(100), nullable=True)
    lead_type = Column(String(50), default="contact") # contact or consultation
    message = Column(Text, nullable=True)
    preferred_slot = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassSubscriber(Base):
    __tablename__ = "nursepass_subscribers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(200), unique=True, index=True, nullable=False)
    source = Column(String(100), default="footer_newsletter")
    subscribed_at = Column(DateTime, default=datetime.utcnow)

class NursePassAnalyticsEvent(Base):
    __tablename__ = "nursepass_analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String(100), nullable=False)
    path = Column(String(200), nullable=False)
    user_agent = Column(String(300), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

# --- Module NP-M02: Authentication & User Management Models ---

class NursePassUserProfile(Base):
    __tablename__ = "nursepass_user_profiles"
    __table_args__ = {'extend_existing': True}

    id = Column(String(100), primary_key=True, index=True) # UUID string matching auth.users
    email = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    mobile = Column(String(50), nullable=True)
    country = Column(String(100), nullable=True)
    role = Column(String(50), default="student") # student, faculty, institution_admin, platform_admin
    qualification = Column(String(100), nullable=True) # BSc Nursing, Diploma GNM, MSc, etc.
    experience = Column(String(50), nullable=True) # 0-1 yrs, 2-5 yrs, 5+ yrs
    employer = Column(String(255), nullable=True)
    target_exam = Column(String(100), default="NCLEX-RN")
    target_exam_date = Column(String(50), nullable=True)
    daily_study_goal_mins = Column(Integer, default=60)
    avatar_url = Column(Text, nullable=True)
    onboarding_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class NursePassPaymentHistory(Base):
    __tablename__ = "nursepass_payment_history"
    __table_args__ = {'extend_existing': True}

    id = Column(String(100), primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    order_id = Column(String(200), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    plan_id = Column(String(50), nullable=False)
    status = Column(String(50), default="completed")
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassNotificationPref(Base):
    __tablename__ = "nursepass_user_notification_prefs"
    __table_args__ = {'extend_existing': True}

    user_id = Column(String(100), primary_key=True, index=True)
    email_updates = Column(Boolean, default=True)
    sms_updates = Column(Boolean, default=False)
    exam_reminders = Column(Boolean, default=True)
    promotional_emails = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class NursePassUserActivity(Base):
    __tablename__ = "nursepass_user_activity"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    activity_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    ip_address = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassExamPref(Base):
    __tablename__ = "nursepass_exam_preferences"
    __table_args__ = {'extend_existing': True}

    user_id = Column(String(100), primary_key=True, index=True)
    target_exam = Column(String(100), default="NCLEX-RN")
    target_date = Column(String(50), nullable=True)
    study_hours_per_day = Column(Integer, default=2)
    weak_topics = Column(JSON, default=list)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# --- Module NP-M03: Student Dashboard Models ---

class NursePassStudySession(Base):
    __tablename__ = "nursepass_study_sessions"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    session_type = Column(String(100), nullable=False) # practice, mock_test, ai_chat, revision
    exam_slug = Column(String(100), default="nclex-rn")
    topic = Column(String(200), nullable=True)
    duration_mins = Column(Integer, default=15)
    questions_attempted = Column(Integer, default=0)
    accuracy_pct = Column(Float, default=0.0)
    score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassQuestionAttempt(Base):
    __tablename__ = "nursepass_question_attempts"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    question_id = Column(String(100), nullable=False)
    exam_slug = Column(String(100), default="nclex-rn")
    subject = Column(String(100), nullable=False)
    topic = Column(String(200), nullable=False)
    is_correct = Column(Boolean, default=True)
    time_spent_secs = Column(Integer, default=45)
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassMockTestResult(Base):
    __tablename__ = "nursepass_mock_test_results"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    exam_slug = Column(String(100), default="nclex-rn")
    score_pct = Column(Float, default=82.5)
    total_questions = Column(Integer, default=85)
    correct_count = Column(Integer, default=70)
    status = Column(String(50), default="Passed") # Passed, High Pass, Borderline
    time_taken_mins = Column(Integer, default=95)
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassStudyPlanTask(Base):
    __tablename__ = "nursepass_study_plan_tasks"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    task_title = Column(String(300), nullable=False)
    task_type = Column(String(50), default="practice") # practice, mock_test, revision, reading, writing, speaking
    estimated_mins = Column(Integer, default=20)
    is_completed = Column(Boolean, default=False)
    link_url = Column(String(200), nullable=True)
    due_date = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassDashboardNotification(Base):
    __tablename__ = "nursepass_dashboard_notifications"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="platform") # platform, exam, subscription, ai, announcement
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassDashboardBadge(Base):
    __tablename__ = "nursepass_dashboard_badges"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    badge_key = Column(String(100), nullable=False)
    badge_name = Column(String(150), nullable=False)
    icon_name = Column(String(100), default="Award")
    description = Column(String(250), nullable=False)
    earned_at = Column(DateTime, default=datetime.utcnow)

class NursePassUserNote(Base):
    __tablename__ = "nursepass_user_notes"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    topic = Column(String(150), nullable=False)
    title = Column(String(250), nullable=False)
    content_text = Column(Text, nullable=False)
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

# --- Module NP-M05: AI Mock Test Engine Models ---

class NursePassMockTestBlueprint(Base):
    __tablename__ = "nursepass_mock_blueprints"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(250), nullable=False)
    exam_slug = Column(String(100), nullable=False, index=True) # nclex-rn, cbt, oet, dha, haad, moh, prometric
    test_type = Column(String(50), default="full_length") # full_length, mini, subject, weak_area, adaptive, custom
    total_questions = Column(Integer, default=85)
    duration_mins = Column(Integer, default=120)
    passing_pct = Column(Float, default=75.0)
    subject_weightages = Column(JSON, default=dict)
    is_adaptive = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassMockQuestion(Base):
    __tablename__ = "nursepass_mock_questions"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    exam_slug = Column(String(100), nullable=False, index=True)
    subject = Column(String(100), nullable=False, index=True) # Med-Surg, Pharmacology, OB-GYN, Pediatrics, Psych
    topic = Column(String(200), nullable=False)
    difficulty = Column(String(50), default="medium") # easy, medium, hard
    question_type = Column(String(50), default="single_choice") # single_choice, sata, case_study
    stem_text = Column(Text, nullable=False)
    options_json = Column(JSON, nullable=False) # list of option objects [{id: 'A', text: '...'}, ...]
    correct_answer_json = Column(JSON, nullable=False) # list of correct option ids ['A'] or ['A', 'C', 'D']
    rationale_text = Column(Text, nullable=False)
    clinical_tip = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassMockTestSession(Base):
    __tablename__ = "nursepass_mock_test_sessions"
    __table_args__ = {'extend_existing': True}

    id = Column(String(100), primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    blueprint_id = Column(Integer, nullable=True)
    exam_slug = Column(String(100), nullable=False)
    test_type = Column(String(50), default="full_length")
    status = Column(String(50), default="in_progress") # in_progress, completed, expired
    total_questions = Column(Integer, default=20)
    current_index = Column(Integer, default=0)
    time_remaining_secs = Column(Integer, default=1800)
    answers_json = Column(JSON, default=dict) # { question_id: selected_options }
    flagged_json = Column(JSON, default=list) # list of flagged question_ids
    question_ids_json = Column(JSON, default=list) # order of question IDs
    started_at = Column(DateTime, default=datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)

class NursePassMockResultSummary(Base):
    __tablename__ = "nursepass_mock_result_summaries"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), unique=True, nullable=False, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    exam_slug = Column(String(100), nullable=False)
    test_title = Column(String(250), nullable=False)
    score_pct = Column(Float, nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_count = Column(Integer, nullable=False)
    incorrect_count = Column(Integer, nullable=False)
    skipped_count = Column(Integer, default=0)
    pass_status = Column(String(50), default="Pass") # Pass, High Pass, Fail, Borderline
    ai_readiness_score = Column(Float, default=85.0)
    percentile_rank = Column(Float, default=88.5)
    time_taken_mins = Column(Integer, default=25)
    subject_scores_json = Column(JSON, default=dict)
    ai_feedback_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassMockAnalytics(Base):
    __tablename__ = "nursepass_mock_analytics"
    __table_args__ = {'extend_existing': True}

    user_id = Column(String(100), primary_key=True, index=True)
    total_mock_tests = Column(Integer, default=0)
    passed_mock_tests = Column(Integer, default=0)
    average_score_pct = Column(Float, default=0.0)
    overall_readiness_score = Column(Float, default=0.0)
    strong_subjects_json = Column(JSON, default=list)
    weak_subjects_json = Column(JSON, default=list)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# --- Module NP-M06: AI Study Planner Models ---

class NursePassStudyPlan(Base):
    __tablename__ = "nursepass_study_plans"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    exam_slug = Column(String(100), default="nclex-rn")
    target_date = Column(String(50), nullable=False)
    preparation_level = Column(String(50), default="Intermediate")
    daily_study_hours = Column(Integer, default=2)
    weekly_roadmap_json = Column(JSON, default=list) # [{week: 1, title: "...", topics: [...]}, ...]
    ai_confidence_score = Column(Float, default=88.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class NursePassPlannerTask(Base):
    __tablename__ = "nursepass_planner_tasks"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, nullable=True)
    user_id = Column(String(100), nullable=False, index=True)
    task_title = Column(String(300), nullable=False)
    subject = Column(String(100), nullable=False)
    topic = Column(String(200), nullable=False)
    task_type = Column(String(50), default="practice") # practice, reading, mock_test, revision, tutor
    estimated_mins = Column(Integer, default=25)
    priority = Column(String(50), default="medium") # high, medium, low
    status = Column(String(50), default="pending") # pending, in_progress, completed, missed, rescheduled
    scheduled_date = Column(String(50), nullable=False)
    completed_at = Column(DateTime, nullable=True)

class NursePassPlannerGoal(Base):
    __tablename__ = "nursepass_planner_goals"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    goal_type = Column(String(50), default="weekly") # weekly, monthly
    title = Column(String(250), nullable=False)
    target_count = Column(Integer, default=300)
    current_count = Column(Integer, default=0)
    is_achieved = Column(Boolean, default=False)

class NursePassRevisionSchedule(Base):
    __tablename__ = "nursepass_revision_schedules"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    topic = Column(String(200), nullable=False)
    repetition_level = Column(Integer, default=1)
    next_review_date = Column(String(50), nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class NursePassAIInsight(Base):
    __tablename__ = "nursepass_ai_insights"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    insight_type = Column(String(100), default="performance") # performance, pattern, recommendation
    insight_text = Column(Text, nullable=False)
    action_recommendation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# --- Module NP-M07: AI OET Writing System Models ---

class NursePassWritingTask(Base):
    __tablename__ = "nursepass_writing_tasks"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(250), nullable=False)
    task_type = Column(String(50), default="referral") # referral, discharge, transfer, advice
    patient_name = Column(String(150), nullable=False)
    patient_dob = Column(String(50), nullable=False)
    hospital_no = Column(String(50), default="HN-90821")
    diagnosis = Column(String(250), nullable=False)
    case_notes_text = Column(Text, nullable=False)
    model_letter_text = Column(Text, nullable=False)
    difficulty = Column(String(50), default="medium")
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassWritingDraft(Base):
    __tablename__ = "nursepass_writing_drafts"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    task_id = Column(Integer, nullable=False, index=True)
    letter_text = Column(Text, nullable=False)
    word_count = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class NursePassWritingSubmission(Base):
    __tablename__ = "nursepass_writing_submissions"
    __table_args__ = {'extend_existing': True}

    id = Column(String(100), primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    task_id = Column(Integer, nullable=False)
    letter_text = Column(Text, nullable=False)
    word_count = Column(Integer, default=0)
    overall_band_grade = Column(String(50), default="Grade B") # Grade A, Grade B, Grade C+, Grade C, Grade D
    overall_score_num = Column(Float, default=380.0) # 0-500 scale
    purpose_score = Column(Float, default=3.0) # 0-3 scale
    content_score = Column(Float, default=5.0) # 0-7 scale
    organization_score = Column(Float, default=5.0) # 0-7 scale
    genre_score = Column(Float, default=6.0) # 0-7 scale
    language_score = Column(Float, default=5.0) # 0-7 scale
    submitted_at = Column(DateTime, default=datetime.utcnow)

class NursePassWritingFeedback(Base):
    __tablename__ = "nursepass_writing_feedbacks"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(String(100), unique=True, nullable=False, index=True)
    grammar_errors_json = Column(JSON, default=list) # [{original: '...', correction: '...', explanation: '...'}, ...]
    sentence_highlights_json = Column(JSON, default=list)
    improved_letter_text = Column(Text, nullable=False)
    ai_summary_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# --- Module NP-M08: AI Chat Tutor & Learning Assistant Models ---

class NursePassChatSession(Base):
    __tablename__ = "nursepass_chat_sessions"
    __table_args__ = {'extend_existing': True}

    id = Column(String(100), primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    title = Column(String(250), nullable=False)
    exam_slug = Column(String(100), default="nclex-rn")
    learning_mode = Column(String(50), default="study") # study, clinical_reasoning, exam_prep, case_discussion
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class NursePassChatMessage(Base):
    __tablename__ = "nursepass_chat_messages"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), nullable=False, index=True)
    sender = Column(String(50), nullable=False) # user, ai
    text_content = Column(Text, nullable=False)
    suggested_questions_json = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassAIMemory(Base):
    __tablename__ = "nursepass_ai_memories"
    __table_args__ = {'extend_existing': True}

    user_id = Column(String(100), primary_key=True, index=True)
    weak_subjects_json = Column(JSON, default=list)
    learning_style = Column(String(100), default="Visual & Practice-Oriented")
    frequently_asked_json = Column(JSON, default=list)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# --- Module NP-M09: AI Speaking Coach Models ---

class NursePassSpeakingScenario(Base):
    __tablename__ = "nursepass_speaking_scenarios"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(250), nullable=False)
    setting = Column(String(150), default="Suburban Community Health Clinic")
    patient_name = Column(String(150), nullable=False)
    patient_age = Column(String(50), nullable=False)
    clinical_situation = Column(Text, nullable=False)
    candidate_card_text = Column(Text, nullable=False)
    interlocutor_card_text = Column(Text, nullable=False)
    model_transcript_text = Column(Text, nullable=False)
    difficulty = Column(String(50), default="medium")
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassSpeakingSession(Base):
    __tablename__ = "nursepass_speaking_sessions"
    __table_args__ = {'extend_existing': True}

    id = Column(String(100), primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    scenario_id = Column(Integer, nullable=False)
    mode = Column(String(50), default="practice") # practice, simulation
    audio_duration_secs = Column(Integer, default=180)
    transcript_text = Column(Text, nullable=False)
    word_count = Column(Integer, default=0)
    words_per_minute = Column(Float, default=142.0)
    filler_count = Column(Integer, default=3)
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassSpeakingResult(Base):
    __tablename__ = "nursepass_speaking_results"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), unique=True, nullable=False, index=True)
    overall_band_grade = Column(String(50), default="Grade B (Pass)") # Grade A, Grade B, Grade C+, Grade C
    overall_score_num = Column(Float, default=370.0) # 0-500 scale
    clinical_communication_score = Column(Float, default=4.0) # 0-5 scale
    relationship_building_score = Column(Float, default=4.5) # 0-5 scale
    fluency_score = Column(Float, default=4.0) # 0-5 scale
    pronunciation_score = Column(Float, default=4.0) # 0-5 scale
    linguistic_score = Column(Float, default=4.5) # 0-5 scale
    strengths_json = Column(JSON, default=list)
    improvements_json = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

# --- Module NP-M10: Performance Analytics & AI Learning Insights Models ---

class NursePassAnalyticsSummary(Base):
    __tablename__ = "nursepass_analytics_summaries"
    __table_args__ = {'extend_existing': True}

    user_id = Column(String(100), primary_key=True, index=True)
    overall_accuracy_pct = Column(Float, default=84.5)
    questions_solved = Column(Integer, default=640)
    mock_tests_completed = Column(Integer, default=8)
    study_hours_total = Column(Float, default=42.5)
    study_streak_days = Column(Integer, default=14)
    pass_probability_pct = Column(Float, default=89.2)
    ai_readiness_score = Column(Float, default=88.5)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class NursePassSubjectAnalytics(Base):
    __tablename__ = "nursepass_subject_analytics"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    subject_name = Column(String(100), nullable=False) # Pharmacology, Med-Surg, OB-GYN, Pediatrics, Psych
    accuracy_pct = Column(Float, default=82.0)
    questions_attempted = Column(Integer, default=150)
    avg_time_secs = Column(Integer, default=45)
    completion_pct = Column(Float, default=75.0)
    confidence_score = Column(Float, default=85.0)

class NursePassTopicAnalytics(Base):
    __tablename__ = "nursepass_topic_analytics"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    subject_name = Column(String(100), nullable=False)
    topic_name = Column(String(200), nullable=False)
    is_strong = Column(Boolean, default=True)
    frequently_incorrect = Column(Boolean, default=False)
    mastery_pct = Column(Float, default=85.0)

class NursePassPerformanceForecast(Base):
    __tablename__ = "nursepass_performance_forecasts"
    __table_args__ = {'extend_existing': True}

    user_id = Column(String(100), primary_key=True, index=True)
    target_exam = Column(String(100), default="nclex-rn")
    predicted_score = Column(String(50), default="Passing Standard (Top 15%)")
    pass_probability_pct = Column(Float, default=89.2)
    readiness_date = Column(String(50), default="2026-10-15")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# --- Module NP-M11: Certificates, Achievements & Digital Credentials Models ---

class NursePassCertificate(Base):
    __tablename__ = "nursepass_certificates"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    cert_uuid = Column(String(100), unique=True, nullable=False, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    cert_type = Column(String(100), nullable=False) # course_completion, mock_excellence, study_milestone, oet_writing, oet_speaking
    title = Column(String(250), nullable=False)
    description = Column(Text, nullable=False)
    recipient_name = Column(String(150), nullable=False)
    issuing_authority = Column(String(150), default="NursePass International Exam Board")
    issue_date = Column(DateTime, default=datetime.utcnow)
    qr_verification_url = Column(String(250), nullable=False)
    is_valid = Column(Boolean, default=True)

class NursePassBadge(Base):
    __tablename__ = "nursepass_badges"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    badge_key = Column(String(100), nullable=False)
    title = Column(String(150), nullable=False)
    category = Column(String(100), default="Learning") # Learning, Performance, AI
    icon_name = Column(String(100), default="Award")
    unlocked_at = Column(DateTime, default=datetime.utcnow)

class NursePassAchievement(Base):
    __tablename__ = "nursepass_achievements"
    __table_args__ = {'extend_existing': True}

    user_id = Column(String(100), primary_key=True, index=True)
    total_xp = Column(Integer, default=3450)
    user_level = Column(Integer, default=5)
    user_title = Column(String(100), default="Level 5 Nurse Specialist")
    questions_milestone = Column(Integer, default=500)
    hours_milestone = Column(Integer, default=50)
    mock_milestone = Column(Integer, default=10)
    streak_days = Column(Integer, default=14)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# --- Module NP-M12: Payments & Subscription Management Models ---

class NursePassSubscription(Base):
    __tablename__ = "nursepass_subscriptions"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), unique=True, nullable=False, index=True)
    plan_id = Column(String(100), nullable=False, default="free")
    status = Column(String(50), default="active") # active, trial, expired, cancelled, refunded
    billing_cycle = Column(String(50), default="annual") # monthly, annual
    start_date = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(DateTime, default=datetime.utcnow)
    auto_renew = Column(Boolean, default=True)

class NursePassTransaction(Base):
    __tablename__ = "nursepass_transactions"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(100), unique=True, nullable=False, index=True) # Razorpay Order ID
    payment_id = Column(String(100), index=True) # Razorpay Payment ID
    signature = Column(String(250)) # Razorpay HMAC Signature
    user_id = Column(String(100), nullable=False, index=True)
    plan_id = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(50), default="created") # created, paid, failed, refunded
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassInvoice(Base):
    __tablename__ = "nursepass_invoices"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(100), unique=True, nullable=False, index=True) # e.g. INV-NP-2026-001
    user_id = Column(String(100), nullable=False, index=True)
    transaction_id = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)
    pdf_url = Column(String(250))
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassRefundRequest(Base):
    __tablename__ = "nursepass_refund_requests"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    transaction_id = Column(String(100), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(50), default="pending") # pending, approved, rejected
    refund_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

# --- Module NP-M13: Notifications & Communication Center Models ---

class NursePassNotificationItem(Base):
    __tablename__ = "nursepass_notification_items"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    category = Column(String(100), default="study") # study, mock, ai, subscription, achievement, platform
    priority = Column(String(50), default="normal") # low, normal, high, critical
    title = Column(String(250), nullable=False)
    message = Column(Text, nullable=False)
    action_url = Column(String(250), nullable=True)
    action_text = Column(String(100), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassNotificationPreference(Base):
    __tablename__ = "nursepass_notification_preferences"
    __table_args__ = {'extend_existing': True}

    user_id = Column(String(100), primary_key=True, index=True)
    study_reminders = Column(Boolean, default=True)
    mock_results = Column(Boolean, default=True)
    ai_evaluations = Column(Boolean, default=True)
    subscription_alerts = Column(Boolean, default=True)
    email_enabled = Column(Boolean, default=True)
    whatsapp_enabled = Column(Boolean, default=True)
    marketing_enabled = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class NursePassAnnouncement(Base):
    __tablename__ = "nursepass_announcements"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(250), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(100), default="General Announcement")
    priority = Column(String(50), default="Normal") # Low, Normal, Important, Critical
    target_audience = Column(String(100), default="all") # all, premium, institutions
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassWhatsAppLog(Base):
    __tablename__ = "nursepass_whatsapp_logs"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    phone_number = Column(String(50), nullable=False)
    template_name = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(50), default="Sent") # Sent, Delivered, Failed
    created_at = Column(DateTime, default=datetime.utcnow)

# --- Module NP-M14: Institution & College Management Models ---

class NursePassInstitution(Base):
    __tablename__ = "nursepass_institutions"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False) # e.g. CON-HARVARD-2026
    logo_url = Column(String(250), nullable=True)
    accreditation = Column(String(150), default="INC & CCNE Accredited")
    total_seats = Column(Integer, default=500)
    used_seats = Column(Integer, default=342)
    subscription_tier = Column(String(100), default="Enterprise B2B Plan")
    owner_user_id = Column(String(100), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassInstitutionUser(Base):
    __tablename__ = "nursepass_institution_users"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, nullable=False, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    role = Column(String(50), default="student") # owner, admin, faculty, student
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassFacultyProfile(Base):
    __tablename__ = "nursepass_faculty_profiles"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, nullable=False, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    department = Column(String(150), default="Medical-Surgical Nursing")
    assigned_subjects = Column(JSON, nullable=False) # array of subject strings
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassBatch(Base):
    __tablename__ = "nursepass_batches"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, nullable=False, index=True)
    name = Column(String(150), nullable=False) # e.g. NCLEX 2026 Spring Batch
    target_exam = Column(String(50), default="nclex-rn")
    academic_year = Column(String(50), default="2025-2026")
    capacity = Column(Integer, default=100)
    student_count = Column(Integer, default=45)
    faculty_name = Column(String(150), default="Dr. Sarah Jenkins, RN, MSN")
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassBatchStudent(Base):
    __tablename__ = "nursepass_batch_students"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, nullable=False, index=True)
    student_user_id = Column(String(100), nullable=False, index=True)
    enrolled_at = Column(DateTime, default=datetime.utcnow)

class NursePassAssignment(Base):
    __tablename__ = "nursepass_assignments"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, nullable=False, index=True)
    batch_id = Column(Integer, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    due_date = Column(DateTime, nullable=False)
    total_questions = Column(Integer, default=25)
    completed_students = Column(Integer, default=38)
    total_assigned = Column(Integer, default=45)
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassSeatAllocation(Base):
    __tablename__ = "nursepass_seat_allocations"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, nullable=False, index=True)
    student_user_id = Column(String(100), nullable=False, index=True)
    seat_key = Column(String(100), unique=True, nullable=False, index=True)
    status = Column(String(50), default="active") # active, revoked, expired
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# --- Module NP-M15: Super Admin Panel & Platform Management Models ---

class NursePassAdminUser(Base):
    __tablename__ = "nursepass_admin_users"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), unique=True, nullable=False, index=True)
    role = Column(String(50), default="super_admin") # super_admin, ops_admin, content_admin, finance_admin
    permissions = Column(JSON, nullable=False) # array of string permissions
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassAuditLog(Base):
    __tablename__ = "nursepass_audit_logs"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    admin_user_id = Column(String(100), nullable=False, index=True)
    action = Column(String(150), nullable=False)
    target_entity = Column(String(150), nullable=False)
    ip_address = Column(String(50), default="127.0.0.1")
    details = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class NursePassFeatureFlag(Base):
    __tablename__ = "nursepass_feature_flags"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    is_enabled = Column(Boolean, default=True)
    description = Column(String(250), nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class NursePassAIConfig(Base):
    __tablename__ = "nursepass_ai_configs"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(50), default="openai") # openai, anthropic, google
    model_name = Column(String(100), default="gpt-4o")
    temperature = Column(Float, default=0.7)
    max_tokens = Column(Integer, default=2048)
    cost_per_1k_tokens = Column(Float, default=0.005)
    is_active = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class NursePassSystemMetric(Base):
    __tablename__ = "nursepass_system_metrics"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    total_users = Column(Integer, default=12450)
    active_users_today = Column(Integer, default=1840)
    b2b_institutions = Column(Integer, default=24)
    arr = Column(Float, default=485000.0)
    daily_revenue = Column(Float, default=3420.0)
    ai_requests_today = Column(Integer, default=18400)
    server_uptime = Column(String(50), default="99.98%")
    created_at = Column(DateTime, default=datetime.utcnow)













