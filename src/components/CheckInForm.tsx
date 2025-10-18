import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail } from "lucide-react";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { supabase } from "@/integrations/supabase/client";

const CheckInForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [noDog, setNoDog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useCustomToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsLoading(true);
    setIsSubmitting(true);
    
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const normalizedEmail = email.toLowerCase().trim();

      // Check if attendee already exists
      const { data: existingAttendee } = await supabase
        .from('attendees')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      let attendeeData;

      if (existingAttendee) {
        // Update existing attendee
        const { data: updatedAttendee, error: updateError } = await supabase
          .from('attendees')
          .update({
            name: fullName,
            updated_at: new Date().toISOString(),
          })
          .eq('email', normalizedEmail)
          .select()
          .single();

        if (updateError) throw updateError;
        attendeeData = updatedAttendee;
      } else {
        // Create new attendee
        const { data: newAttendee, error: insertError } = await supabase
          .from('attendees')
          .insert({
            email: normalizedEmail,
            name: fullName,
            is_guest: false,
            vaccine_upload_status: false,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        attendeeData = newAttendee;
      }

      toast.encouragement({
        title: "Welcome!",
        description: "Let's continue with your check-in.",
      });
      
      navigate(`/sign-waiver?email=${encodeURIComponent(normalizedEmail)}&noDog=${noDog}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error({
        title: "Error",
        description: "An error occurred. Please try again.",
      });
      setTimeout(() => setIsSubmitting(false), 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="h-12 px-4 bg-white/90 border-mutts-primary/30 focus-visible:border-mutts-primary focus-visible:ring-mutts-primary rounded-xl"
          required
          disabled={isLoading || isSubmitting}
        />

        <Input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="h-12 px-4 bg-white/90 border-mutts-primary/30 focus-visible:border-mutts-primary focus-visible:ring-mutts-primary rounded-xl"
          required
          disabled={isLoading || isSubmitting}
        />

        <Input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 px-4 bg-white/90 border-mutts-primary/30 focus-visible:border-mutts-primary focus-visible:ring-mutts-primary rounded-xl"
          required
          disabled={isLoading || isSubmitting}
        />
      </div>

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
        {isLoading ? "Processing..." : "Continue to Waiver"}
      </Button>
    </form>
  );
};

export default CheckInForm;
