-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table (as per security requirements)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    selected_domain TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    preferred_content_format TEXT DEFAULT 'mixed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Create learning_progress table
CREATE TABLE public.learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    domain TEXT NOT NULL,
    module_id TEXT NOT NULL,
    module_name TEXT NOT NULL,
    status TEXT DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
    score INTEGER,
    total_time_seconds INTEGER,
    attempts INTEGER DEFAULT 0,
    last_completed_at TIMESTAMPTZ,
    revision_urgency TEXT CHECK (revision_urgency IN ('high', 'medium', 'low')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, module_id)
);

ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
ON public.learning_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.learning_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.learning_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Create quiz_analytics table
CREATE TABLE public.quiz_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    module_id TEXT NOT NULL,
    quiz_type TEXT NOT NULL CHECK (quiz_type IN ('diagnostic', 'module')),
    questions_data JSONB NOT NULL,
    total_score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    total_time_seconds INTEGER NOT NULL,
    time_per_question JSONB,
    concepts_covered TEXT[],
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics"
ON public.quiz_analytics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics"
ON public.quiz_analytics FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = _role
    )
$$;