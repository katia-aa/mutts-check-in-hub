
import { useAttendeeSync } from "@/hooks/useAttendeeSync";
import { useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import ErrorDisplay from "@/components/admin/ErrorDisplay";
import AdminContent from "@/components/admin/AdminContent";

const AdminDashboard = () => {
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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <AdminHeader onSync={syncEventbriteAttendees} isLoading={isLoading} />

      <ErrorDisplay
        errorMessage={errorMessage}
        connectionError={connectionError}
        rlsError={rlsError}
      />

      <AdminContent 
        attendees={attendees}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onDataUpdate={fetchAttendees}
      />
    </div>
  );
};

export default AdminDashboard;
