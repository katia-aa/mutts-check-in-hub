
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Dog } from "lucide-react";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { supabase } from "@/integrations/supabase/client";

interface CheckInFormProps {
  isGuest: boolean;
}

const CheckInForm = ({ isGuest }: CheckInFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [noDog, setNoDog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useCustomToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submission
    
    setIsLoading(true);
    setIsSubmitting(true);
    
    try {
      // Regular ticket holder flow
      const { data, error } = await supabase
        .from('attendees')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error || !data) {
        toast.error({
          title: "Hmm, that doesn't look right",
          description: "Please use the email from your Eventbrite registration.",
        });
        // Reset submit state to allow retry
        setTimeout(() => setIsSubmitting(false), 1000);
        return;
      }
      
      // Update the attendee to mark if they have a dog or not
      await supabase
        .from('attendees')
        .update({ has_no_dog: noDog })
        .eq('email', email.toLowerCase());

      toast.encouragement({
        title: "Tail-wagging news!",
        description: "We found your registration. Let's continue!",
      });
      
      // If attendee has no dog, skip the vaccine upload step
      if (noDog) {
        navigate(`/sign-waiver?email=${encodeURIComponent(email)}&noDog=true`);
      } else {
        navigate(`/sign-waiver?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error({
        title: "Error",
        description: "An error occurred. Please try again.",
      });
      // Reset submit state to allow retry
      setTimeout(() => setIsSubmitting(false), 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <Input
        type="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-12 px-4 bg-white/90 border-mutts-primary/30 focus-visible:border-mutts-primary focus-visible:ring-mutts-primary rounded-xl"
        required
        disabled={isLoading || isSubmitting}
      />

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="noDog" 
          checked={noDog} 
          onCheckedChange={(checked) => setNoDog(checked === true)}
          className="border-mutts-primary data-[state=checked]:bg-mutts-primary"
        />
        <label 
          htmlFor="noDog" 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          I'm not bringing a dog to this event
        </label>
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 text-lg font-medium bg-mutts-primary hover:bg-mutts-primary/90 rounded-xl transition-all"
        disabled={isLoading || isSubmitting}
      >
        <Mail className="w-5 h-5 mr-2" />
        {isLoading ? "Checking..." : "Let's Get This Pawty Started"}
      </Button>
    </form>
  );
};

export default CheckInForm;
