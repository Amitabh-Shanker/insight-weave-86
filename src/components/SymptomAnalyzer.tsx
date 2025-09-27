import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquareText, Mic, Image as ImageIcon, Activity } from "lucide-react";
import TextSymptomInput from "@/components/TextSymptomInput";
import VoiceSymptomInput from "@/components/VoiceSymptomInput";
import ImageSymptomInput from "@/components/ImageSymptomInput";
import AnalysisResults from "@/components/AnalysisResults";

interface AnalysisResult {
  id: string;
  type: 'text' | 'voice' | 'image';
  input: string;
  analysis: {
    symptoms: string[];
    severity: 'low' | 'medium' | 'high';
    recommendations: string[];
    urgency: boolean;
  };
  timestamp: Date;
}

const SymptomAnalyzer = () => {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const addAnalysis = (result: AnalysisResult) => {
    setAnalyses(prev => [result, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Main Analysis Card */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Symptom Analysis
          </CardTitle>
          <CardDescription>
            Describe your symptoms through text, voice, or images for comprehensive AI analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <MessageSquareText className="w-4 h-4" />
                Text
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Voice
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Images
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="mt-6">
              <TextSymptomInput 
                onAnalysis={addAnalysis}
                isAnalyzing={isAnalyzing}
                setIsAnalyzing={setIsAnalyzing}
              />
            </TabsContent>
            
            <TabsContent value="voice" className="mt-6">
              <VoiceSymptomInput 
                onAnalysis={addAnalysis}
                isAnalyzing={isAnalyzing}
                setIsAnalyzing={setIsAnalyzing}
              />
            </TabsContent>
            
            <TabsContent value="image" className="mt-6">
              <ImageSymptomInput 
                onAnalysis={addAnalysis}
                isAnalyzing={isAnalyzing}
                setIsAnalyzing={setIsAnalyzing}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <AnalysisResults analyses={analyses} />
    </div>
  );
};

export default SymptomAnalyzer;