-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teacher_verifications table
CREATE TABLE public.teacher_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  years_experience INTEGER NOT NULL,
  certification_type TEXT NOT NULL CHECK (certification_type IN ('local', 'global')),
  employment_type TEXT NOT NULL CHECK (employment_type IN ('school', 'private')),
  subject_expertise TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exams table
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL CHECK (language IN ('english', 'arabic')),
  time_limit INTEGER, -- in minutes, null means no limit
  attempt_limit INTEGER DEFAULT 1,
  color_scheme JSONB DEFAULT '{"primary": "#3b82f6", "secondary": "#6b7280"}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  share_link UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'fill_blank', 'written_response', 'true_false', 'translation', 'matching', 'reading_comprehension')),
  question_text TEXT NOT NULL,
  question_data JSONB NOT NULL, -- stores type-specific data like options, correct answers, etc.
  order_index INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exam_attempts table
CREATE TABLE public.exam_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  score DECIMAL(5,2),
  total_points INTEGER,
  answers JSONB NOT NULL DEFAULT '{}',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for teacher_verifications
CREATE POLICY "Teachers can view their own verification" 
ON public.teacher_verifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Teachers can insert their own verification" 
ON public.teacher_verifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for exams
CREATE POLICY "Teachers can manage their own exams" 
ON public.exams 
FOR ALL 
USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view active exams" 
ON public.exams 
FOR SELECT 
USING (is_active = true);

-- Create policies for questions
CREATE POLICY "Teachers can manage questions for their exams" 
ON public.questions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.exams 
    WHERE exams.id = questions.exam_id 
    AND exams.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view questions for active exams" 
ON public.questions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.exams 
    WHERE exams.id = questions.exam_id 
    AND exams.is_active = true
  )
);

-- Create policies for exam_attempts
CREATE POLICY "Students can view their own attempts" 
ON public.exam_attempts 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own attempts" 
ON public.exam_attempts 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own attempts" 
ON public.exam_attempts 
FOR UPDATE 
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view attempts for their exams" 
ON public.exam_attempts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.exams 
    WHERE exams.id = exam_attempts.exam_id 
    AND exams.teacher_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student'),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_exams_teacher_id ON public.exams(teacher_id);
CREATE INDEX idx_exams_share_link ON public.exams(share_link);
CREATE INDEX idx_questions_exam_id ON public.questions(exam_id);
CREATE INDEX idx_exam_attempts_exam_id ON public.exam_attempts(exam_id);
CREATE INDEX idx_exam_attempts_student_id ON public.exam_attempts(student_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);