
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
    <div className="space-y-4">
      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          {filteredData.length > 0 ? (
            <div>
              <div className="mb-4 text-sm text-gray-500">
                Showing {filteredData.length} attendee{filteredData.length !== 1 ? 's' : ''}
              </div>
              <AttendeeTable data={filteredData} onDataUpdate={onDataUpdate} />
            </div>
          ) : (
            <EmptyState searchTerm={searchTerm} errorMessage={errorMessage} />
          )}
        </>
      )}
    </div>
  );
};

export default AttendeeContent;
