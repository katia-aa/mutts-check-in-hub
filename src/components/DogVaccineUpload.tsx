
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dog } from "@/types/dog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useDogManagement } from "@/hooks/useDogManagement";
import { ArrowRight, Plus, Trash2, Upload } from "lucide-react";
import { useVaccineUpload } from "@/hooks/useVaccineUpload";
import UploadZone from "./vaccine/UploadZone";
import UploadProgress from "./vaccine/UploadProgress";
import FilePreview from "./vaccine/FilePreview";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface DogVaccineUploadProps {
  email: string | null;
}

const DogVaccineUpload = ({ email }: DogVaccineUploadProps) => {
  const { dogs, isLoading: isLoadingDogs, fetchDogs, addDog, removeDog } = useDogManagement(email);
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);
  const [newDogName, setNewDogName] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useCustomToast();
  
  const form = useForm();
  
  // Fetch dogs on component mount
  useState(() => {
    if (email) {
      fetchDogs();
    }
  });
  
  const handleUploadSuccess = () => {
    if (formSubmitted) return; // Prevent multiple success handlers
    
    toast.success({
      title: "Upload complete!",
      description: "Your dog's vaccination record has been uploaded successfully.",
      duration: 2000
    });
    
    // Reset selection and fetch updated dogs
    setSelectedDogId(null);
    fetchDogs();
    setFormSubmitted(false);
  };

  const {
    file,
    preview,
    isUploading,
    uploadProgress,
    isConfiguringStorage,
    handleFileChange,
    handleSubmit: originalHandleSubmit,
  } = useVaccineUpload({
    email,
    dogId: selectedDogId,
    onUploadSuccess: handleUploadSuccess,
  });

  // Wrap the submit handler to prevent double submissions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isUploading || isConfiguringStorage || !file || formSubmitted || !selectedDogId) {
      return; // Prevent submission if already in progress or form already submitted
    }
    
    setFormSubmitted(true); // Mark form as submitted
    await originalHandleSubmit(e);
  };
  
  const handleAddDog = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDogName.trim() && email) {
      addDog(newDogName.trim());
      setNewDogName("");
    }
  };
  
  const handleComplete = () => {
    navigate("/check-in-complete");
  };

  return (
    <div className="space-y-6">
      {/* Add Dog Form */}
      <Card>
        <CardHeader>
          <CardTitle>Your Dogs</CardTitle>
          <CardDescription>
            Add all the dogs you're bringing to the event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddDog} className="flex items-end gap-2">
            <div className="flex-1">
              <FormLabel htmlFor="dogName">Dog's Name</FormLabel>
              <Input 
                id="dogName"
                value={newDogName} 
                onChange={(e) => setNewDogName(e.target.value)} 
                placeholder="Enter your dog's name" 
              />
            </div>
            <Button 
              type="submit" 
              size="icon"
              disabled={!newDogName.trim() || isLoadingDogs}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </form>
          
          {/* Dog List */}
          <div className="mt-4 space-y-3">
            {dogs.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No dogs added yet</p>
            ) : (
              dogs.map(dog => (
                <div 
                  key={dog.id} 
                  className={`flex items-center justify-between p-3 rounded-md border ${
                    selectedDogId === dog.id ? "bg-mutts-primary/10 border-mutts-primary" : "bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-medium">{dog.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {dog.vaccine_upload_status ? (
                          <span className="text-green-600">✓ Vaccine record uploaded</span>
                        ) : (
                          <span className="text-amber-600">⚠ Vaccine record needed</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!dog.vaccine_upload_status && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedDogId(dog.id)}
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Upload
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 h-8 w-8"
                      onClick={() => removeDog(dog.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Upload Form */}
      {selectedDogId && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Vaccine Record</CardTitle>
            <CardDescription>
              Upload the vaccine record for {dogs.find(d => d.id === selectedDogId)?.name || 'your dog'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <UploadZone
                  onFileChange={handleFileChange}
                  isDisabled={isUploading || isConfiguringStorage || formSubmitted}
                  isConfiguringStorage={isConfiguringStorage}
                />
                
                <UploadProgress progress={uploadProgress} />
                
                <FilePreview file={file} previewUrl={preview} />
              </div>

              <Button
                type="submit"
                className="w-full bg-mutts-secondary hover:bg-mutts-secondary/90 text-white rounded-xl h-12"
                disabled={isUploading || isConfiguringStorage || !file || formSubmitted}
              >
                {isUploading ? "Uploading..." : (isConfiguringStorage ? "Preparing..." : formSubmitted ? "Processing..." : "Upload Vaccine Record")}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedDogId(null)}
                className="w-full"
              >
                Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
      
      {/* Complete Button */}
      <Button
        className="w-full bg-mutts-secondary hover:bg-mutts-secondary/90 text-white rounded-xl h-12"
        onClick={handleComplete}
      >
        Complete Check-In
        <ArrowRight className="ml-2" />
      </Button>
    </div>
  );
};

export default DogVaccineUpload;
