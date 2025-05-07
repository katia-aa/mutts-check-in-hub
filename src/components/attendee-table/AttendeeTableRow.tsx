import { Users, FileText, AlertTriangle } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Attendee } from "@/types/attendee";
import { Dog } from "@/types/dog";
import DogBadge from "./DogBadge";
import StatusIndicator from "./StatusIndicator";
import VaccineFileCell from "./VaccineFileCell";
import WaiverSignatureCell from "./WaiverSignatureCell";

interface AttendeeTableRowProps {
  attendee: Attendee;
  dogs: Dog[];
}

const AttendeeTableRow = ({ attendee, dogs }: AttendeeTableRowProps) => {
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
      <TableCell className="hidden md:table-cell">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span>{attendee.is_guest ? "Guest" : "Ticket Holder"}</span>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="text-sm text-gray-600">
          {attendee.event_id || "N/A"}
        </div>
      </TableCell>
      <TableCell>
        <StatusIndicator 
          hasVaccineRecord={!!attendee.vaccine_file_path} 
          hasWaiverSignature={!!attendee.signature_svg}
          dogCount={dogs.length}
        />
      </TableCell>
      <TableCell>
        <DogBadge count={dogs.length} />
      </TableCell>
      <TableCell>
        <VaccineFileCell 
          attendee={attendee} 
          dogs={dogs}
        />
      </TableCell>
      <TableCell>
        <WaiverSignatureCell signature={attendee.signature_svg} />
      </TableCell>
    </TableRow>
  );
};

export default AttendeeTableRow;
