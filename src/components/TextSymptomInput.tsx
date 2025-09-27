import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send } from "lucide-react";

interface TextSymptomInputProps {
  onAnalysis: (result: any) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

const TextSymptomInput = ({ onAnalysis, isAnalyzing, setIsAnalyzing }: TextSymptomInputProps) => {
  const [symptoms, setSymptoms] = useState("");
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      toast({
        title: "Input Required",
        description: "Please describe your symptoms",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-symptoms', {
        body: { 
          type: 'text',
          input: symptoms 
        }
      });

      if (error) throw error;

      const result = {
        id: Date.now().toString(),
        type: 'text' as const,
        input: symptoms,
        analysis: data.analysis,
        timestamp: new Date()
      };

      onAnalysis(result);
      setSymptoms("");
      
      toast({
        title: "Analysis Complete",
        description: "Your symptoms have been analyzed successfully"
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze symptoms. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="symptoms">Describe Your Symptoms</Label>
        <Textarea
          id="symptoms"
          placeholder="Please describe your symptoms in detail. Include when they started, how severe they are, and any other relevant information..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className="min-h-[120px] resize-none"
          disabled={isAnalyzing}
        />
      </div>
      
      <Button 
        onClick={handleAnalyze}
        disabled={isAnalyzing || !symptoms.trim()}
        className="w-full"
        variant="medical"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing Symptoms...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Analyze Symptoms
          </>
        )}
      </Button>
    </div>
  );
};

export default TextSymptomInput;