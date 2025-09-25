import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, KeyRound } from "lucide-react";
import { sendOtp, verifyOtp, storeAuthToken, storeUserData } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const { toast } = useToast();
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Store the current URL when component mounts for redirect after login
  useEffect(() => {
    if (location.pathname !== '/login' || location.search) {
      // Store the complete URL (including query parameters) for redirect after login
      const redirectUrl = location.pathname + location.search;
      localStorage.setItem('redirectAfterLogin', redirectUrl);
    }
  }, [location]);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await sendOtp(phoneNumber);

      if (response.success) {
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the verification code.",
        });
        setSessionId(response.sessionId);
        setStep("otp");
      } else {
        throw new Error(response.message || "Failed to send OTP");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyOtp(phoneNumber, otp, sessionId);

      if (response.success && response.token) {
        storeAuthToken(response.token);
        storeUserData(response.user);
        login(response.token, response.user);

        // Check if there's a redirect URL stored
        const redirectUrl = localStorage.getItem('redirectAfterLogin');
        if (redirectUrl && redirectUrl !== '/login') {
          localStorage.removeItem('redirectAfterLogin');
          navigate(redirectUrl, { replace: true });
          toast({
            title: "Login Successful",
            description: "Welcome! Processing your payment...",
          });
        } else {
          toast({
            title: "Login Successful",
            description: "Welcome! Redirecting to dashboard...",
          });
        }
      } else {
        throw new Error(response.message || "Invalid OTP");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    setOtp("");
    handleSendOtp();
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setOtp("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            {step === "phone"
              ? "Enter your phone number to receive an OTP"
              : "Enter the 6-digit code sent to your phone"
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === "phone" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 flex items-center gap-1 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">+91</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    className="pl-16"
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your 10-digit Indian mobile number (without +91)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  OTP sent to +91 {phoneNumber}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  Enter OTP
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-sm"
                >
                  Didn't receive OTP? Resend
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <Button
            onClick={step === "phone" ? handleSendOtp : handleVerifyOtp}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {step === "phone" ? "Send OTP" : "Verify OTP"}
          </Button>

          {step === "otp" && (
            <Button
              variant="outline"
              onClick={handleBackToPhone}
              disabled={isLoading}
              className="w-full"
            >
              Change Phone Number
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;