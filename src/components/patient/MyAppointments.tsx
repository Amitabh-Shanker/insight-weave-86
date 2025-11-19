import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  status: string;
  doctor: {
    first_name: string;
    last_name: string;
    specialty: string;
  };
}

export const MyAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        appointment_time,
        reason,
        status,
        doctor:profiles!appointments_doctor_id_fkey(
          first_name,
          last_name,
          specialty
        )
      `)
      .eq("patient_id", user.id)
      .order("appointment_date", { ascending: true });

    if (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } else {
      setAppointments(data as any || []);
    }
    setIsLoading(false);
  };

  const cancelAppointment = async (appointmentId: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", appointmentId);

    if (error) {
      toast.error("Failed to cancel appointment");
    } else {
      toast.success("Appointment cancelled");
      fetchAppointments();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "default";
      case "pending": return "secondary";
      case "cancelled": return "destructive";
      case "completed": return "outline";
      default: return "secondary";
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading appointments...</div>;
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No appointments scheduled yet
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Dr. {appointment.doctor.first_name} {appointment.doctor.last_name}
                </CardTitle>
                {appointment.doctor.specialty && (
                  <CardDescription>{appointment.doctor.specialty}</CardDescription>
                )}
              </div>
              <Badge variant={getStatusColor(appointment.status)}>
                {appointment.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{appointment.appointment_time}</span>
              </div>
            </div>
            
            {appointment.reason && (
              <div className="text-sm">
                <p className="font-medium mb-1">Reason:</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{appointment.reason}</p>
              </div>
            )}

            {appointment.status === "pending" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => cancelAppointment(appointment.id)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel Appointment
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
