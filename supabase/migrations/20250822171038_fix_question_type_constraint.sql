-- Fix the question_type check constraint to allow all the question types from the frontend
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_question_type_check;

-- Add the correct check constraint with all supported question types
ALTER TABLE public.questions ADD CONSTRAINT questions_question_type_check
CHECK (question_type IN (
  'multiple_choice',
  'fill_blank',
  'written',
  'poll',
  'true_false',
  'complete',
  'matching',
  'translate',
  'paragraph'
));
