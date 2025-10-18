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
  const [hasDog, setHasDog] = useState(false);
  const [da2ppVaccine, setDa2ppVaccine] = useState(false);
  const [rabiesVaccine, setRabiesVaccine] = useState(false);
  const [bordetellaVaccine, setBordetellaVaccine] = useState(false);
  const navigate = useNavigate();
  const { toast } = useCustomToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validate vaccination checkboxes if user has a dog
    if (hasDog && (!da2ppVaccine || !rabiesVaccine || !bordetellaVaccine)) {
      toast.error({
        title: "Vaccination Required",
        description: "Please confirm all vaccination requirements for your dog.",
      });
      return;
    }

    setIsLoading(true);
    setIsSubmitting(true);

    try {
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
            first_name: firstName,
            last_name: lastName,
            has_dog: hasDog,
            da2pp_vaccine: hasDog ? da2ppVaccine : false,
            rabies_vaccine: hasDog ? rabiesVaccine : false,
            bordetella_vaccine: hasDog ? bordetellaVaccine : false,
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
            first_name: firstName,
            last_name: lastName,
            has_dog: hasDog,
            da2pp_vaccine: hasDog ? da2ppVaccine : false,
            rabies_vaccine: hasDog ? rabiesVaccine : false,
            bordetella_vaccine: hasDog ? bordetellaVaccine : false,
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

      navigate(`/sign-waiver?email=${encodeURIComponent(normalizedEmail)}`);
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

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasDog"
            checked={hasDog}
            onCheckedChange={(checked) => {
              setHasDog(checked === true);
              if (!checked) {
                // Reset vaccination checkboxes if user doesn't have a dog
                setDa2ppVaccine(false);
                setRabiesVaccine(false);
                setBordetellaVaccine(false);
              }
            }}
            className="border-mutts-primary data-[state=checked]:bg-mutts-primary"
          />
          <label
            htmlFor="hasDog"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            I'm bringing a dog to this event
          </label>
        </div>

        {hasDog && (
          <div className="pl-6 space-y-3 border-l-2 border-mutts-primary/20">
            <p className="text-sm font-semibold text-mutts-primary">
              Vaccination Requirements (All Required)
            </p>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="da2pp"
                checked={da2ppVaccine}
                onCheckedChange={(checked) => setDa2ppVaccine(checked === true)}
                className="border-mutts-primary data-[state=checked]:bg-mutts-primary mt-0.5"
              />
              <label
                htmlFor="da2pp"
                className="text-sm leading-tight cursor-pointer"
              >
                My dog is up to date on the DA2PP (Distemper, Adenovirus, Parvovirus, Parainfluenza) vaccine
              </label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="rabies"
                checked={rabiesVaccine}
                onCheckedChange={(checked) => setRabiesVaccine(checked === true)}
                className="border-mutts-primary data-[state=checked]:bg-mutts-primary mt-0.5"
              />
              <label
                htmlFor="rabies"
                className="text-sm leading-tight cursor-pointer"
              >
                My dog is up to date on the Rabies vaccine
              </label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="bordetella"
                checked={bordetellaVaccine}
                onCheckedChange={(checked) => setBordetellaVaccine(checked === true)}
                className="border-mutts-primary data-[state=checked]:bg-mutts-primary mt-0.5"
              />
              <label
                htmlFor="bordetella"
                className="text-sm leading-tight cursor-pointer"
              >
                My dog is up to date on the Bordetella (Kennel Cough) vaccine
              </label>
            </div>
          </div>
        )}
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
