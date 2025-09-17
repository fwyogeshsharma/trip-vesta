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
  Send
} from "lucide-react";
import { KYCStorage, type KYCData } from "@/utils/kycStorage";

const KYC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load KYC data on component mount
  useEffect(() => {
    let data = KYCStorage.getKYCData();
    if (!data) {
      data = KYCStorage.initializeKYC();
    }
    setKycData(data);
    setCurrentStep(data.currentStep);
  }, []);

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
    if (currentStep < 4) {
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

    // Simulate review process (in real app, this would be handled by backend)
    setTimeout(() => {
      const shouldApprove = Math.random() > 0.3; // 70% approval rate for demo
      if (shouldApprove) {
        KYCStorage.updateKYCStatus('approved');
        toast({
          title: "KYC Approved!",
          description: "Your KYC has been approved successfully. You can now invest in all trips.",
        });
      } else {
        KYCStorage.updateKYCStatus('under_review');
        toast({
          title: "KYC Under Review",
          description: "Your KYC is being reviewed. You'll be notified once approved.",
        });
      }
      // Refresh data
      const updatedData = KYCStorage.getKYCData();
      if (updatedData) setKycData(updatedData);
    }, 5000);

    setIsSubmitting(false);
    toast({
      title: "KYC Submitted",
      description: "Your KYC has been submitted successfully. Review will be completed within 24 hours.",
    });
  };

  // File upload handler (placeholder)
  const handleFileUpload = (field: string, section: keyof KYCData) => {
    toast({
      title: "File Upload",
      description: "File upload functionality would be implemented here in a real application.",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
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
      <Tabs value={currentStep.toString()} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="1" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="2" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Address
          </TabsTrigger>
          <TabsTrigger value="3" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="4" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Bank Details
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
            {currentStep < 4 ? (
              <Button onClick={saveAndContinue} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save & Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={submitKYC}
                disabled={!isComplete || isSubmitting || ['submitted', 'under_review', 'approved'].includes(kycData.status)}
                className="flex items-center gap-2"
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
                     ['submitted', 'under_review'].includes(kycData.status) ? 'Submitted' :
                     'Submit KYC'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default KYC;