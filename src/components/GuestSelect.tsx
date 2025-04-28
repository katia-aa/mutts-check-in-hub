
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface GuestSelectProps {
  selectedHostEmail: string;
  onSelect: (email: string) => void;
  disabled: boolean;
}

const GuestSelect = ({ selectedHostEmail, onSelect, disabled }: GuestSelectProps) => {
  const [ticketHolders, setTicketHolders] = useState<{ name: string; email: string }[]>([]);

  useEffect(() => {
    const fetchTicketHolders = async () => {
      const { data, error } = await supabase
        .from('attendees')
        .select('name, email')
        .eq('is_guest', false)
        .order('name');

      if (!error && data) {
        setTicketHolders(data);
      }
    };

    fetchTicketHolders();
  }, []);

  return (
    <Select value={selectedHostEmail} onValueChange={onSelect} disabled={disabled}>
      <SelectTrigger className="h-12 px-4 bg-white/90 border-mutts-primary/30 focus:border-mutts-primary focus:ring-mutts-primary rounded-xl">
        <SelectValue placeholder="Select ticket holder you're a guest of" />
      </SelectTrigger>
      <SelectContent>
        {ticketHolders.map((holder) => (
          <SelectItem key={holder.email} value={holder.email}>
            {holder.name || holder.email}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default GuestSelect;
