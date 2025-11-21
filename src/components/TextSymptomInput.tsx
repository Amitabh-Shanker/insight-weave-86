import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, CheckCircle2, Activity } from "lucide-react";

interface TextSymptomInputProps {
  onAnalysis: (result: any) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

const TextSymptomInput = ({ onAnalysis, isAnalyzing, setIsAnalyzing }: TextSymptomInputProps) => {
  const [symptoms, setSymptoms] = useState("");
  const [normalizedText, setNormalizedText] = useState("");
  const { toast } = useToast();

  const handleAnalyze = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!symptoms.trim()) {
      toast({
        title: "Input Required",
        description: "Please describe your symptoms",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setNormalizedText("");

    try {
      const response = await fetch("http://127.0.0.1:8000/predict_text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text: symptoms
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Backend error");
      }

      const data = await response.json();
      console.log("API Response:", data);

      // ✅ Map symptoms with confidence from backend
      const symptomsWithConfidence = (data.symptoms_with_confidence || []).map((s: any) => ({
        name: s.symptom || s.name || s,
        confidence: s.confidence || 0.85,
        source: s.source || "model" // 'model' or 'rule'
      }));

      // ✅ Format the response
      const result = {
        id: Date.now().toString(),
        type: "text" as const,
        input: symptoms,
        normalizedInput: symptoms.toLowerCase().trim(),
        analysis: {
          symptoms: data.symptoms || [],
          symptomsWithConfidence: symptomsWithConfidence,
          treatments: data.care_tips || [],
          severity: data.severity || "moderate",
          recommendations: data.recommendations || [],
          urgency: data.severity === "emergency" || data.severity === "urgent",
          entityCount: (data.symptoms || []).length,
          hasEntities: (data.symptoms || []).length > 0,
          extractionStats: data.extraction_stats || {
            total_symptoms: (data.symptoms || []).length,
            model_extracted: 0,
            rule_enhanced: 0
          }
        },
        timestamp: new Date(),
      };

      console.log("Formatted Result:", result);

      onAnalysis(result);
      setSymptoms("");
      setNormalizedText("");

      // ✅ Enhanced toast with extraction stats
      const stats = result.analysis.extractionStats;
      let description = `Found ${result.analysis.symptoms.length} symptom(s)`;
      
      if (stats.model_extracted > 0 && stats.rule_enhanced > 0) {
        description += ` (${stats.model_extracted} by AI, ${stats.rule_enhanced} enhanced)`;
      } else if (stats.model_extracted > 0) {
        description += ` (detected by AI model)`;
      } else if (stats.rule_enhanced > 0) {
        description += ` (detected by rules)`;
      }

      toast({
        title: "✓ Analysis Complete",
        description: description,
        duration: 3000,
      });
      
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Error",
        description: error instanceof Error ? error.message : "Failed to analyze symptoms",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const buttonElement = document.getElementById('analyze-button');
      if (buttonElement) {
        buttonElement.click();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="symptoms" className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Describe Your Symptoms
        </Label>
        <Textarea
          id="symptoms"
          placeholder="Please describe your symptoms in detail. Include when they started, how severe they are, and any other relevant information...&#10;&#10;Examples:&#10;• I have severe chest pain and difficulty breathing&#10;• My throat hurts and I'm coughing&#10;• Headache and dizziness since yesterday&#10;• High fever of 103°F for 2 days"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[140px] resize-none"
          disabled={isAnalyzing}
        />
        
        {normalizedText && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Text Corrected:</p>
                <p className="text-green-700 mt-1">"{normalizedText}"</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Button
        id="analyze-button"
        type="button"
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

      {/* Helpful tips */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>💡 <strong>Tips for better results:</strong></p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>Describe all your symptoms clearly</li>
          <li>Include severity (mild, moderate, severe)</li>
          <li>Mention when symptoms started</li>
          <li>Be specific about pain location and intensity</li>
          <li>Press Ctrl+Enter (or Cmd+Enter) to analyze quickly</li>
        </ul>
      </div>

      {/* AI Model Info */}
      <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md border border-muted">
        <p className="font-medium mb-1">🤖 Hybrid AI Analysis:</p>
        <p>
          Uses your trained NER model enhanced with medical rule patterns for maximum accuracy. 
          Symptoms are extracted with confidence scores and source attribution.
        </p>
      </div>
    </div>
  );
};

export default TextSymptomInput;