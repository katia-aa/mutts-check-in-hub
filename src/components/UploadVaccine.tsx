import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import CheckInLayout from "@/components/CheckInLayout";
import Confetti from "@/components/Confetti";
import { supabase } from "@/integrations/supabase/client";

const UploadVaccine = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

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

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${email}/${Date.now()}.${fileExt}`;
      const filePath = `vaccine_records/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("vaccine_records")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from("vaccine_records").getPublicUrl(fileName);

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

      if (updateError) throw updateError;

      setShowConfetti(true);

      toast({
        title: "Yay! You're all set! 🎉",
        description: "Can't wait to see you and your pup at the event!",
      });

      setTimeout(() => {
        navigate("/");
      }, 4000);
    } catch (error) {
      console.error("Error uploading vaccine record:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "There was an error uploading your vaccine record. Please try again.",
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
                disabled={isUploading}
              />
              <p className="mt-2 text-sm text-gray-500">
                Accepts JPG, PNG, or PDF
              </p>
            </div>

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
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Complete Check-In"}
            <ArrowRight className="ml-2" />
          </Button>
        </form>
      </CheckInLayout>
    </>
  );
};

export default UploadVaccine;
