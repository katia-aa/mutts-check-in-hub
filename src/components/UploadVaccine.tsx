
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import CheckInLayout from "@/components/CheckInLayout";
import Confetti from "@/components/Confetti";
import { supabase } from "@/integrations/supabase/client";
import { configureStorage } from "@/utils/configureStorage";

const UploadVaccine = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [storageConfigured, setStorageConfigured] = useState(false);
  const [isConfiguringStorage, setIsConfiguringStorage] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Pre-configure storage when component mounts
  useEffect(() => {
    const preConfigureStorage = async () => {
      setIsConfiguringStorage(true);
      try {
        console.log("Pre-configuring storage on component mount");
        const result = await configureStorage();
        setStorageConfigured(result.success);
        console.log("Storage pre-configuration result:", result);
      } catch (error) {
        console.error("Error pre-configuring storage:", error);
      } finally {
        setIsConfiguringStorage(false);
      }
    };
    
    preConfigureStorage();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select a file smaller than 10MB",
      });
      return;
    }

    setFile(selectedFile);
    console.log("Selected file:", selectedFile);

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        variant: "destructive",
        title: "Oops! Missing vaccine record",
        description: "Please upload your pup's vaccine record first",
      });
      return;
    }

    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email is required",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Sanitize email for use in file path (remove special chars)
      const safeEmail = email.replace(/[^a-zA-Z0-9.@]/g, '_');
      
      // Create a unique filename with extension
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${safeEmail}/${fileName}`;

      console.log("Submitting file:", file);
      console.log("Upload starting for file:", file.name);
      console.log("To path:", filePath);
      console.log("File size:", file.size, "bytes");
      console.log("File type:", file.type);

      // Simulate initial upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev !== null && prev < 30) {
            return prev + 5;
          }
          return prev;
        });
      }, 300);

      // Ensure storage is configured first
      if (!storageConfigured) {
        console.log("Storage not pre-configured, configuring now...");
        setUploadProgress(10);
        const configResult = await configureStorage();
        
        console.log("Storage configuration check:", configResult);
        
        if (!configResult.success) {
          throw new Error("Failed to configure storage before upload");
        }
        
        // Wait a moment for storage configuration to take effect
        await new Promise(resolve => setTimeout(resolve, 2000));
        setStorageConfigured(true);
      }
      
      setUploadProgress(40);

      // Upload file to Supabase Storage with explicit content type
      // Create a URL for the file and get its content type
      const fileBlob = new Blob([file], { type: file.type });
      
      // Using the lower-level API for better control
      console.log("Creating signed URL for upload...");
      const { data: signedURL, error: signedError } = await supabase.storage
        .from('vaccine_records')
        .createSignedUploadUrl(filePath);
      
      if (signedError) {
        console.error("Error creating signed URL:", signedError);
        throw new Error(`Failed to create signed URL: ${signedError.message}`);
      }
      
      console.log("Got signed URL:", signedURL);
      setUploadProgress(60);
      
      // Use the signed URL to upload the file
      const uploadResponse = await fetch(signedURL.signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: fileBlob,
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`HTTP upload error: ${uploadResponse.status}`);
      }

      clearInterval(progressInterval);
      setUploadProgress(80);
      console.log("Upload successful using signed URL");

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from("vaccine_records")
        .getPublicUrl(filePath);

      console.log("Public URL:", publicUrl);
      setUploadProgress(90);

      // Update attendee record with file information
      const { error: updateError } = await supabase
        .from("attendees")
        .update({
          vaccine_upload_status: true,
          vaccine_file_path: filePath,
          vaccine_file_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("email", email);

      if (updateError) {
        console.error("Database update error:", updateError);
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      setUploadProgress(100);
      console.log("Database updated successfully");

      setShowConfetti(true);

      toast({
        title: "Yay! You're all set! 🎉",
        description: "Can't wait to see you and your pup at the event!",
      });

      // Add a delay before navigation to allow confetti to play
      setTimeout(() => {
        navigate("/");
      }, 4000);
    } catch (error) {
      console.error("Error uploading vaccine record:", error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: error.message || "There was an error uploading your vaccine record. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {showConfetti && <Confetti />}
      <CheckInLayout
        step={3}
        title="Last Step!"
        subtitle="Upload your pup's vaccine record or a photo of it, and you're good to go"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col items-center p-6 border-2 border-dashed border-mutts-primary/30 rounded-xl bg-white/70 hover:border-mutts-primary/50 transition-colors">
              <Upload className="h-8 w-8 mb-2 text-mutts-primary" />
              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="max-w-xs border-mutts-primary/30 focus-visible:ring-mutts-primary"
                disabled={isUploading || isConfiguringStorage}
              />
              <p className="mt-2 text-sm text-gray-500">
                Accepts JPG, PNG, or PDF (max 10MB)
              </p>
              {isConfiguringStorage && (
                <p className="mt-1 text-xs text-blue-600 animate-pulse">
                  Setting up secure storage...
                </p>
              )}
            </div>

            {uploadProgress !== null && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-mutts-primary h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            {preview && (
              <div className="mt-4 flex justify-center animate-fade-in">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-xs max-h-48 object-contain rounded-lg border border-mutts-primary/20"
                />
              </div>
            )}

            {file && !preview && (
              <div className="mt-4 text-center text-sm text-gray-600 animate-fade-in">
                File selected: {file.name}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-mutts-secondary hover:bg-mutts-secondary/90 text-white rounded-xl h-12"
            disabled={isUploading || isConfiguringStorage}
          >
            {isUploading ? "Uploading..." : (isConfiguringStorage ? "Preparing..." : "Complete Check-In")}
            {!isUploading && !isConfiguringStorage && <ArrowRight className="ml-2" />}
          </Button>
        </form>
      </CheckInLayout>
    </>
  );
};

export default UploadVaccine;
