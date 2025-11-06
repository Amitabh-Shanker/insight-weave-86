import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardStats } from "@/components/doctor/DashboardStats";
import { AppointmentManagement } from "@/components/doctor/AppointmentManagement";
import { PatientRecords } from "@/components/doctor/PatientRecords";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/doctor-auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Doctor Dashboard</h1>
              <p className="text-muted-foreground">Manage appointments and patient records</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Dashboard Stats */}
        <div className="mb-8">
          <DashboardStats doctorId={user.id} />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="records">Patient Records</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            <AppointmentManagement doctorId={user.id} />
          </TabsContent>

          <TabsContent value="records" className="space-y-4">
            <PatientRecords doctorId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorDashboard;