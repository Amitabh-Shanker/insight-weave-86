-- Create patient_questionnaire table to store all answers in one row per patient
CREATE TABLE public.patient_questionnaire (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL UNIQUE,
  age INTEGER,
  gender TEXT,
  chronic_conditions TEXT,
  medications TEXT,
  allergies TEXT,
  primary_concern TEXT,
  issue_duration TEXT,
  pain_level INTEGER,
  recent_travel TEXT,
  past_surgeries TEXT,
  substance_use TEXT,
  doctor_contact_preference BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.patient_questionnaire ENABLE ROW LEVEL SECURITY;

-- Policies for patient_questionnaire
CREATE POLICY "Users can view their own questionnaire"
ON public.patient_questionnaire
FOR SELECT
USING (auth.uid() = patient_id);

CREATE POLICY "Users can insert their own questionnaire"
ON public.patient_questionnaire
FOR INSERT
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can update their own questionnaire"
ON public.patient_questionnaire
FOR UPDATE
USING (auth.uid() = patient_id);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_patient_questionnaire_updated_at
BEFORE UPDATE ON public.patient_questionnaire
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();