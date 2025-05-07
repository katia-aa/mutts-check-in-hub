
import { useState, useEffect } from "react";
import { useAttendeeSync } from "@/hooks/useAttendeeSync";
import AdminHeader from "@/components/admin/AdminHeader";
import ErrorDisplay from "@/components/admin/ErrorDisplay";
import SearchBar from "@/components/admin/SearchBar";
import AttendeeContent from "@/components/admin/AttendeeContent";
import { Attendee } from "@/types/attendee";

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    attendees,
    isLoading,
    errorMessage,
    connectionError,
    rlsError,
    syncEventbriteAttendees,
    fetchAttendees,
  } = useAttendeeSync();

  useEffect(() => {
    syncEventbriteAttendees();
  }, []);

  // Enhanced search to check both human and dog names/emails
  const filteredData = attendees.filter(
    (attendee) => {
      const searchLower = searchTerm.toLowerCase();
      // Basic search for humans
      const basicMatch = 
        attendee.email?.toLowerCase().includes(searchLower) ||
        (attendee.name && attendee.name.toLowerCase().includes(searchLower));
      
      return basicMatch;
    }
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <AdminHeader onSync={syncEventbriteAttendees} isLoading={isLoading} />

        <ErrorDisplay
          errorMessage={errorMessage}
          connectionError={connectionError}
          rlsError={rlsError}
        />

        <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />

        <AttendeeContent
          isLoading={isLoading}
          filteredData={filteredData}
          searchTerm={searchTerm}
          errorMessage={errorMessage}
          onDataUpdate={fetchAttendees}
        />
      </div>
    </div>
  );
};

export default Admin;
