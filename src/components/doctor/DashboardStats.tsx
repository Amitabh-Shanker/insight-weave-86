import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Calendar, FileText } from "lucide-react";

interface DashboardStatsProps {
  doctorId: string;
}

export const DashboardStats = ({ doctorId }: DashboardStatsProps) => {
  const [stats, setStats] = useState({
    totalPatientsToday: 0,
    upcomingAppointments: 0,
    pendingPrescriptions: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date().toISOString().split('T')[0];

      // Get today's appointments
      const { count: todayCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .eq('appointment_date', today);

      // Get upcoming appointments
      const { count: upcomingCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .gte('appointment_date', today)
        .in('status', ['pending', 'confirmed']);

      // Get pending prescriptions
      const { count: pendingPrescriptionsCount } = await supabase
        .from('prescriptions')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .eq('status', 'pending');

      setStats({
        totalPatientsToday: todayCount || 0,
        upcomingAppointments: upcomingCount || 0,
        pendingPrescriptions: pendingPrescriptionsCount || 0,
      });
    };

    fetchStats();

    // Set up real-time subscription
    const channel = supabase
      .channel('dashboard-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `doctor_id=eq.${doctorId}`,
        },
        () => {
          setTimeout(() => fetchStats(), 0);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prescriptions',
          filter: `doctor_id=eq.${doctorId}`,
        },
        () => {
          setTimeout(() => fetchStats(), 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [doctorId]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Patients Today
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPatientsToday}</div>
          <p className="text-xs text-muted-foreground">
            Scheduled for today
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Upcoming Appointments
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
          <p className="text-xs text-muted-foreground">
            Pending and confirmed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Prescriptions
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingPrescriptions}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting review
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
