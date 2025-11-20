-- Create doctors table
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  medical_license_number TEXT NOT NULL,
  specialty TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- RLS policies for doctors table
CREATE POLICY "Doctors can view their own profile"
  ON public.doctors
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Doctors can update their own profile"
  ON public.doctors
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Doctors can insert their own profile"
  ON public.doctors
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for patients table
CREATE POLICY "Patients can view their own profile"
  ON public.patients
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Patients can update their own profile"
  ON public.patients
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Patients can insert their own profile"
  ON public.patients
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Doctors can view basic patient info for appointments
CREATE POLICY "Doctors can view patient basic info"
  ON public.patients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.patient_id = patients.user_id
      AND appointments.doctor_id = auth.uid()
    )
  );

-- Update triggers for timestamp management
CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update the handle_new_user function to insert into appropriate table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, first_name, last_name, user_type, medical_license_number, specialty)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'user_type',
    NEW.raw_user_meta_data ->> 'medical_license_number',
    NEW.raw_user_meta_data ->> 'specialty'
  );
  
  -- Insert into user_roles table
  IF NEW.raw_user_meta_data ->> 'user_type' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, (NEW.raw_user_meta_data ->> 'user_type')::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- Insert into doctors or patients table based on user_type
  IF NEW.raw_user_meta_data ->> 'user_type' = 'doctor' THEN
    INSERT INTO public.doctors (
      user_id,
      first_name,
      last_name,
      email,
      medical_license_number,
      specialty
    )
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'first_name',
      NEW.raw_user_meta_data ->> 'last_name',
      NEW.email,
      NEW.raw_user_meta_data ->> 'medical_license_number',
      NEW.raw_user_meta_data ->> 'specialty'
    )
    ON CONFLICT (user_id) DO NOTHING;
    
  ELSIF NEW.raw_user_meta_data ->> 'user_type' = 'patient' THEN
    INSERT INTO public.patients (
      user_id,
      first_name,
      last_name,
      email
    )
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'first_name',
      NEW.raw_user_meta_data ->> 'last_name',
      NEW.email
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Migrate existing users to appropriate tables
INSERT INTO public.doctors (user_id, first_name, last_name, email, medical_license_number, specialty)
SELECT 
  p.user_id,
  p.first_name,
  p.last_name,
  au.email,
  p.medical_license_number,
  p.specialty
FROM public.profiles p
JOIN auth.users au ON au.id = p.user_id
WHERE p.user_type = 'doctor'
  AND p.medical_license_number IS NOT NULL
  AND p.specialty IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.patients (user_id, first_name, last_name, email)
SELECT 
  p.user_id,
  p.first_name,
  p.last_name,
  au.email
FROM public.profiles p
JOIN auth.users au ON au.id = p.user_id
WHERE p.user_type = 'patient'
ON CONFLICT (user_id) DO NOTHING;