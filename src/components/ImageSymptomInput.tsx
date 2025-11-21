import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageSymptomInputProps {
  onAnalysis: (result: any) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

const ImageSymptomInput = ({ onAnalysis, isAnalyzing, setIsAnalyzing }: ImageSymptomInputProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      toast({
        title: "No Image Selected",
        description: "Please select an image to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);

      const response = await fetch('http://127.0.0.1:8000/predict_image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Image analysis failed');
      }

      const data = await response.json();
      console.log("Image API Response:", data);

      // Format diseases with confidence
      const diseasesWithConfidence = (data.diseases || []).map((d: any) => ({
        name: d.name,
        confidence: d.confidence || 0.5
      }));

      const result = {
        id: Date.now().toString(),
        type: 'image' as const,
        input: `Medical image: ${selectedImage.name}`,
        analysis: {
          symptoms: [],
          symptomsWithConfidence: diseasesWithConfidence,
          treatments: data.care_tips || [],
          severity: data.severity || 'moderate',
          recommendations: data.recommendations || [],
          urgency: data.severity === 'emergency' || data.severity === 'urgent',
          entityCount: (data.diseases || []).length,
          hasEntities: (data.diseases || []).length > 0,
        },
        timestamp: new Date()
      };

      console.log("Formatted Image Result:", result);

      onAnalysis(result);
      removeImage();
      
      toast({
        title: "✓ Analysis Complete",
        description: `Detected: ${data.diseases[0]?.name || 'Unknown condition'}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Image analysis error:', error);
      toast({
        title: "Analysis Error",
        description: error instanceof Error ? error.message : "Failed to analyze image",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {!selectedImage ? (
          <div 
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="text-lg font-medium mb-2">Upload Skin Condition Image</h4>
            <p className="text-sm text-muted-foreground">
              Click to select an image of the affected area
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Supported formats: JPG, PNG, JPEG
            </p>
          </div>
        ) : (
          <div className="relative group">
            <img
              src={previewUrl || ''}
              alt="Selected medical image"
              className="w-full h-64 object-cover rounded-lg border"
            />
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2 opacity-90 group-hover:opacity-100 transition-opacity"
              onClick={removeImage}
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </Button>
            <div className="mt-2 p-2 bg-muted rounded text-xs">
              <p className="font-medium truncate">{selectedImage.name}</p>
              <p className="text-muted-foreground">
                {(selectedImage.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
        )}

        <Button
          onClick={analyzeImage}
          disabled={isAnalyzing || !selectedImage}
          className="w-full"
          variant="medical"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Image...
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4 mr-2" />
              Analyze Skin Condition
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 <strong>Tips for better results:</strong></p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>Ensure good lighting (natural light is best)</li>
            <li>Take photo directly above the affected area</li>
            <li>Avoid shadows and blurry images</li>
            <li>Include surrounding healthy skin for comparison</li>
          </ul>
        </div>

        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md border border-muted">
          <p className="font-medium mb-1">🔬 AI Skin Analysis:</p>
          <p>
            Our AI model is trained on 10 common skin conditions including eczema, psoriasis, melanoma, 
            fungal infections, and more. Results are for screening purposes only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageSymptomInput;