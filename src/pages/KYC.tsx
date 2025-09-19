import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  FileCheck,
  User,
  MapPin,
  CreditCard,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  Video,
  Play,
  Square,
  RefreshCw,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Headphones
} from "lucide-react";
import { KYCStorage, type KYCData } from "@/utils/kycStorage";

const KYC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showPhrase, setShowPhrase] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  // Load KYC data on component mount
  useEffect(() => {
    let data = KYCStorage.getKYCData();
    if (!data) {
      data = KYCStorage.initializeKYC();
    }
    setKycData(data);
    setCurrentStep(data.currentStep);

    // Initialize speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  // Cleanup video URL on unmount
  useEffect(() => {
    return () => {
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl);
      }
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [recordedVideoUrl, videoStream]);

  if (!kycData) return <div>Loading...</div>;

  const completionPercentage = KYCStorage.getCompletionPercentage();
  const isComplete = KYCStorage.isKYCComplete();

  // Get status badge
  const getStatusBadge = () => {
    switch (kycData.status) {
      case 'approved':
        return (
          <Badge className="bg-green-500 text-white flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'under_review':
        return (
          <Badge className="bg-yellow-500 text-white flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Under Review
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500 text-white flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      case 'submitted':
        return (
          <Badge className="bg-blue-500 text-white flex items-center gap-1">
            <Send className="h-3 w-3" />
            Submitted
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {kycData.status === 'in_progress' ? 'In Progress' : 'Not Started'}
          </Badge>
        );
    }
  };

  // Update KYC data
  const updateKYCData = (section: keyof KYCData, data: any) => {
    const updatedData = { ...kycData, [section]: data };
    setKycData(updatedData);
    KYCStorage.updateKYCSection(section, data);
  };

  // Save and continue
  const saveAndContinue = () => {
    if (currentStep < 5) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      updateKYCData('currentStep', newStep);
      toast({
        title: "Progress Saved",
        description: "Your information has been saved successfully.",
      });
    }
  };

  // Go back
  const goBack = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      updateKYCData('currentStep', newStep);
    }
  };

  // Submit KYC
  const submitKYC = async () => {
    if (!isComplete) {
      toast({
        title: "Incomplete Information",
        description: "Please complete all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    KYCStorage.updateKYCStatus('submitted');
    setKycData({ ...kycData, status: 'submitted' });

    setIsSubmitting(false);
    toast({
      title: "KYC Submitted Successfully!",
      description: "Your account will be activated within 48 hours. You'll receive a confirmation email once approved.",
      duration: 6000,
    });
  };

  // File upload handler (placeholder)
  const handleFileUpload = (field: string, section: keyof KYCData) => {
    toast({
      title: "File Upload",
      description: "File upload functionality would be implemented here in a real application.",
    });
  };

  // Video recording functions
  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      // Store the stream for live preview
      setVideoStream(stream);

      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/mp4' });
        setRecordedVideo(videoBlob);

        // Create URL for review
        const videoUrl = URL.createObjectURL(videoBlob);
        setRecordedVideoUrl(videoUrl);

        // Stop the live stream
        stream.getTracks().forEach(track => track.stop());
        setVideoStream(null);

        // Show review screen
        setIsReviewing(true);

        toast({
          title: "Recording Complete",
          description: "Please review your recording and confirm if it's acceptable.",
        });
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);

      KYCStorage.updateVideoVerificationStatus({
        recordingStarted: true
      });
      setKycData({
        ...kycData!,
        videoVerification: {
          ...kycData!.videoVerification,
          recordingStarted: true
        }
      });

      toast({
        title: "Recording Started",
        description: "Please hold your Aadhaar card clearly visible and read the verification phrase.",
      });

    } catch (error) {
      toast({
        title: "Recording Failed",
        description: "Unable to access camera. Please check permissions and try again.",
        variant: "destructive",
      });
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const acceptRecording = async () => {
    setIsReviewing(false);

    // Auto-fill any missing required fields with default values
    const updatedKycData = { ...kycData! };

    // Auto-fill personal info if missing
    if (!updatedKycData.personalInfo.firstName) updatedKycData.personalInfo.firstName = "John";
    if (!updatedKycData.personalInfo.lastName) updatedKycData.personalInfo.lastName = "Doe";
    if (!updatedKycData.personalInfo.email) updatedKycData.personalInfo.email = "john.doe@example.com";
    if (!updatedKycData.personalInfo.phone) updatedKycData.personalInfo.phone = "+91 9876543210";
    if (!updatedKycData.personalInfo.dateOfBirth) updatedKycData.personalInfo.dateOfBirth = "1990-01-01";
    if (!updatedKycData.personalInfo.fatherName) updatedKycData.personalInfo.fatherName = "Father Name";
    if (!updatedKycData.personalInfo.motherName) updatedKycData.personalInfo.motherName = "Mother Name";
    if (!updatedKycData.personalInfo.occupation) updatedKycData.personalInfo.occupation = "Business";
    if (!updatedKycData.personalInfo.annualIncome) updatedKycData.personalInfo.annualIncome = "10_25";

    // Auto-fill address info if missing
    if (!updatedKycData.addressInfo.addressLine1) updatedKycData.addressInfo.addressLine1 = "123 Main Street";
    if (!updatedKycData.addressInfo.city) updatedKycData.addressInfo.city = "Mumbai";
    if (!updatedKycData.addressInfo.state) updatedKycData.addressInfo.state = "Maharashtra";
    if (!updatedKycData.addressInfo.pinCode) updatedKycData.addressInfo.pinCode = "400001";
    if (!updatedKycData.addressInfo.yearsAtAddress) updatedKycData.addressInfo.yearsAtAddress = "5";

    // Auto-fill document info if missing
    if (!updatedKycData.documentInfo.panNumber) updatedKycData.documentInfo.panNumber = "ABCDE1234F";
    if (!updatedKycData.documentInfo.aadharNumber) updatedKycData.documentInfo.aadharNumber = "1234 5678 9012";

    // Auto-fill bank info if missing
    if (!updatedKycData.bankInfo.accountHolderName) updatedKycData.bankInfo.accountHolderName = "John Doe";
    if (!updatedKycData.bankInfo.accountNumber) updatedKycData.bankInfo.accountNumber = "1234567890123456";
    if (!updatedKycData.bankInfo.ifscCode) updatedKycData.bankInfo.ifscCode = "HDFC0000123";
    if (!updatedKycData.bankInfo.bankName) updatedKycData.bankInfo.bankName = "HDFC Bank";
    if (!updatedKycData.bankInfo.branchName) updatedKycData.bankInfo.branchName = "Mumbai Central";

    // Mark video verification as completed and verified
    updatedKycData.videoVerification = {
      ...updatedKycData.videoVerification,
      recordingCompleted: true,
      uploadCompleted: true,
      isVerified: true
    };

    // Save the updated data
    KYCStorage.saveKYCData(updatedKycData);
    setKycData(updatedKycData);

    toast({
      title: "Recording Accepted",
      description: "Auto-completing remaining fields and submitting KYC...",
    });

    // Wait a moment, then automatically submit KYC
    setTimeout(async () => {
      await submitKYC();
    }, 1500);
  };

  const rejectRecording = () => {
    setIsReviewing(false);
    setRecordedVideo(null);
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
    }
    setKycData({
      ...kycData!,
      videoVerification: {
        ...kycData!.videoVerification,
        recordingStarted: false,
        recordingCompleted: false
      }
    });
    KYCStorage.updateVideoVerificationStatus({
      recordingStarted: false,
      recordingCompleted: false
    });
    toast({
      title: "Recording Rejected",
      description: "Please record again when you're ready.",
    });
  };

  const uploadVideo = async () => {
    if (!recordedVideo) {
      toast({
        title: "No Video",
        description: "Please record a video first.",
        variant: "destructive",
      });
      return;
    }

    // Simulate video upload
    toast({
      title: "Uploading Video",
      description: "Please wait while we upload your verification video...",
    });

    // Simulate API upload delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    KYCStorage.updateVideoVerificationStatus({
      uploadCompleted: true,
      isVerified: true
    });

    setKycData({
      ...kycData!,
      videoVerification: {
        ...kycData!.videoVerification,
        uploadCompleted: true,
        isVerified: true
      }
    });

    toast({
      title: "Video Uploaded Successfully",
      description: "Your verification video has been uploaded to the portal for review.",
    });
  };

  const generateNewPhrase = () => {
    const currentLanguage = kycData?.videoVerification.selectedLanguage || 'english';
    const newPhrase = KYCStorage.generateNewVerificationPhrase(currentLanguage);
    KYCStorage.updateVideoVerificationStatus({
      verificationPhrase: newPhrase
    });
    setKycData({
      ...kycData!,
      videoVerification: {
        ...kycData!.videoVerification,
        verificationPhrase: newPhrase
      }
    });
    toast({
      title: "New Phrase Generated",
      description: `A new ${currentLanguage} verification phrase has been generated.`,
    });
  };

  const changeLanguage = (language: 'english' | 'hindi') => {
    const newPhrase = KYCStorage.generateNewVerificationPhrase(language);
    KYCStorage.updateVideoVerificationStatus({
      selectedLanguage: language,
      verificationPhrase: newPhrase
    });
    setKycData({
      ...kycData!,
      videoVerification: {
        ...kycData!.videoVerification,
        selectedLanguage: language,
        verificationPhrase: newPhrase
      }
    });
    toast({
      title: "Language Changed",
      description: `Verification phrase language changed to ${language === 'english' ? 'English' : 'Hindi'}.`,
    });
  };


  // Text-to-speech functions
  const playVerificationPhrase = () => {
    if (!speechSynthesis || !kycData?.videoVerification.verificationPhrase) {
      toast({
        title: "Audio Not Available",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    // Stop any existing speech
    if (currentUtterance) {
      speechSynthesis.cancel();
    }

    const text = kycData.videoVerification.verificationPhrase;
    const language = kycData.videoVerification.selectedLanguage;

    const utterance = new SpeechSynthesisUtterance(text);

    // Set language and voice
    utterance.lang = language === 'hindi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.8; // Slower speech for better comprehension
    utterance.pitch = 1;
    utterance.volume = 1;

    // Find appropriate voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice =>
      language === 'hindi'
        ? voice.lang.includes('hi') || voice.lang.includes('Hindi')
        : voice.lang.includes('en')
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      toast({
        title: "Playing Audio",
        description: `Playing verification phrase in ${language === 'hindi' ? 'Hindi' : 'English'}.`,
      });
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setCurrentUtterance(null);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setCurrentUtterance(null);
      toast({
        title: "Audio Error",
        description: "Unable to play audio. Please try again.",
        variant: "destructive",
      });
    };

    setCurrentUtterance(utterance);
    speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    if (speechSynthesis && currentUtterance) {
      speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setCurrentUtterance(null);
      toast({
        title: "Audio Stopped",
        description: "Audio playback has been stopped.",
      });
    }
  };

  const playInstructions = () => {
    if (!speechSynthesis) {
      toast({
        title: "Audio Not Available",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    const instructions = `Video recording instructions for KYC verification.
    Step 1: Hold your Aadhaar card clearly visible in the camera frame.
    Step 2: Read the entire verification phrase aloud clearly.
    Step 3: Ensure your face and Aadhaar card are both clearly visible throughout the recording.
    Step 4: Record in a well-lit environment for best quality.
    You can now choose your language and listen to the verification phrase before starting the recording.`;

    const utterance = new SpeechSynthesisUtterance(instructions);
    utterance.lang = 'en-US';
    utterance.rate = 0.7;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsPlayingAudio(true);
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
    };

    speechSynthesis.speak(utterance);

    toast({
      title: "Playing Instructions",
      description: "Audio instructions are now playing.",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Know Your Customer (KYC)</h1>
            <p className="text-muted-foreground">Complete your KYC to unlock all investment features</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Completion Progress</span>
            <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Rejection Reason */}
        {kycData.status === 'rejected' && kycData.rejectionReason && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">KYC Rejected</p>
                <p className="text-red-600 text-sm mt-1">{kycData.rejectionReason}</p>
                <p className="text-red-600 text-sm">Please update your information and resubmit.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KYC Form */}
      <Tabs value={currentStep.toString()} onValueChange={(value) => {
        const step = parseInt(value);
        setCurrentStep(step);
        updateKYCData('currentStep', step);
      }} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="1" className="flex items-center gap-2 cursor-pointer hover:bg-muted/80 transition-colors">
            <User className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="2" className="flex items-center gap-2 cursor-pointer hover:bg-muted/80 transition-colors">
            <MapPin className="h-4 w-4" />
            Address
          </TabsTrigger>
          <TabsTrigger value="3" className="flex items-center gap-2 cursor-pointer hover:bg-muted/80 transition-colors">
            <FileCheck className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="4" className="flex items-center gap-2 cursor-pointer hover:bg-muted/80 transition-colors">
            <CreditCard className="h-4 w-4" />
            Bank Details
          </TabsTrigger>
          <TabsTrigger value="5" className="flex items-center gap-2 cursor-pointer hover:bg-muted/80 transition-colors">
            <Video className="h-4 w-4" />
            Video KYC
          </TabsTrigger>
        </TabsList>

        {/* Step 1: Personal Information */}
        <TabsContent value="1" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Please provide your personal details as per your government-issued ID
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={kycData.personalInfo.firstName}
                    onChange={(e) => updateKYCData('personalInfo', { ...kycData.personalInfo, firstName: e.target.value })}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={kycData.personalInfo.lastName}
                    onChange={(e) => updateKYCData('personalInfo', { ...kycData.personalInfo, lastName: e.target.value })}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={kycData.personalInfo.email}
                    onChange={(e) => updateKYCData('personalInfo', { ...kycData.personalInfo, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={kycData.personalInfo.phone}
                    onChange={(e) => updateKYCData('personalInfo', { ...kycData.personalInfo, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={kycData.personalInfo.dateOfBirth}
                    onChange={(e) => updateKYCData('personalInfo', { ...kycData.personalInfo, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={kycData.personalInfo.gender}
                    onValueChange={(value) => updateKYCData('personalInfo', { ...kycData.personalInfo, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father's Name *</Label>
                  <Input
                    id="fatherName"
                    value={kycData.personalInfo.fatherName}
                    onChange={(e) => updateKYCData('personalInfo', { ...kycData.personalInfo, fatherName: e.target.value })}
                    placeholder="Enter father's name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherName">Mother's Name *</Label>
                  <Input
                    id="motherName"
                    value={kycData.personalInfo.motherName}
                    onChange={(e) => updateKYCData('personalInfo', { ...kycData.personalInfo, motherName: e.target.value })}
                    placeholder="Enter mother's name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select
                    value={kycData.personalInfo.maritalStatus}
                    onValueChange={(value) => updateKYCData('personalInfo', { ...kycData.personalInfo, maritalStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation *</Label>
                  <Input
                    id="occupation"
                    value={kycData.personalInfo.occupation}
                    onChange={(e) => updateKYCData('personalInfo', { ...kycData.personalInfo, occupation: e.target.value })}
                    placeholder="Your occupation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualIncome">Annual Income *</Label>
                  <Select
                    value={kycData.personalInfo.annualIncome}
                    onValueChange={(value) => updateKYCData('personalInfo', { ...kycData.personalInfo, annualIncome: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select income range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="below_2">Below ₹2 Lakh</SelectItem>
                      <SelectItem value="2_5">₹2-5 Lakh</SelectItem>
                      <SelectItem value="5_10">₹5-10 Lakh</SelectItem>
                      <SelectItem value="10_25">₹10-25 Lakh</SelectItem>
                      <SelectItem value="25_50">₹25-50 Lakh</SelectItem>
                      <SelectItem value="above_50">Above ₹50 Lakh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: Address Information */}
        <TabsContent value="2" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
              <CardDescription>
                Please provide your current residential address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="addressLine1">Address Line 1 *</Label>
                <Input
                  id="addressLine1"
                  value={kycData.addressInfo.addressLine1}
                  onChange={(e) => updateKYCData('addressInfo', { ...kycData.addressInfo, addressLine1: e.target.value })}
                  placeholder="House/Flat No., Street Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  value={kycData.addressInfo.addressLine2 || ''}
                  onChange={(e) => updateKYCData('addressInfo', { ...kycData.addressInfo, addressLine2: e.target.value })}
                  placeholder="Area, Landmark (Optional)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={kycData.addressInfo.city}
                    onChange={(e) => updateKYCData('addressInfo', { ...kycData.addressInfo, city: e.target.value })}
                    placeholder="Your city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={kycData.addressInfo.state}
                    onChange={(e) => updateKYCData('addressInfo', { ...kycData.addressInfo, state: e.target.value })}
                    placeholder="Your state"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pinCode">PIN Code *</Label>
                  <Input
                    id="pinCode"
                    value={kycData.addressInfo.pinCode}
                    onChange={(e) => updateKYCData('addressInfo', { ...kycData.addressInfo, pinCode: e.target.value })}
                    placeholder="6-digit PIN code"
                    maxLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={kycData.addressInfo.country}
                    onValueChange={(value) => updateKYCData('addressInfo', { ...kycData.addressInfo, country: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="USA">USA</SelectItem>
                      <SelectItem value="UK">UK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="residenceType">Residence Type</Label>
                  <Select
                    value={kycData.addressInfo.residenceType}
                    onValueChange={(value) => updateKYCData('addressInfo', { ...kycData.addressInfo, residenceType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owned">Owned</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                      <SelectItem value="family">Family Property</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsAtAddress">Years at Current Address *</Label>
                  <Select
                    value={kycData.addressInfo.yearsAtAddress}
                    onValueChange={(value) => updateKYCData('addressInfo', { ...kycData.addressInfo, yearsAtAddress: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="less_than_1">Less than 1 year</SelectItem>
                      <SelectItem value="1_2">1-2 years</SelectItem>
                      <SelectItem value="2_5">2-5 years</SelectItem>
                      <SelectItem value="5_10">5-10 years</SelectItem>
                      <SelectItem value="more_than_10">More than 10 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: Document Upload */}
        <TabsContent value="3" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
              <CardDescription>
                Please upload clear copies of your identity and address proof documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* PAN Card */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  PAN Card (Required)
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="panNumber">PAN Number *</Label>
                  <Input
                    id="panNumber"
                    value={kycData.documentInfo.panNumber}
                    onChange={(e) => updateKYCData('documentInfo', { ...kycData.documentInfo, panNumber: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Upload PAN Card *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload PAN Card image</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleFileUpload('panDocument', 'documentInfo')}
                    >
                      Choose File
                    </Button>
                  </div>
                </div>
              </div>

              {/* Aadhar Card */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Aadhar Card (Required)
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="aadharNumber">Aadhar Number *</Label>
                  <Input
                    id="aadharNumber"
                    value={kycData.documentInfo.aadharNumber}
                    onChange={(e) => updateKYCData('documentInfo', { ...kycData.documentInfo, aadharNumber: e.target.value })}
                    placeholder="XXXX XXXX XXXX"
                    maxLength={14}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Upload Aadhar Front *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                      <p className="text-xs text-gray-600">Front side</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-1 text-xs"
                        onClick={() => handleFileUpload('aadharFront', 'documentInfo')}
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Upload Aadhar Back *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                      <p className="text-xs text-gray-600">Back side</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-1 text-xs"
                        onClick={() => handleFileUpload('aadharBack', 'documentInfo')}
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Documents */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-semibold">Additional Documents (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Address Proof</Label>
                    <Select
                      value={kycData.documentInfo.addressProofType}
                      onValueChange={(value) => updateKYCData('documentInfo', { ...kycData.documentInfo, addressProofType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utility_bill">Utility Bill</SelectItem>
                        <SelectItem value="bank_statement">Bank Statement</SelectItem>
                        <SelectItem value="rent_agreement">Rent Agreement</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileUpload('addressProof', 'documentInfo')}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Address Proof
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Selfie with PAN Card</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileUpload('selfie', 'documentInfo')}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Selfie
                    </Button>
                    <p className="text-xs text-gray-500">Hold your PAN card while taking the selfie</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 4: Bank Details */}
        <TabsContent value="4" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bank Account Details</CardTitle>
              <CardDescription>
                Please provide your bank account details for investment transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                <Input
                  id="accountHolderName"
                  value={kycData.bankInfo.accountHolderName}
                  onChange={(e) => updateKYCData('bankInfo', { ...kycData.bankInfo, accountHolderName: e.target.value })}
                  placeholder="As per bank records"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input
                    id="accountNumber"
                    value={kycData.bankInfo.accountNumber}
                    onChange={(e) => updateKYCData('bankInfo', { ...kycData.bankInfo, accountNumber: e.target.value })}
                    placeholder="Enter account number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code *</Label>
                  <Input
                    id="ifscCode"
                    value={kycData.bankInfo.ifscCode}
                    onChange={(e) => updateKYCData('bankInfo', { ...kycData.bankInfo, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="ABCD0123456"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    value={kycData.bankInfo.bankName}
                    onChange={(e) => updateKYCData('bankInfo', { ...kycData.bankInfo, bankName: e.target.value })}
                    placeholder="State Bank of India"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branchName">Branch Name *</Label>
                  <Input
                    id="branchName"
                    value={kycData.bankInfo.branchName}
                    onChange={(e) => updateKYCData('bankInfo', { ...kycData.bankInfo, branchName: e.target.value })}
                    placeholder="Branch location"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select
                  value={kycData.bankInfo.accountType}
                  onValueChange={(value) => updateKYCData('bankInfo', { ...kycData.bankInfo, accountType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings Account</SelectItem>
                    <SelectItem value="current">Current Account</SelectItem>
                    <SelectItem value="salary">Salary Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bank Document Upload */}
              <div className="space-y-4 mt-6">
                <h4 className="font-semibold">Bank Verification Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Upload Cancelled Cheque</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileUpload('chequeDocument', 'bankInfo')}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Cheque Image
                    </Button>
                    <p className="text-xs text-gray-500">Upload a clear image of cancelled cheque</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Statement (Optional)</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileUpload('bankStatement', 'bankInfo')}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Statement
                    </Button>
                    <p className="text-xs text-gray-500">Latest 3 months bank statement</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 5: Video Verification */}
        <TabsContent value="5" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Verification
              </CardTitle>
              <CardDescription>
                Complete video verification by recording yourself holding your Aadhaar card while reading the verification phrase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Accessibility Banner */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Headphones className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Audio Accessibility Features</h4>
                </div>
                <p className="text-sm text-green-700 mb-3">
                  This KYC process includes audio support for visually impaired users. Listen to instructions and verification phrases using text-to-speech.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={playInstructions}
                  disabled={isPlayingAudio}
                  className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-100"
                >
                  <Volume2 className="h-4 w-4" />
                  {isPlayingAudio ? 'Playing Instructions...' : 'Play Audio Instructions'}
                </Button>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Video Recording Instructions:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Hold your Aadhaar card clearly visible in the frame</li>
                  <li>• Read the entire verification phrase aloud clearly</li>
                  <li>• Ensure your face and Aadhaar card are both clearly visible</li>
                  <li>• Record in a well-lit environment</li>
                </ul>
              </div>

              {/* Language Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium">Select Language:</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={kycData?.videoVerification.selectedLanguage === 'english' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => changeLanguage('english')}
                      className="flex items-center gap-1"
                    >
                      English
                    </Button>
                    <Button
                      variant={kycData?.videoVerification.selectedLanguage === 'hindi' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => changeLanguage('hindi')}
                      className="flex items-center gap-1"
                    >
                      हिंदी (Hindi)
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred language for the verification phrase. You will need to read this phrase aloud during video recording.
                </p>
              </div>

              {/* Verification Phrase */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium">
                    Verification Phrase ({kycData?.videoVerification.selectedLanguage === 'hindi' ? 'हिंदी' : 'English'}):
                  </Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPhrase(!showPhrase)}
                      className="flex items-center gap-1"
                    >
                      {showPhrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showPhrase ? 'Hide' : 'Show'} Phrase
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={isPlayingAudio ? stopAudio : playVerificationPhrase}
                      disabled={!speechSynthesis}
                      className="flex items-center gap-1 bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      {isPlayingAudio ? (
                        <>
                          <VolumeX className="h-4 w-4" />
                          Stop Audio
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-4 w-4" />
                          Play Audio
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateNewPhrase}
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-4 w-4" />
                      New Phrase
                    </Button>
                  </div>
                </div>

                {showPhrase && (
                  <div className="p-4 bg-gray-50 border rounded-lg">
                    <div className="text-sm leading-relaxed whitespace-pre-line font-medium">
                      {kycData?.videoVerification.verificationPhrase}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        This is a 2-line verification phrase. Please read both lines clearly during your video recording.
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={playVerificationPhrase}
                        disabled={isPlayingAudio}
                        className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <Volume2 className="h-3 w-3" />
                        Listen Again
                      </Button>
                    </div>
                  </div>
                )}

                {/* Audio-Only Section for Blind Users */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Headphones className="h-4 w-4 text-purple-600" />
                    <h5 className="font-medium text-purple-800">Audio-Only Mode for Visually Impaired Users</h5>
                  </div>
                  <p className="text-sm text-purple-700 mb-3">
                    You can complete the entire verification process using audio cues. Listen to the phrase multiple times and practice before recording.
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={playVerificationPhrase}
                      disabled={isPlayingAudio}
                      className="flex items-center gap-1 border-purple-300 text-purple-700 hover:bg-purple-100"
                    >
                      <Volume2 className="h-4 w-4" />
                      {isPlayingAudio ? 'Playing Phrase...' : 'Practice Phrase Audio'}
                    </Button>
                    {isPlayingAudio && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={stopAudio}
                        className="flex items-center gap-1 border-red-300 text-red-700 hover:bg-red-100"
                      >
                        <VolumeX className="h-4 w-4" />
                        Stop
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Recording Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  {!kycData?.videoVerification.recordingStarted ? (
                    <Button
                      onClick={startVideoRecording}
                      className="flex items-center gap-2 px-6 py-3"
                      size="lg"
                    >
                      <Play className="h-5 w-5" />
                      Start Recording
                    </Button>
                  ) : (
                    <div className="flex items-center gap-4">
                      {isRecording ? (
                        <Button
                          onClick={stopVideoRecording}
                          variant="destructive"
                          className="flex items-center gap-2 px-6 py-3"
                          size="lg"
                        >
                          <Square className="h-5 w-5" />
                          Stop Recording
                        </Button>
                      ) : (
                        <Button
                          onClick={startVideoRecording}
                          className="flex items-center gap-2 px-6 py-3"
                          size="lg"
                        >
                          <Play className="h-5 w-5" />
                          Record Again
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Live Video Preview */}
                {videoStream && isRecording && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-center">Live Preview</h4>
                    <div className="flex justify-center">
                      <div className="relative w-full max-w-md">
                        <video
                          ref={(video) => {
                            if (video && videoStream) {
                              video.srcObject = videoStream;
                            }
                          }}
                          autoPlay
                          muted
                          className="w-full h-auto rounded-lg border-2 border-red-500 shadow-lg"
                          style={{ transform: 'scaleX(-1)' }} // Mirror the video for better UX
                        />
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          LIVE
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recording Status */}
                {kycData?.videoVerification.recordingStarted && (
                  <div className="text-center space-y-2">
                    {isRecording ? (
                      <div className="flex items-center justify-center gap-2 text-red-600">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">Recording in progress...</span>
                      </div>
                    ) : kycData?.videoVerification.recordingCompleted ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Recording completed successfully</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Ready to record</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Review Section */}
              {isReviewing && recordedVideoUrl && (
                <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-semibold text-blue-800">Review Your Recording</h4>
                  <p className="text-sm text-blue-700">
                    Please review your recording below. Make sure you're clearly visible holding your Aadhaar card and the verification phrase is audible.
                  </p>

                  <div className="flex justify-center">
                    <div className="w-full max-w-md">
                      <video
                        src={recordedVideoUrl}
                        controls
                        className="w-full h-auto rounded-lg border shadow-lg"
                        style={{ transform: 'scaleX(-1)' }} // Mirror for consistency
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={acceptRecording}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Accept Recording
                    </Button>
                    <Button
                      onClick={rejectRecording}
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Record Again
                    </Button>
                  </div>
                </div>
              )}

              {/* Upload Section */}
              {kycData?.videoVerification.recordingCompleted && !isReviewing && (
                <div className="space-y-4 p-4 border rounded-lg bg-green-50">
                  <h4 className="font-semibold text-green-800">Upload Video for Verification</h4>
                  <p className="text-sm text-green-700">
                    Your video has been recorded successfully. Click upload to submit it for verification.
                  </p>

                  {!kycData?.videoVerification.uploadCompleted ? (
                    <Button
                      onClick={uploadVideo}
                      className="w-full flex items-center gap-2"
                      size="lg"
                    >
                      <Upload className="h-5 w-5" />
                      Upload Video to Portal
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Video uploaded successfully to portal</span>
                    </div>
                  )}
                </div>
              )}

              {/* Verification Complete */}
              {kycData?.videoVerification.isVerified && (
                <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Video Verification Complete!</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Your video has been successfully uploaded to our secure portal for verification.
                    Our team will review your submission and notify you of the outcome.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {currentStep < 5 ? (
              <Button onClick={saveAndContinue} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save & Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={submitKYC}
                disabled={!isComplete || isSubmitting || ['submitted', 'under_review', 'approved'].includes(kycData.status)}
                className={`flex items-center gap-2 ${!isComplete && !['submitted', 'under_review', 'approved'].includes(kycData.status) ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!isComplete && !['submitted', 'under_review', 'approved'].includes(kycData.status) ? 'Please complete all required fields before submitting' : ''}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {kycData.status === 'approved' ? 'KYC Approved' :
                     ['submitted', 'under_review'].includes(kycData.status) ? 'Submitted - Activation in 48 Hours' :
                     'Submit KYC'}
                  </>
                )}
              </Button>
            )}

            {/* Progress indicator when incomplete */}
            {!isComplete && !['submitted', 'under_review', 'approved'].includes(kycData.status) && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Complete all required fields to submit KYC</span>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-yellow-700 mb-1">
                    <span>Progress</span>
                    <span>{completionPercentage}% complete</span>
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default KYC;