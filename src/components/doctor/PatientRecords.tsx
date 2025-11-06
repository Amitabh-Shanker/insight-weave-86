import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, User } from "lucide-react";
import { format } from "date-fns";

interface Patient {
  user_id: string;
  first_name: string;
  last_name: string;
}

interface MedicalRecord {
  id: string;
  patient_id: string;
  record_type: string;
  title: string;
  description: string;
  created_at: string;
  patient: {
    first_name: string;
    last_name: string;
  };
}

interface PatientRecordsProps {
  doctorId: string;
}

export const PatientRecords = ({ doctorId }: PatientRecordsProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newRecord, setNewRecord] = useState({
    title: "",
    record_type: "consultation_note",
    description: "",
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchRecords();
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    // Get unique patients from appointments
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        patient_id,
        patient:profiles!appointments_patient_id_fkey (
          user_id,
          first_name,
          last_name
        )
      `)
      .eq('doctor_id', doctorId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      });
      return;
    }

    // Remove duplicates
    const uniquePatients = data?.reduce((acc: Patient[], curr: any) => {
      const exists = acc.find(p => p.user_id === curr.patient?.user_id);
      if (!exists && curr.patient) {
        acc.push(curr.patient);
      }
      return acc;
    }, []);

    setPatients(uniquePatients || []);
  };

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        patient:profiles!medical_records_patient_id_fkey (
          first_name,
          last_name
        )
      `)
      .eq('doctor_id', doctorId)
      .eq('patient_id', selectedPatient)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch records",
        variant: "destructive",
      });
      return;
    }

    setRecords(data || []);
  };

  const createRecord = async () => {
    if (!selectedPatient || !newRecord.title) {
      toast({
        title: "Error",
        description: "Please select a patient and provide a title",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('medical_records')
      .insert({
        patient_id: selectedPatient,
        doctor_id: doctorId,
        ...newRecord,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create record",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Medical record created successfully",
    });

    setNewRecord({
      title: "",
      record_type: "consultation_note",
      description: "",
    });
    setIsDialogOpen(false);
    fetchRecords();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Patient Records</CardTitle>
            <CardDescription>
              View and manage patient medical records
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Medical Record</DialogTitle>
                <DialogDescription>
                  Add a new medical record for the patient
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Record Type</Label>
                  <Select
                    value={newRecord.record_type}
                    onValueChange={(value) =>
                      setNewRecord({ ...newRecord, record_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diagnosis">Diagnosis</SelectItem>
                      <SelectItem value="lab_report">Lab Report</SelectItem>
                      <SelectItem value="imaging">Imaging</SelectItem>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="consultation_note">Consultation Note</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newRecord.title}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, title: e.target.value })
                    }
                    placeholder="Record title"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newRecord.description}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, description: e.target.value })
                    }
                    placeholder="Record details"
                    rows={4}
                  />
                </div>
                <Button onClick={createRecord} className="w-full">
                  Create Record
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Select Patient</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.user_id} value={patient.user_id}>
                    {patient.first_name} {patient.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPatient && (
            <div className="space-y-4 mt-6">
              {records.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No medical records found for this patient
                </p>
              ) : (
                records.map((record) => (
                  <Card key={record.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {record.title}
                          </CardTitle>
                          <CardDescription>
                            {record.record_type.replace('_', ' ')} •{' '}
                            {format(new Date(record.created_at), 'MMM dd, yyyy')}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {record.description || 'No description provided'}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
