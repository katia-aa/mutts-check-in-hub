
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Attendee } from "@/types/attendee";
import { CheckCircle, AlertTriangle, Users } from "lucide-react";

interface AttendeeTableProps {
  data: Attendee[];
  onDataUpdate: () => void;
}

const AttendeeTable = ({ data, onDataUpdate }: AttendeeTableProps) => {
  const getStatusIcon = (attendee: Attendee) => {
    const hasAllDocs = attendee.signature_svg && attendee.vaccine_file_path;
    
    if (hasAllDocs) {
      return <CheckCircle className="text-green-500 w-5 h-5" />;
    }
    return <AlertTriangle className="text-amber-500 w-5 h-5" />;
  };

  const getStatusText = (attendee: Attendee) => {
    if (attendee.signature_svg && attendee.vaccine_file_path) {
      return "All documents uploaded";
    }
    const missing = [];
    if (!attendee.signature_svg) missing.push("signature");
    if (!attendee.vaccine_file_path) missing.push("vaccine record");
    return `Missing: ${missing.join(" & ")}`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name/Email</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((attendee) => (
            <TableRow key={attendee.id}>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {attendee.name || attendee.email}
                  </div>
                  {attendee.is_guest ? (
                    <div className="text-sm text-gray-500">
                      Guest of: {attendee.parent_ticket_email}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">{attendee.email}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>{attendee.is_guest ? "Guest" : "Ticket Holder"}</span>
                </div>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendeeTable;
