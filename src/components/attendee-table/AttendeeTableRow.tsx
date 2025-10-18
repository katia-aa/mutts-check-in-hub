import { Check, X } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Attendee } from "@/types/attendee";
import WaiverSignatureCell from "./WaiverSignatureCell";

interface AttendeeTableRowProps {
  attendee: Attendee;
}

const AttendeeTableRow = ({ attendee }: AttendeeTableRowProps) => {
  const fullName = `${attendee.first_name} ${attendee.last_name}`.trim();

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <div className="flex items-center gap-2">
          <div>
            <div className="font-medium">
              {fullName || attendee.email}
            </div>
            <div className="text-sm text-gray-500">
              {attendee.email}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex items-center gap-2">
          {attendee.has_dog ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Yes</span>
            </>
          ) : (
            <>
              <X className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">No</span>
            </>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {attendee.has_dog ? (
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              {attendee.da2pp_vaccine ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <X className="w-3 h-3 text-red-600" />
              )}
              <span className={attendee.da2pp_vaccine ? "text-green-600" : "text-red-600"}>
                DA2PP
              </span>
            </div>
            <div className="flex items-center gap-2">
              {attendee.rabies_vaccine ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <X className="w-3 h-3 text-red-600" />
              )}
              <span className={attendee.rabies_vaccine ? "text-green-600" : "text-red-600"}>
                Rabies
              </span>
            </div>
            <div className="flex items-center gap-2">
              {attendee.bordetella_vaccine ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <X className="w-3 h-3 text-red-600" />
              )}
              <span className={attendee.bordetella_vaccine ? "text-green-600" : "text-red-600"}>
                Bordetella
              </span>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        )}
      </TableCell>
      <TableCell>
        <WaiverSignatureCell signature={attendee.signature_svg} />
      </TableCell>
    </TableRow>
  );
};

export default AttendeeTableRow;
