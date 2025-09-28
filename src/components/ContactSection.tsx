import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Send } from "lucide-react";

export const ContactSection = () => {
  return (
    <section id="contact" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="inline-flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Get in Touch
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold">
            Contact
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Our Team</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions about CareNexus? We'd love to hear from you. 
            Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">Get in Touch</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary p-3">
                    <MapPin className="w-full h-full text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Address</h4>
                    <p className="text-muted-foreground">BMS Institute of Technology & Management<br />Bangalore, Karnataka, India</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary p-3">
                    <Mail className="w-full h-full text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Email</h4>
                    <p className="text-muted-foreground">contact@carenexus.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary p-3">
                    <Phone className="w-full h-full text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Phone</h4>
                    <p className="text-muted-foreground">+91 9876543210</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input placeholder="Doe" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="john@example.com" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="How can we help?" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  placeholder="Tell us more about your inquiry..." 
                  rows={4}
                />
              </div>
              
              <Button className="w-full" variant="medical">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};