import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Brain, MessageSquare, Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-healthcare.jpg";

export const HeroSection = () => {
  const { user } = useAuth();

  const handleStartAnalysis = () => {
    if (user) {
      window.location.href = '/patient-dashboard';
    } else {
      window.location.href = '/patient-auth';
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-health pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="inline-flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI-Powered Healthcare
              </Badge>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-foreground">Smart Healthcare</span>
                <br />
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  At Your Fingertips
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Experience next-generation healthcare with our AI-driven virtual assistant. 
                Get instant symptom analysis through text, voice, and image inputs with 
                personalized recommendations.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full shadow-card">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Text Analysis</span>
              </div>
              <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full shadow-card">
                <Camera className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Image Recognition</span>
              </div>
              <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full shadow-card">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI Diagnosis</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex justify-center sm:justify-start">
              <Button size="lg" variant="medical" className="group" onClick={handleStartAnalysis}>
                Start Your Health Analysis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">85%</div>
                <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">AI Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">Users Helped</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src={heroImage}
                alt="AI-powered healthcare dashboard showing medical analysis and patient data"
                className="w-full h-auto rounded-2xl shadow-float"
              />
            </div>
            
            {/* Background Elements */}
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-care rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-primary rounded-full opacity-10 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};