
import { useState } from "react";
import { Attendee } from "@/types/attendee";
import SearchBar from "@/components/admin/SearchBar";
import AttendeeContent from "@/components/admin/AttendeeContent";

interface AdminContentProps {
  attendees: Attendee[];
  isLoading: boolean;
  errorMessage: string | null;
  onDataUpdate: () => Promise<void>;
}

const AdminContent = ({ 
  attendees, 
  isLoading, 
  errorMessage, 
  onDataUpdate 
}: AdminContentProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = attendees.filter(
    (attendee) => {
      const fullName = `${attendee.first_name} ${attendee.last_name}`.toLowerCase();
      const search = searchTerm.toLowerCase();
      return attendee.email.toLowerCase().includes(search) ||
        fullName.includes(search);
    }
  );

  return (
    <>
      <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />

      <AttendeeContent
        isLoading={isLoading}
        filteredData={filteredData}
        searchTerm={searchTerm}
        errorMessage={errorMessage}
        onDataUpdate={onDataUpdate}
      />
    </>
  );
};

export default AdminContent;
