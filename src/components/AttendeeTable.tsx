
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Attendee } from "@/types/attendee";
import { Dog } from "@/types/dog";
import {
  CheckCircle,
  AlertTriangle,
  Users,
  Dog as DogIcon,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AttendeeTableProps {
  data: Attendee[];
  onDataUpdate: () => void;
}

const AttendeeTable = ({ data, onDataUpdate }: AttendeeTableProps) => {
  const [dogsMap, setDogsMap] = useState<Record<string, Dog[]>>({});
  const [expandedAttendees, setExpandedAttendees] = useState<
    Record<string, boolean>
  >({});
  const [isLoadingDogs, setIsLoadingDogs] = useState(false);

  // Get unique event IDs from attendees
  const eventIds = [...new Set(data.map(attendee => attendee.event_id).filter(Boolean))];

  // Fetch dogs for all attendees
  useEffect(() => {
    const fetchDogs = async () => {
      setIsLoadingDogs(true);
      try {
        // Get all unique emails
        const emails = data.map((attendee) => attendee.email);

        if (emails.length === 0) {
          setDogsMap({});
          return;
        }

        // Get all event IDs present in the attendee data
        const eventIdFilters = eventIds.length > 0 
          ? eventIds.map(id => `event_id.eq.${id}`).join(',') 
          : null;

        let query = supabase
          .from("dogs")
          .select("*")
          .in("owner_email", emails);
          
        // Add event_id filter if available
        if (eventIdFilters) {
          query = query.or(eventIdFilters);
        }

        const { data: dogsData, error } = await query;

        if (error) {
          console.error("Error fetching dogs:", error);
          return;
        }

        // Group dogs by owner email
        const dogsByOwner: Record<string, Dog[]> = {};
        dogsData.forEach((dog: Dog) => {
          if (!dogsByOwner[dog.owner_email]) {
            dogsByOwner[dog.owner_email] = [];
          }
          dogsByOwner[dog.owner_email].push(dog);
        });

        setDogsMap(dogsByOwner);
      } catch (error) {
        console.error("Error fetching dogs:", error);
      } finally {
        setIsLoadingDogs(false);
      }
    };

    fetchDogs();
  }, [data, eventIds]);

  const getStatusIcon = (entity: Attendee | Dog) => {
    const hasAllDocs = entity.vaccine_file_path;

    if (hasAllDocs) {
      return <CheckCircle className="text-green-500 w-5 h-5" />;
    }
    return <AlertTriangle className="text-amber-500 w-5 h-5" />;
  };

  const getStatusText = (entity: Attendee | Dog) => {
    if (entity.vaccine_file_path) {
      return "Vaccine record uploaded";
    }
    return "Missing vaccine record";
  };

  const toggleExpand = (attendeeId: string) => {
    setExpandedAttendees((prev) => ({
      ...prev,
      [attendeeId]: !prev[attendeeId],
    }));
  };

  const hasDogs = (email: string) => {
    return dogsMap[email] && dogsMap[email].length > 0;
  };

  const getDogCount = (email: string) => {
    return dogsMap[email]?.length || 0;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name/Email</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Event ID</TableHead>
            <TableHead>Dogs</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((attendee) => (
            <>
              <TableRow key={attendee.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="font-medium">
                        {attendee.name || attendee.email}
                      </div>
                      {attendee.is_guest ? (
                        <div className="text-sm text-gray-500">
                          Guest of: {attendee.parent_ticket_email}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {attendee.email}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{attendee.is_guest ? "Guest" : "Ticket Holder"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">
                    {attendee.event_id || "N/A"}
                  </div>
                </TableCell>
                <TableCell>
                  {hasDogs(attendee.email) ? (
                    <div className="flex items-center gap-2">
                      <DogIcon className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">
                        {getDogCount(attendee.email)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(attendee)}
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">
                  {getStatusText(attendee)}
                </TableCell>
              </TableRow>
            </>
          ))}

          {isLoadingDogs && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <div className="mt-2 text-sm text-gray-500">
                  Loading pets...
                </div>
              </TableCell>
            </TableRow>
          )}

          {Object.keys(dogsMap).length === 0 &&
            !isLoadingDogs &&
            data.length > 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-4 text-gray-500"
                >
                  No pets registered for these attendees
                </TableCell>
              </TableRow>
            )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendeeTable;
