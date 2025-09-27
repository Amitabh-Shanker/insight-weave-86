import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mic, MicOff, Play, Square, Loader2 } from "lucide-react";

interface VoiceSymptomInputProps {
  onAnalysis: (result: any) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

const VoiceSymptomInput = ({ onAnalysis, isAnalyzing, setIsAnalyzing }: VoiceSymptomInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Describe your symptoms clearly"
      });
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "Recording Error",
        description: "Unable to access microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording Stopped",
        description: "You can now play back or analyze your recording"
      });
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      
      audio.play();
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const analyzeVoice = async () => {
    if (!audioBlob) return;

    setIsAnalyzing(true);
    
    try {
      // Convert audio to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const { data, error } = await supabase.functions.invoke('analyze-symptoms', {
        body: { 
          type: 'voice',
          input: base64Audio 
        }
      });

      if (error) throw error;

      const result = {
        id: Date.now().toString(),
        type: 'voice' as const,
        input: 'Voice recording',
        analysis: data.analysis,
        timestamp: new Date()
      };

      onAnalysis(result);
      setAudioBlob(null);
      
      toast({
        title: "Analysis Complete",
        description: "Your voice recording has been analyzed successfully"
      });
    } catch (error) {
      console.error('Voice analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze voice recording. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center space-y-4 p-6 border-2 border-dashed border-border rounded-lg">
        <div className="text-center">
          <h4 className="text-lg font-medium">Voice Recording</h4>
          <p className="text-sm text-muted-foreground">
            Click record and describe your symptoms clearly
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {!isRecording && !audioBlob && (
            <Button
              onClick={startRecording}
              disabled={isAnalyzing}
              variant="medical"
              size="lg"
            >
              <Mic className="w-5 h-5 mr-2" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <Button
              onClick={stopRecording}
              variant="destructive"
              size="lg"
            >
              <MicOff className="w-5 h-5 mr-2" />
              Stop Recording
            </Button>
          )}

          {audioBlob && !isPlaying && (
            <Button
              onClick={playRecording}
              variant="outline"
              disabled={isAnalyzing}
            >
              <Play className="w-4 h-4 mr-2" />
              Play
            </Button>
          )}

          {audioBlob && isPlaying && (
            <Button
              onClick={stopPlayback}
              variant="outline"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          )}

          {audioBlob && (
            <Button
              onClick={analyzeVoice}
              disabled={isAnalyzing}
              variant="medical"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Recording'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceSymptomInput;