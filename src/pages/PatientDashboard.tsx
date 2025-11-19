import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, LogOut, Calendar, Activity } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import SymptomAnalyzer from "@/components/SymptomAnalyzer";
import { MyAppointments } from "@/components/patient/MyAppointments";
import { AppointmentBooking } from "@/components/patient/AppointmentBooking";

const PatientDashboard = () => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Patient Dashboard</h1>
              <p className="text-muted-foreground">AI-Powered Symptom Analysis</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="analyze" className="space-y-6">
          <TabsList>
            <TabsTrigger value="analyze">
              <Activity className="w-4 h-4 mr-2" />
              Symptom Analysis
            </TabsTrigger>
            <TabsTrigger value="appointments">
              <Calendar className="w-4 h-4 mr-2" />
              My Appointments
            </TabsTrigger>
            <TabsTrigger value="book">
              <Calendar className="w-4 h-4 mr-2" />
              Book Appointment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze">
            <SymptomAnalyzer />
          </TabsContent>

          <TabsContent value="appointments">
            <MyAppointments />
          </TabsContent>

          <TabsContent value="book">
            <AppointmentBooking />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDashboard;