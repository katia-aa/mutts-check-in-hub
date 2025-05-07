
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CheckInLayout from "@/components/CheckInLayout";
import { Dog } from "@/types/dog";
import { Plus, ArrowRight, X, Check, Upload } from "lucide-react";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useDogManagement } from "@/hooks/useDogManagement";
import { useVaccineUpload } from "@/hooks/useVaccineUpload";

const DogVaccineUpload = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const navigate = useNavigate();
  const { toast } = useCustomToast();
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);
  const [newDogName, setNewDogName] = useState("");
  const [isAddingDog, setIsAddingDog] = useState(false);
  
  // Use the dog management hook to handle dog-related operations
  const { 
    dogs, 
    isLoading: isLoadingDogs, 
    fetchDogs, 
    addDog, 
    removeDog 
  } = useDogManagement(email);
  
  // Initialize vaccine upload for the currently selected dog
  const {
    file,
    preview,
    isUploading,
    uploadProgress,
    isConfiguringStorage,
    handleFileChange,
    handleSubmit: handleUploadSubmit,
    clearFileSelection,
  } = useVaccineUpload({
    email,
    dogId: selectedDogId,
    onUploadSuccess: () => {
      toast.success({
        title: "Upload complete!",
        description: "Vaccine record uploaded successfully.",
        duration: 2000
      });
      
      // Refresh dogs to update vaccine status
      fetchDogs();
      // Clear selection after successful upload
      clearFileSelection();
      setSelectedDogId(null);
    }
  });
  
  // Fetch dogs on component mount
  useEffect(() => {
    if (email) {
      fetchDogs();
    }
  }, [email]);
  
  // Handle adding a new dog
  const handleAddDog = async () => {
    if (!newDogName.trim()) {
      toast.error({
        title: "Dog name required",
        description: "Please enter your dog's name"
      });
      return;
    }
    
    await addDog(newDogName.trim());
    setNewDogName("");
    setIsAddingDog(false);
  };
  
  // Handler for completing the check-in process
  const handleCompleteCheckIn = () => {
    // Check if all dogs have vaccines uploaded
    const allDogsHaveVaccines = dogs.every(dog => dog.vaccine_upload_status);
    
    if (!dogs.length) {
      toast.error({
        title: "No dogs added",
        description: "Please add at least one dog before completing check-in"
      });
      return;
    }
    
    if (!allDogsHaveVaccines) {
      toast.error({
        title: "Missing vaccine records",
        description: "Please upload vaccine records for all dogs"
      });
      return;
    }
    
    // Redirect to completion page
    navigate("/check-in-complete");
  };
  
  return (
    <CheckInLayout
      step={3}
      title="Last Step!"
      subtitle="Upload your pups' vaccine records and you're good to go"
    >
      <div className="space-y-6">
        {/* Dog list section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Your Dogs</h3>
          
          {isLoadingDogs ? (
            <div className="text-center py-4">Loading your dogs...</div>
          ) : dogs.length > 0 ? (
            <div className="space-y-3">
              {dogs.map((dog) => (
                <div 
                  key={dog.id} 
                  className={`p-4 rounded-lg border flex justify-between items-center ${
                    selectedDogId === dog.id ? "border-mutts-primary bg-mutts-primary/5" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {dog.vaccine_upload_status ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <div>
                      <h4 className="font-medium">{dog.name}</h4>
                      <p className="text-sm text-gray-500">
                        {dog.vaccine_upload_status ? "Vaccine record uploaded" : "Needs vaccine record"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {!dog.vaccine_upload_status && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDogId(dog.id)}
                        className="border-mutts-primary/50 text-mutts-primary"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Upload
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed rounded-lg">
              <p className="text-gray-500">No dogs added yet</p>
            </div>
          )}
          
          {/* Add dog form */}
          {isAddingDog ? (
            <div className="flex items-center space-x-2 mt-4">
              <Input
                placeholder="Dog's name"
                value={newDogName}
                onChange={(e) => setNewDogName(e.target.value)}
                className="border-mutts-primary/30 focus-visible:ring-mutts-primary"
                autoFocus
              />
              <Button 
                onClick={handleAddDog}
                className="bg-mutts-primary hover:bg-mutts-primary/90"
              >
                Add
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddingDog(false);
                  setNewDogName("");
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsAddingDog(true)}
              className="w-full border-mutts-primary/30 hover:border-mutts-primary/50 text-mutts-primary mt-2"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Another Dog
            </Button>
          )}
        </div>
        
        {/* Upload section - only visible when a dog is selected */}
        {selectedDogId && (
          <div className="space-y-4 animate-fade-in border-t pt-4 mt-6">
            <h3 className="text-lg font-medium">
              Upload Vaccine Record for {dogs.find(d => d.id === selectedDogId)?.name}
            </h3>
            
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
            </div>
            
            {/* Upload progress bar */}
            {uploadProgress !== null && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-mutts-primary h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            
            {/* File preview */}
            {file && (
              <div className="mt-4 flex justify-center animate-fade-in">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-xs max-h-48 object-contain rounded-lg border border-mutts-primary/20"
                  />
                ) : (
                  <div className="text-center text-sm text-gray-600">
                    File selected: {file.name}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-between space-x-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedDogId(null)}
                className="w-1/3"
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleUploadSubmit}
                disabled={!file || isUploading || isConfiguringStorage}
                className="w-2/3 bg-mutts-secondary hover:bg-mutts-secondary/90 text-white"
              >
                {isUploading ? "Uploading..." : isConfiguringStorage ? "Preparing..." : "Upload Vaccine Record"}
              </Button>
            </div>
          </div>
        )}
        
        {/* Complete check-in button */}
        <Button
          onClick={handleCompleteCheckIn}
          className="w-full bg-mutts-secondary hover:bg-mutts-secondary/90 text-white rounded-xl h-12 mt-6"
          disabled={!dogs.length || !dogs.every(dog => dog.vaccine_upload_status)}
        >
          Complete Check-In
          <ArrowRight className="ml-2" />
        </Button>
      </div>
    </CheckInLayout>
  );
};

export default DogVaccineUpload;
