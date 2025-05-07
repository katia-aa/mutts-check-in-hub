
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dog } from "@/types/dog";

export const useDogManagement = (ownerEmail: string | null) => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchDogs = async () => {
    if (!ownerEmail) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("dogs")
        .select("*")
        .eq("owner_email", ownerEmail);
      
      if (error) throw error;
      setDogs(data || []);
    } catch (error) {
      console.error("Error fetching dogs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch dogs from database",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addDog = async (name: string) => {
    if (!ownerEmail) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("dogs")
        .insert({
          name,
          owner_email: ownerEmail,
          vaccine_upload_status: false
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Added ${name} to your pets`,
      });
      
      await fetchDogs();
    } catch (error) {
      console.error("Error adding dog:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add pet",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeDog = async (dogId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("dogs")
        .delete()
        .eq("id", dogId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Pet removed successfully",
      });
      
      await fetchDogs();
    } catch (error) {
      console.error("Error removing dog:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove pet",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    dogs,
    isLoading,
    fetchDogs,
    addDog,
    removeDog
  };
};
