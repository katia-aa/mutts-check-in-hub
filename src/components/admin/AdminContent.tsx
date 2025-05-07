
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
    (attendee) =>
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (attendee.name &&
        attendee.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
