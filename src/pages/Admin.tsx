
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import AttendeeTable from "@/components/AttendeeTable";
import { Attendee } from "@/types/attendee";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAttendees();
  }, []);

  const fetchAttendees = async () => {
    try {
      const { data, error } = await supabase
        .from('attendees')
        .select('*');

      if (error) {
        console.error('Error fetching attendees:', error);
        return;
      }

      setAttendees(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = attendees.filter(
    attendee =>
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (attendee.name && attendee.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-mutts-primary">Admin Check-In Dashboard</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full max-w-md border-mutts-primary/20 focus:border-mutts-primary"
          />
        </div>

        {isLoading ? (
          <div className="text-center text-gray-500">Loading attendees...</div>
        ) : (
          <AttendeeTable data={filteredData} onDataUpdate={fetchAttendees} />
        )}
      </div>
    </div>
  );
};

export default Admin;
