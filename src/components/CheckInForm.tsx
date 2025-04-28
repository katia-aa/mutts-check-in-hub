
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import GuestSelect from "@/components/GuestSelect";

interface CheckInFormProps {
  isGuest: boolean;
}

const CheckInForm = ({ isGuest }: CheckInFormProps) => {
  const [email, setEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [selectedHostEmail, setSelectedHostEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isGuest) {
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
      } else {
        // Regular ticket holder flow
        const { data, error } = await supabase
          .from('attendees')
          .select('*')
          .eq('email', email.toLowerCase())
          .single();

        if (error || !data) {
          toast({
            variant: "destructive",
            title: "Hmm, that doesn't look right",
            description: "Please use the email from your Eventbrite registration.",
          });
          return;
        }

        toast({
          title: "Tail-wagging news!",
          description: "We found your registration. Let's continue!",
        });
        navigate(`/sign-waiver?email=${encodeURIComponent(email)}`);
      }
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
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {isGuest ? (
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
      ) : (
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 px-4 bg-white/90 border-mutts-primary/30 focus-visible:border-mutts-primary focus-visible:ring-mutts-primary rounded-xl"
          required
          disabled={isLoading}
        />
      )}

      <Button 
        type="submit" 
        className="w-full h-12 text-lg font-medium bg-mutts-primary hover:bg-mutts-primary/90 rounded-xl transition-all"
        disabled={isLoading}
      >
        {isGuest ? (
          <Search className="w-5 h-5 mr-2" />
        ) : (
          <Mail className="w-5 h-5 mr-2" />
        )}
        {isLoading ? "Checking..." : "Start Check-In"}
      </Button>
      
      <p className="text-sm text-center text-gray-500 pt-2">
        {isGuest ? 
          "You'll need to sign the waiver and upload your pup's vaccine record." :
          "Bringing a friend? They'll need to check in separately."
        }
      </p>
    </form>
  );
};

export default CheckInForm;
