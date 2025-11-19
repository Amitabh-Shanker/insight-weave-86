import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Clock, MessageSquareText, Mic, Image as ImageIcon, Calendar } from "lucide-react";
import { format } from "date-fns";
import { AppointmentBooking } from "@/components/patient/AppointmentBooking";

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

interface AnalysisResultsProps {
  analyses: AnalysisResult[];
}

const AnalysisResults = ({ analyses }: AnalysisResultsProps) => {
  const [showBooking, setShowBooking] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);

  if (analyses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No Analysis Results Yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Your symptom analyses will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <MessageSquareText className="w-4 h-4" />;
      case 'voice':
        return <Mic className="w-4 h-4" />;
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-success text-success-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const shouldShowBooking = (analysis: AnalysisResult) => {
    const severity = analysis.analysis.severity?.toLowerCase() || '';
    const recommendations = Array.isArray(analysis.analysis.recommendations) 
      ? analysis.analysis.recommendations.join(' ').toLowerCase() 
      : '';
    const isUrgent = analysis.analysis.urgency || false;
    
    return isUrgent || 
           severity === 'high' || 
           recommendations.includes('see a doctor') ||
           recommendations.includes('medical attention') ||
           recommendations.includes('consult');
  };

  const handleBookAppointment = (analysis: AnalysisResult) => {
    setSelectedAnalysis(analysis);
    setShowBooking(true);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Analysis Results</h2>
      
      {analyses.map((result) => (
        <Card key={result.id} className={`shadow-card ${result.analysis.urgency ? 'border-destructive' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getTypeIcon(result.type)}
                {result.type.charAt(0).toUpperCase() + result.type.slice(1)} Analysis
                {result.analysis.urgency && (
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getSeverityColor(result.analysis.severity)}>
                  {result.analysis.severity.toUpperCase()} SEVERITY
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(result.timestamp, 'MMM d, HH:mm')}
                </Badge>
              </div>
            </div>
            <CardDescription>
              Input: {result.input}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {result.analysis.urgency && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 text-destructive font-medium mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Urgent Medical Attention Required
                </div>
                <p className="text-sm">
                  Based on the analysis, it's recommended to seek immediate medical attention.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-2">Identified Symptoms:</h4>
                <div className="flex flex-wrap gap-2">
                  {result.analysis.symptoms.map((symptom, index) => (
                    <Badge key={index} variant="secondary">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Recommendations:</h4>
                <ul className="space-y-1">
                  {result.analysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {shouldShowBooking(result) && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={() => handleBookAppointment(result)}
                  className="w-full"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment with Doctor
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book an Appointment</DialogTitle>
          </DialogHeader>
          <AppointmentBooking 
            analysisData={selectedAnalysis ? {
              symptoms: Array.isArray(selectedAnalysis.analysis.symptoms) 
                ? selectedAnalysis.analysis.symptoms.join(', ') 
                : '',
              severity: selectedAnalysis.analysis.severity || '',
              recommendations: Array.isArray(selectedAnalysis.analysis.recommendations)
                ? selectedAnalysis.analysis.recommendations.join('\n')
                : ''
            } : undefined}
            onSuccess={() => setShowBooking(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalysisResults;