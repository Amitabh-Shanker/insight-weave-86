import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowLeft, Shield, Clock, UserCheck, Sparkles, CheckCircle2, Mail, Lock, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { patientSignUpSchema, signInSchema } from "@/lib/validations";
import { supabase } from "@/integrations/supabase/client";

const PatientAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showSignInPrompt, setShowSignInPrompt] = useState(false);
    const [existingEmail, setExistingEmail] = useState('');
    const { signUp, signIn, user, userRoles, checkQuestionnaireCompleted, addRole } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const checkAndRedirect = async () => {
            if (user && userRoles.includes('patient')) {
                const isCompleted = await checkQuestionnaireCompleted();
                if (isCompleted) {
                    navigate('/patient-dashboard');
                } else {
                    navigate('/questionnaire');
                }
            }
        };
        checkAndRedirect();
    }, [user, userRoles, navigate, checkQuestionnaireCompleted]);

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

            if (!error && showSignInPrompt) {
                // User signed in after being prompted - add patient role
                await addRole('patient');
                setShowSignInPrompt(false);
            }

            if (!error) {
                // Check if questionnaire is completed
                const isCompleted = await checkQuestionnaireCompleted();
                if (isCompleted) {
                    navigate('/patient-dashboard');
                } else {
                    navigate('/questionnaire');
                }
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
            password: formData.get('signupPassword') as string,
            confirmPassword: formData.get('confirmPassword') as string,
        };

        try {
            const validation = patientSignUpSchema.parse(data);

            // Check if user is already signed in
            if (user) {
                // Add patient role to existing user
                const { error } = await addRole('patient');
                if (!error) {
                    navigate('/questionnaire');
                }
            } else {
                // Create new account
                const userData = {
                    first_name: validation.firstName,
                    last_name: validation.lastName,
                    user_type: 'patient'
                };

                const { error } = await signUp(validation.email, validation.password, userData);

                if (!error) {
                    // Send confirmation email
                    try {
                        await supabase.functions.invoke('send-confirmation-email', {
                            body: {
                                email: validation.email,
                                firstName: validation.firstName,
                                lastName: validation.lastName
                            }
                        });
                    } catch (emailError) {
                        console.error('Error sending confirmation email:', emailError);
                        // Don't block registration if email fails
                    }
                    navigate('/questionnaire');
                } else {
                    // Check if user already exists
                    if (error.message?.includes('already registered') || error.message?.includes('User already registered')) {
                        // Automatically sign in and add patient role
                        const { error: signInError } = await signIn(validation.email, validation.password);

                        if (signInError) {
                            setErrors({
                                general: 'This email is already registered. Please use the correct password.'
                            });
                        } else {
                            // Successfully signed in, add patient role
                            await addRole('patient');

                            // Check if questionnaire is completed
                            const isCompleted = await checkQuestionnaireCompleted();
                            if (isCompleted) {
                                navigate('/patient-dashboard');
                            } else {
                                navigate('/questionnaire');
                            }
                        }
                    } else {
                        setErrors({ general: error.message });
                    }
                }
            }
        } catch (error: any) {
            if (error.errors) {
                const newErrors: Record<string, string> = {};
                error.errors.forEach((err: any) => {
                    newErrors[err.path[0]] = err.message;
                });
                setErrors(newErrors);
            } else if (error.message) {
                setErrors({ general: error.message });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow animation-delay-300"></div>
                <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-float animation-delay-500"></div>

                {/* Decorative medical icons floating */}
                <div className="absolute top-40 right-20 text-primary/10 animate-float">
                    <Heart className="w-16 h-16" />
                </div>
                <div className="absolute bottom-40 left-20 text-accent/10 animate-float animation-delay-300">
                    <Shield className="w-20 h-20" />
                </div>
            </div>

            <div className="w-full max-w-6xl relative z-10 animate-fade-in-up">
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Left Side - Marketing Content */}
                    <div className="hidden lg:block space-y-8 animate-slide-in-left">
                        {/* Back to Home */}
                        <Button
                            variant="ghost"
                            className="hover:scale-105 transition-all duration-300 hover:bg-primary/10 mb-4"
                            onClick={() => window.location.href = '/'}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>

                        {/* Logo */}
                        <div className="flex items-center space-x-3 group">
                            <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center shadow-medical transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                <Heart className="w-10 h-10 text-primary-foreground transition-transform duration-300 group-hover:scale-110 animate-pulse-slow" />
                            </div>
                            <span className="text-4xl font-bold text-foreground transition-colors duration-300 group-hover:text-primary">CareNexus</span>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <Badge className="mb-4 animate-scale-in">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Trusted by 10,000+ Patients
                                </Badge>
                                <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
                                    Your Health Journey
                                    <span className="block bg-gradient-primary bg-clip-text text-transparent">
                    Starts Here
                  </span>
                                </h1>
                                <p className="text-xl text-muted-foreground leading-relaxed">
                                    Join thousands of patients who trust CareNexus for their healthcare needs. Get instant AI-powered health insights and connect with certified doctors.
                                </p>
                            </div>

                            {/* Benefits */}
                            <div className="space-y-4">
                                {[
                                    { icon: Shield, title: "100% Secure & Private", desc: "HIPAA-compliant data protection" },
                                    { icon: Clock, title: "24/7 AI Support", desc: "Instant symptom analysis anytime" },
                                    { icon: UserCheck, title: "Certified Doctors", desc: "Connect with verified professionals" },
                                ].map((benefit, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-start gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover-lift animate-fade-in-up animation-delay-${(index + 1) * 100}`}
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <benefit.icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">{benefit.title}</h3>
                                            <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Auth Form */}
                    <div className="w-full animate-slide-in-right">
                        {/* Mobile Back Button */}
                        <Button
                            variant="ghost"
                            className="lg:hidden mb-6 hover:scale-105 transition-all duration-300 hover:bg-primary/10"
                            onClick={() => window.location.href = '/'}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>

                        {/* Mobile Logo */}
                        <div className="lg:hidden flex items-center justify-center space-x-2 mb-8 group">
                            <div className="w-14 h-14 rounded-lg bg-gradient-primary flex items-center justify-center shadow-medical transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                <Heart className="w-8 h-8 text-primary-foreground transition-transform duration-300 group-hover:scale-110 animate-pulse-slow" />
                            </div>
                            <span className="text-3xl font-bold text-foreground transition-colors duration-300 group-hover:text-primary">CareNexus</span>
                        </div>

                        <Card className="backdrop-blur-md bg-background/98 border-2 border-primary/20 shadow-2xl hover:shadow-medical overflow-hidden">
                            {/* Decorative Top Bar */}
                            <div className="h-2 bg-gradient-primary"></div>

                            <CardHeader className="text-center space-y-4 pb-8 relative">
                                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent"></div>
                                <div className="relative">
                                    <Badge className="mb-3 animate-scale-in">
                                        <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
                                        Welcome to CareNexus
                                    </Badge>
                                    <CardTitle className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text">
                                        Patient Portal
                                    </CardTitle>
                                    <CardDescription className="text-base mt-3 max-w-md mx-auto">
                                        Access your health records, get AI-powered insights, and connect with healthcare providers
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0 px-6 pb-8">
                                <Tabs defaultValue="signin" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 p-1.5 bg-muted/50 mb-6">
                                        <TabsTrigger
                                            value="signin"
                                            className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all duration-300 data-[state=active]:shadow-lg font-semibold"
                                        >
                                            Sign In
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="signup"
                                            className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all duration-300 data-[state=active]:shadow-lg font-semibold"
                                        >
                                            Sign Up
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="signin" className="space-y-6 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2 duration-300">
                                        <form onSubmit={handleSignIn} className="space-y-5">
                                            {showSignInPrompt && (
                                                <div className="p-4 bg-primary/10 border-2 border-primary/30 rounded-xl animate-fade-in flex items-start gap-3">
                                                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                                    <p className="text-sm text-primary font-medium">
                                                        Sign in with your existing account to add patient access.
                                                    </p>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="font-semibold text-base flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-primary" />
                                                    Email Address
                                                </Label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    defaultValue={existingEmail}
                                                    required
                                                    className="h-12 focus-ring transition-all duration-300 hover:border-primary/50 border-2"
                                                />
                                                {errors.email && (
                                                    <p className="text-sm text-destructive animate-fade-in flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-destructive"></span>
                                                        {errors.email}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password" className="font-semibold text-base flex items-center gap-2">
                                                    <Lock className="w-4 h-4 text-primary" />
                                                    Password
                                                </Label>
                                                <Input
                                                    id="password"
                                                    name="password"
                                                    type="password"
                                                    placeholder="Enter your password"
                                                    required
                                                    className="h-12 focus-ring transition-all duration-300 hover:border-primary/50 border-2"
                                                />
                                                {errors.password && (
                                                    <p className="text-sm text-destructive animate-fade-in flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-destructive"></span>
                                                        {errors.password}
                                                    </p>
                                                )}
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full h-12 text-base font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-medical bg-gradient-primary"
                                                disabled={isLoading}
                                                size="lg"
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Signing In...
                          </span>
                                                ) : (
                                                    "Sign In to Your Account"
                                                )}
                                            </Button>
                                        </form>

                                        {/* Additional Links */}
                                        <div className="text-center pt-4 border-t border-border">
                                            <p className="text-sm text-muted-foreground">
                                                Don't have an account?{' '}
                                                <button
                                                    type="button"
                                                    className="text-primary hover:underline font-semibold"
                                                    onClick={() => {
                                                        const signupTab = document.querySelector('[value="signup"]') as HTMLElement;
                                                        signupTab?.click();
                                                    }}
                                                >
                                                    Create one now
                                                </button>
                                            </p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="signup" className="space-y-6 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2 duration-300">
                                        <form onSubmit={handleSignUp} className="space-y-5">
                                            {errors.general && (
                                                <div className="p-4 bg-destructive/10 border-2 border-destructive/30 rounded-xl animate-fade-in flex items-start gap-3">
                                                    <span className="w-1 h-1 rounded-full bg-destructive mt-2 flex-shrink-0"></span>
                                                    <p className="text-sm text-destructive font-medium">{errors.general}</p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="firstName" className="font-semibold text-base flex items-center gap-2">
                                                        <User className="w-4 h-4 text-primary" />
                                                        First Name
                                                    </Label>
                                                    <Input
                                                        id="firstName"
                                                        name="firstName"
                                                        placeholder="John"
                                                        required
                                                        className="h-12 focus-ring transition-all duration-300 hover:border-primary/50 border-2"
                                                    />
                                                    {errors.firstName && (
                                                        <p className="text-sm text-destructive animate-fade-in flex items-center gap-1">
                                                            <span className="w-1 h-1 rounded-full bg-destructive"></span>
                                                            {errors.firstName}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="lastName" className="font-semibold text-base flex items-center gap-2">
                                                        <User className="w-4 h-4 text-primary" />
                                                        Last Name
                                                    </Label>
                                                    <Input
                                                        id="lastName"
                                                        name="lastName"
                                                        placeholder="Doe"
                                                        required
                                                        className="h-12 focus-ring transition-all duration-300 hover:border-primary/50 border-2"
                                                    />
                                                    {errors.lastName && (
                                                        <p className="text-sm text-destructive animate-fade-in flex items-center gap-1">
                                                            <span className="w-1 h-1 rounded-full bg-destructive"></span>
                                                            {errors.lastName}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="signupEmail" className="font-semibold text-base flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-primary" />
                                                    Email Address
                                                </Label>
                                                <Input
                                                    id="signupEmail"
                                                    name="signupEmail"
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    required
                                                    className="h-12 focus-ring transition-all duration-300 hover:border-primary/50 border-2"
                                                />
                                                {errors.email && (
                                                    <p className="text-sm text-destructive animate-fade-in flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-destructive"></span>
                                                        {errors.email}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="signupPassword" className="font-semibold text-base flex items-center gap-2">
                                                    <Lock className="w-4 h-4 text-primary" />
                                                    Password
                                                </Label>
                                                <Input
                                                    id="signupPassword"
                                                    name="signupPassword"
                                                    type="password"
                                                    placeholder="Create a strong password"
                                                    required
                                                    className="h-12 focus-ring transition-all duration-300 hover:border-primary/50 border-2"
                                                />
                                                {errors.password && (
                                                    <p className="text-sm text-destructive animate-fade-in flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-destructive"></span>
                                                        {errors.password}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPassword" className="font-semibold text-base flex items-center gap-2">
                                                    <Lock className="w-4 h-4 text-primary" />
                                                    Confirm Password
                                                </Label>
                                                <Input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type="password"
                                                    placeholder="Re-enter your password"
                                                    required
                                                    className="h-12 focus-ring transition-all duration-300 hover:border-primary/50 border-2"
                                                />
                                                {errors.confirmPassword && (
                                                    <p className="text-sm text-destructive animate-fade-in flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-destructive"></span>
                                                        {errors.confirmPassword}
                                                    </p>
                                                )}
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full h-12 text-base font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-medical bg-gradient-primary"
                                                disabled={isLoading}
                                                size="lg"
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Creating Account...
                          </span>
                                                ) : (
                                                    "Create Your Account"
                                                )}
                                            </Button>
                                        </form>

                                        {/* Additional Links */}
                                        <div className="text-center pt-4 border-t border-border">
                                            <p className="text-sm text-muted-foreground">
                                                Already have an account?{' '}
                                                <button
                                                    type="button"
                                                    className="text-primary hover:underline font-semibold"
                                                    onClick={() => {
                                                        const signinTab = document.querySelector('[value="signin"]') as HTMLElement;
                                                        signinTab?.click();
                                                    }}
                                                >
                                                    Sign in instead
                                                </button>
                                            </p>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>

                            {/* Footer */}
                            <div className="px-6 pb-6 pt-0">
                                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                    <Shield className="w-3 h-3" />
                                    <span>Secured with 256-bit encryption</span>
                                </div>
                            </div>
                        </Card>

                        {/* Terms */}
                        <p className="text-center text-sm text-muted-foreground mt-6 animate-fade-in animation-delay-300">
                            By continuing, you agree to our{' '}
                            <a href="#" className="text-primary hover:underline transition-colors duration-300 font-medium">Terms of Service</a>
                            {' '}and{' '}
                            <a href="#" className="text-primary hover:underline transition-colors duration-300 font-medium">Privacy Policy</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientAuth;