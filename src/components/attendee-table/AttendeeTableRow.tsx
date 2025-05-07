
import { Users } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Attendee } from "@/types/attendee";
import DogBadge from "./DogBadge";
import StatusIndicator from "./StatusIndicator";

interface AttendeeTableRowProps {
  attendee: Attendee;
  dogCount: number;
}

const AttendeeTableRow = ({ attendee, dogCount }: AttendeeTableRowProps) => {
  return (
    <TableRow className="hover:bg-gray-50">
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
        <DogBadge count={dogCount} />
      </TableCell>
      <TableCell>
        <StatusIndicator hasVaccineRecord={!!attendee.vaccine_file_path} />
      </TableCell>
    </TableRow>
  );
};

export default AttendeeTableRow;
