
interface EmptyStateProps {
  searchTerm: string;
  errorMessage: string | null;
}

const EmptyState = ({ searchTerm, errorMessage }: EmptyStateProps) => {
  return (
    <div className="text-center py-8 text-gray-500">
      {searchTerm ? "No matching attendees found" : "No attendees found"}
      {errorMessage && (
        <div className="mt-4">
          <p className="mb-2">Please check your connection and API configuration.</p>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
