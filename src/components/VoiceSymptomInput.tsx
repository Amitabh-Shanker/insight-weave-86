import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Loader2, Volume2, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface VoiceSymptomInputProps {
  onAnalysis: (result: any) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

// Extend Window interface for webkit speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const VoiceSymptomInput = ({ onAnalysis, isAnalyzing, setIsAnalyzing }: VoiceSymptomInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support speech recognition. Please use Chrome or Edge.",
        variant: "destructive"
      });
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptPiece + ' ';
        } else {
          interim += transcriptPiece;
        }
      }

      if (final) {
        setTranscript(prev => prev + final);
        setInterimTranscript('');
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'Speech recognition error occurred';
      if (event.error === 'no-speech') {
        errorMessage = 'No speech detected. Please try again.';
      } else if (event.error === 'network') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Microphone access denied. Please enable microphone permissions.';
      }

      toast({
        title: "Recognition Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        toast({
          title: "🎤 Listening...",
          description: "Speak clearly and describe your symptoms",
        });
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast({
          title: "Error",
          description: "Failed to start speech recognition",
          variant: "destructive"
        });
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      toast({
        title: "Recording Stopped",
        description: "You can now analyze your symptoms or continue recording",
      });
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
  };

  const analyzeVoiceSymptoms = async () => {
    const finalText = transcript.trim();
    
    if (!finalText) {
      toast({
        title: "No Speech Detected",
        description: "Please record your symptoms first",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Call the existing text prediction endpoint
      const response = await fetch('http://127.0.0.1:8000/predict_text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: finalText }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Analysis failed');
      }

      const data = await response.json();
      console.log("Voice API Response:", data);

      // Map symptoms with confidence from backend
      const symptomsWithConfidence = (data.symptoms_with_confidence || []).map((s: any) => ({
        name: s.symptom || s.name || s,
        confidence: s.confidence || 0.85,
        source: s.source || "model"
      }));

      // Format the response
      const result = {
        id: Date.now().toString(),
        type: 'voice' as const,
        input: finalText,
        normalizedInput: finalText.toLowerCase().trim(),
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

      console.log("Formatted Voice Result:", result);

      onAnalysis(result);
      clearTranscript();

      toast({
        title: "✓ Analysis Complete",
        description: `Found ${result.analysis.symptoms.length} symptom(s) from your voice recording`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Voice analysis error:', error);
      toast({
        title: "Analysis Error",
        description: error instanceof Error ? error.message : "Failed to analyze symptoms",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const displayText = transcript + (interimTranscript ? ` ${interimTranscript}` : '');

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {/* Recording Controls */}
        <div className="flex flex-col items-center space-y-4 p-6 border-2 border-dashed border-border rounded-lg bg-muted/30">
          <div className="text-center">
            <Volume2 className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
            <h4 className="text-lg font-medium">Voice Input</h4>
            <p className="text-sm text-muted-foreground">
              Click the microphone and describe your symptoms
            </p>
          </div>

          <div className="flex gap-3">
            {!isListening ? (
              <Button
                onClick={startListening}
                disabled={isAnalyzing}
                variant="medical"
                size="lg"
                className="min-w-[160px]"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Speaking
              </Button>
            ) : (
              <Button
                onClick={stopListening}
                variant="destructive"
                size="lg"
                className="min-w-[160px] animate-pulse"
              >
                <MicOff className="w-5 h-5 mr-2" />
                Stop Speaking
              </Button>
            )}

            {transcript && !isListening && (
              <Button
                onClick={clearTranscript}
                variant="outline"
                size="lg"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {isListening && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span>Listening...</span>
            </div>
          )}
        </div>

        {/* Transcript Display */}
        {displayText && (
          <div className="space-y-2">
            <Label>Recognized Speech:</Label>
            <Textarea
              value={displayText}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your speech will appear here..."
              className="min-h-[120px] resize-none"
              disabled={isListening}
            />
            {interimTranscript && (
              <p className="text-xs text-muted-foreground italic">
                Still listening... (text shown is temporary)
              </p>
            )}
          </div>
        )}

        {/* Analyze Button */}
        <Button
          onClick={analyzeVoiceSymptoms}
          disabled={isAnalyzing || !transcript.trim() || isListening}
          className="w-full"
          variant="medical"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Speech...
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Analyze Symptoms
            </>
          )}
        </Button>

        {/* Tips */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 <strong>Tips for better recognition:</strong></p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>Speak clearly and at a moderate pace</li>
            <li>Minimize background noise</li>
            <li>Describe symptoms in detail (severity, duration, location)</li>
            <li>You can edit the text before analyzing</li>
            <li>Click "Stop Speaking" when done</li>
          </ul>
        </div>

        {/* Browser Support Info */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md border border-muted">
          <p className="font-medium mb-1">🎙️ Speech Recognition:</p>
          <p>
            Uses your browser's built-in speech recognition. Works best in Chrome and Edge.
            Your voice is processed using the same AI model as text input.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceSymptomInput;