
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CheckInLayout from "@/components/CheckInLayout";
import GuestSelect from "@/components/GuestSelect";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const GuestCheckIn = () => {
  const [guestName, setGuestName] = useState('');
  const [selectedHostEmail, setSelectedHostEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!selectedHostEmail || !guestName) {
        toast({
          variant: "destructive",
          title: "Required Information Missing",
          description: "Please enter your name and select a ticket holder.",
        });
        return;
      }

      // Create guest record
      const { data: guestData, error: guestError } = await supabase
        .from('attendees')
        .insert({
          email: `${guestName.toLowerCase().replace(/\s+/g, '_')}_guest_of_${selectedHostEmail}`,
          name: guestName,
          is_guest: true,
          parent_ticket_email: selectedHostEmail,
          guest_name: guestName
        })
        .select()
        .single();

      if (guestError) throw guestError;

      toast({
        title: "Welcome!",
        description: "Let's continue with your check-in.",
      });
      navigate(`/sign-waiver?email=${encodeURIComponent(guestData.email)}`);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CheckInLayout 
      step={1}
      title="Guest Check-In"
      subtitle="Select the person you're a guest of, then complete your check-in"
    >
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Enter your name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="h-12 px-4 bg-white/90 border-mutts-primary/30 focus-visible:border-mutts-primary focus-visible:ring-mutts-primary rounded-xl"
            required
            disabled={isLoading}
          />
          
          <GuestSelect
            selectedHostEmail={selectedHostEmail}
            onSelect={setSelectedHostEmail}
            disabled={isLoading}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 text-lg font-medium bg-mutts-primary hover:bg-mutts-primary/90 rounded-xl transition-all"
          disabled={isLoading}
        >
          {isLoading ? "Checking..." : "Start Check-In"}
        </Button>
      </form>
    </CheckInLayout>
  );
};

export default GuestCheckIn;
