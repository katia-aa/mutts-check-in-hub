import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const UploadVaccine = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        variant: "destructive",
        title: "Missing vaccine record",
        description: "Please upload a vaccine record first",
      });
      return;
    }

    console.log("Submitting file:", file);

    toast({
      title: "Check-in complete!",
      description: "Your dog's vaccine record has been submitted successfully.",
    });

    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-gray-100 px-4 py-12 font-[Inter]">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-4xl font-bold text-gray-800">
            Step 2: Upload Dog Vaccine Record
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col items-center p-6 border-2 border-dashed rounded-lg bg-white">
                <Upload className="h-8 w-8 mb-2 text-gray-400" />
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="max-w-xs"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Accepts JPG, PNG, or PDF
                </p>
              </div>
              
              {preview && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-xs max-h-48 object-contain rounded-lg"
                  />
                </div>
              )}
              
              {file && !preview && (
                <div className="mt-4 text-center text-sm text-gray-600">
                  File selected: {file.name}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600"
            >
              Submit Check-In
              <ArrowRight className="ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadVaccine;
