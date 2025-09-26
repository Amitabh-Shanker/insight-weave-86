import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ArrowLeft, Stethoscope } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { doctorSignUpSchema, signInSchema } from "@/lib/validations";

const DoctorAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signUp, signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/doctor-dashboard');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    try {
      const validation = signInSchema.parse(data);
      const { error } = await signIn(validation.email, validation.password);
      
      if (!error) {
        navigate('/doctor-dashboard');
      }
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('signupEmail') as string,
      medicalLicenseNumber: formData.get('licenseNumber') as string,
      specialty: formData.get('specialty') as string,
      password: formData.get('signupPassword') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    try {
      const validation = doctorSignUpSchema.parse(data);
      const userData = {
        first_name: validation.firstName,
        last_name: validation.lastName,
        user_type: 'doctor',
        medical_license_number: validation.medicalLicenseNumber,
        specialty: validation.specialty
      };
      
      const { error } = await signUp(validation.email, validation.password, userData);
      
      if (!error) {
        // User will be redirected after email verification
      }
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-600 to-medical-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Button
          variant="ghost"
          className="mb-6 text-white hover:bg-white/10"
          onClick={() => window.location.href = '/'}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <span className="text-3xl font-bold text-white">CareNexus</span>
        </div>

        <Card className="backdrop-blur-sm bg-white/95 border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Healthcare Provider Portal</CardTitle>
            <CardDescription>
              Access your practice dashboard and patient management tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Medical License Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="doctor@hospital.com"
                      required
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    variant="medical"
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="Dr. Jane"
                        required
                      />
                      {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Smith"
                        required
                      />
                      {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">Medical License Email</Label>
                    <Input
                      id="signupEmail"
                      name="signupEmail"
                      type="email"
                      placeholder="doctor@hospital.com"
                      required
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Medical License Number</Label>
                    <Input
                      id="licenseNumber"
                      name="licenseNumber"
                      placeholder="ML123456789"
                      required
                    />
                    {errors.medicalLicenseNumber && <p className="text-sm text-destructive">{errors.medicalLicenseNumber}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty</Label>
                    <Input
                      id="specialty"
                      name="specialty"
                      placeholder="General Practice, Cardiology, etc."
                      required
                    />
                    {errors.specialty && <p className="text-sm text-destructive">{errors.specialty}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Password</Label>
                    <Input
                      id="signupPassword"
                      name="signupPassword"
                      type="password"
                      required
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                    />
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    variant="medical"
                  >
                    {isLoading ? "Creating Account..." : "Submit for Verification"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-white/70 mt-6">
          Doctor accounts require verification. You'll receive an email within 24-48 hours.
        </p>
      </div>
    </div>
  );
};

export default DoctorAuth;