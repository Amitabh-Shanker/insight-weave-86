import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Award, Globe, Heart } from "lucide-react";

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="inline-flex items-center gap-2">
            <Heart className="w-4 h-4" />
            About CareNexus
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold">
            Revolutionizing Healthcare with
            <span className="bg-gradient-primary bg-clip-text text-transparent"> AI Innovation</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            CareNexus is developed by BMS Institute of Technology & Management to make healthcare 
            accessible, intelligent, and personalized for everyone.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-6 border-0 shadow-card">
            <CardHeader>
              <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-primary p-3 mb-4">
                <Users className="w-full h-full text-primary-foreground" />
              </div>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                To democratize healthcare access through AI-powered technology that provides 
                instant, accurate, and personalized medical assistance.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-0 shadow-card">
            <CardHeader>
              <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-primary p-3 mb-4">
                <Award className="w-full h-full text-primary-foreground" />
              </div>
              <CardTitle>Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                To create a world where quality healthcare guidance is available 24/7, 
                breaking down barriers of distance, time, and accessibility.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-0 shadow-card">
            <CardHeader>
              <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-primary p-3 mb-4">
                <Globe className="w-full h-full text-primary-foreground" />
              </div>
              <CardTitle>Our Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Empowering individuals with intelligent healthcare insights while supporting 
                healthcare professionals with AI-enhanced diagnostic capabilities.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};