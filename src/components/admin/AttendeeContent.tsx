import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";
import AttendeeTable from "@/components/AttendeeTable";
import { Attendee } from "@/types/attendee";

interface AttendeeContentProps {
  isLoading: boolean;
  filteredData: Attendee[];
  searchTerm: string;
  errorMessage: string | null;
  onDataUpdate: () => Promise<void>;
}

const AttendeeContent = ({
  isLoading,
  filteredData,
  searchTerm,
  errorMessage,
  onDataUpdate,
}: AttendeeContentProps) => {
  return (
    <>
      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          {filteredData.length > 0 ? (
            <AttendeeTable data={filteredData} />
          ) : (
            <EmptyState searchTerm={searchTerm} errorMessage={errorMessage} />
          )}
        </>
      )}
    </>
  );
};

export default AttendeeContent;
