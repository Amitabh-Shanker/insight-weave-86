import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageSymptomInputProps {
  onAnalysis: (result: any) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

const ImageSymptomInput = ({ onAnalysis, isAnalyzing, setIsAnalyzing }: ImageSymptomInputProps) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Please select only image files",
        variant: "destructive"
      });
    }

    setSelectedImages(prev => [...prev, ...imageFiles].slice(0, 5)); // Max 5 images
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeImages = async () => {
    if (selectedImages.length === 0) {
      toast({
        title: "No Images Selected",
        description: "Please select at least one image to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const imagePromises = selectedImages.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      });

      const base64Images = await Promise.all(imagePromises);

      const { data, error } = await supabase.functions.invoke('analyze-symptoms', {
        body: { 
          type: 'image',
          input: base64Images 
        }
      });

      if (error) throw error;

      const result = {
        id: Date.now().toString(),
        type: 'image' as const,
        input: `${selectedImages.length} medical image(s)`,
        analysis: data.analysis,
        timestamp: new Date()
      };

      onAnalysis(result);
      setSelectedImages([]);
      
      toast({
        title: "Analysis Complete",
        description: "Your medical images have been analyzed successfully"
      });
    } catch (error) {
      console.error('Image analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze images. Please try again.",
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
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div 
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-medium mb-2">Upload Medical Images</h4>
          <p className="text-sm text-muted-foreground">
            Click to select images or drag and drop (max 5 images)
          </p>
        </div>

        {selectedImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {selectedImages.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Medical image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={analyzeImages}
          disabled={isAnalyzing || selectedImages.length === 0}
          className="w-full"
          variant="medical"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Images...
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4 mr-2" />
              Analyze Images ({selectedImages.length})
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ImageSymptomInput;