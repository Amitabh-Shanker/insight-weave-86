import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuestionnaireOnboarding = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState({
    age: "",
    gender: "",
    chronic_conditions: "",
    medications: "",
    allergies: "",
    primary_concern: "",
    issue_duration: "",
    pain_level: "",
    recent_travel: "",
    past_surgeries: "",
    substance_use: "",
    doctor_contact_preference: ""
  });

  const questions = [
    {
      id: "age",
      question: "What is your age?",
      type: "number",
      placeholder: "Enter your age"
    },
    {
      id: "gender",
      question: "What is your gender?",
      type: "radio",
      options: ["Male", "Female", "Other", "Prefer not to say"]
    },
    {
      id: "chronic_conditions",
      question: "Do you have any chronic medical conditions?",
      type: "textarea",
      placeholder: "e.g., Diabetes, Hypertension, Asthma (or type 'None')"
    },
    {
      id: "medications",
      question: "Are you currently taking any medications?",
      type: "textarea",
      placeholder: "List medications or type 'None'"
    },
    {
      id: "allergies",
      question: "Do you have any allergies?",
      type: "textarea",
      placeholder: "List allergies or type 'None'"
    },
    {
      id: "primary_concern",
      question: "What is your primary health concern?",
      type: "textarea",
      placeholder: "Describe your main health concern"
    },
    {
      id: "issue_duration",
      question: "How long have you been experiencing this issue?",
      type: "radio",
      options: ["Less than a week", "1-2 weeks", "2-4 weeks", "1-3 months", "More than 3 months"]
    },
    {
      id: "pain_level",
      question: "On a scale of 1–10, what is your pain level?",
      type: "radio",
      options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
    },
    {
      id: "recent_travel",
      question: "Have you traveled recently?",
      type: "textarea",
      placeholder: "Describe recent travel or type 'None'"
    },
    {
      id: "past_surgeries",
      question: "Do you have any past surgeries or major health events?",
      type: "textarea",
      placeholder: "List past surgeries or type 'None'"
    },
    {
      id: "substance_use",
      question: "Do you smoke or drink?",
      type: "radio",
      options: ["Never", "Occasionally", "Regularly", "Prefer not to say"]
    },
    {
      id: "doctor_contact_preference",
      question: "Would you like a doctor to contact you about your concerns?",
      type: "radio",
      options: ["Yes", "No"]
    }
  ];

  const currentQ = questions[currentQuestion];

  const handleNext = () => {
    const answer = answers[currentQ.id as keyof typeof answers];
    if (!answer || answer.trim() === "") {
      toast({
        title: "Answer Required",
        description: "Please answer the question before proceeding.",
        variant: "destructive"
      });
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      // Convert answers to the correct format
      const questionnaireData = {
        patient_id: user.id,
        age: answers.age ? parseInt(answers.age) : null,
        gender: answers.gender || null,
        chronic_conditions: answers.chronic_conditions || null,
        medications: answers.medications || null,
        allergies: answers.allergies || null,
        primary_concern: answers.primary_concern || null,
        issue_duration: answers.issue_duration || null,
        pain_level: answers.pain_level ? parseInt(answers.pain_level) : null,
        recent_travel: answers.recent_travel || null,
        past_surgeries: answers.past_surgeries || null,
        substance_use: answers.substance_use || null,
        doctor_contact_preference: answers.doctor_contact_preference === "Yes"
      };

      const { error } = await supabase
        .from('patient_questionnaire')
        .insert(questionnaireData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Questionnaire completed successfully!",
      });

      navigate('/patient-dashboard');
    } catch (error: any) {
      console.error('Error submitting questionnaire:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit questionnaire",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentQ.id]: value
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Patient Health Questionnaire</CardTitle>
          <CardDescription>
            Question {currentQuestion + 1} of {questions.length}
          </CardDescription>
          <div className="w-full bg-muted rounded-full h-2 mt-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-lg font-medium">{currentQ.question}</Label>
            
            {currentQ.type === "number" && (
              <Input
                type="number"
                placeholder={currentQ.placeholder}
                value={answers[currentQ.id as keyof typeof answers]}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full"
              />
            )}

            {currentQ.type === "textarea" && (
              <Textarea
                placeholder={currentQ.placeholder}
                value={answers[currentQ.id as keyof typeof answers]}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full min-h-[100px]"
              />
            )}

            {currentQ.type === "radio" && currentQ.options && (
              <RadioGroup
                value={answers[currentQ.id as keyof typeof answers]}
                onValueChange={handleInputChange}
              >
                {currentQ.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0 || loading}
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : currentQuestion === questions.length - 1 ? (
                "Submit"
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionnaireOnboarding;
