import { Heart, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">CareNexus</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered healthcare assistant providing multimodal symptom analysis 
              and personalized medical recommendations.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                BMS Institute of Technology, Bangalore
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                contact@carenexus.com
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                +91 9876543210
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">AI Symptom Analysis</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Doctor Consultation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Emergency Support</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Health Tracking</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Multilingual Support</a></li>
            </ul>
          </div>

          {/* Technology */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Technology</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Machine Learning</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Natural Language Processing</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Computer Vision</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Speech Recognition</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Data Security</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Research Team</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 CareNexus. All rights reserved. Built by BMS Institute of Technology & Management.
            </p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                Privacy
              </Button>
              <Button variant="ghost" size="sm">
                Terms
              </Button>
              <Button variant="ghost" size="sm">
                Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};