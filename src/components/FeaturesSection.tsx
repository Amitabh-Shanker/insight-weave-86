import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  MessageSquare, 
  Camera, 
  Globe, 
  Shield, 
  Stethoscope,
  Clock,
  Users,
  AlertTriangle
} from "lucide-react";
import aiIcon from "@/assets/ai-analysis-icon.jpg";
import multimodalIcon from "@/assets/multimodal-icon.jpg";
import teleconsultIcon from "@/assets/teleconsult-icon.jpg";

export const FeaturesSection = () => {
  const features = [
    {
      icon: multimodalIcon,
      title: "Multimodal Symptom Input",
      description: "Describe symptoms through text, voice recordings, or upload images for comprehensive analysis",
      badge: "Core Feature",
      details: ["Text descriptions", "Voice recordings", "Medical images", "Real-time processing"]
    },
    {
      icon: aiIcon,
      title: "AI-Powered Analysis Engine",
      description: "Advanced ML models analyze symptoms using NLP, speech processing, and computer vision",
      badge: "AI Technology",
      details: ["NLP processing", "CNN image analysis", "Rule-based logic", "Real-time results"]
    },
    {
      icon: teleconsultIcon,
      title: "Smart Severity Classification",
      description: "Categorizes symptoms as Minor, Moderate, High, or Critical with personalized recommendations",
      badge: "Smart Triage",
      details: ["4-tier classification", "Instant recommendations", "Doctor escalation", "Emergency alerts"]
    },
    {
      icon: Globe,
      title: "Multilingual Support",
      description: "Healthcare assistance in multiple languages to serve diverse communities globally",
      badge: "Accessibility",
      details: ["Multiple languages", "Cultural adaptation", "Local healthcare info", "Universal access"]
    },
    {
      icon: Users,
      title: "Contextual Personalization",
      description: "Adapts recommendations based on your medical history and previous consultations",
      badge: "Personalized",
      details: ["Medical history", "Previous consultations", "Personal preferences", "Custom recommendations"]
    },
    {
      icon: Shield,
      title: "Secure Data Protection",
      description: "Enterprise-grade security with encrypted storage and HIPAA-compliant data handling",
      badge: "Security",
      details: ["Data encryption", "HIPAA compliant", "Secure storage", "Privacy protection"]
    }
  ];

  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="inline-flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Advanced Features
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold">
            Revolutionizing Healthcare with
            <span className="bg-gradient-primary bg-clip-text text-transparent"> AI Technology</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our cutting-edge platform combines machine learning, natural language processing, 
            and computer vision to provide accurate, personalized healthcare assistance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-medical transition-all duration-300 border-0 shadow-card">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 rounded-xl bg-gradient-care p-3 group-hover:scale-110 transition-transform">
                    {typeof feature.icon === 'string' ? (
                      <img 
                        src={feature.icon} 
                        alt={`${feature.title} icon`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <feature.icon className="w-full h-full text-primary" />
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
                <ul className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Technical Architecture */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-health border border-border">
          <div className="text-center space-y-4 mb-8">
            <h3 className="text-2xl font-bold">Technical Architecture</h3>
            <p className="text-muted-foreground">Built for scalability and ML model integration</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold">React Frontend</h4>
              <p className="text-sm text-muted-foreground">Modern, responsive UI</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold">Flask Backend</h4>
              <p className="text-sm text-muted-foreground">Python API server</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold">ML Models</h4>
              <p className="text-sm text-muted-foreground">Text & image analysis</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold">PostgreSQL</h4>
              <p className="text-sm text-muted-foreground">Secure data storage</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};