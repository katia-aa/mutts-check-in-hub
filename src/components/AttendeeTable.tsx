
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Attendee } from "@/types/attendee";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface AttendeeTableProps {
  data: Attendee[];
  onDataUpdate: () => void;
}

const AttendeeTable = ({ data, onDataUpdate }: AttendeeTableProps) => {
  const getStatusIcon = (attendee: Attendee) => {
    const hasAllDocs = attendee.document_upload_status && attendee.vaccine_upload_status;
    
    if (hasAllDocs) {
      return <CheckCircle className="text-green-500 w-5 h-5" />;
    }
    return <AlertTriangle className="text-amber-500 w-5 h-5" />;
  };

  const getStatusText = (attendee: Attendee) => {
    if (attendee.document_upload_status && attendee.vaccine_upload_status) {
      return "All documents uploaded";
    }
    const missing = [];
    if (!attendee.document_upload_status) missing.push("waiver");
    if (!attendee.vaccine_upload_status) missing.push("vaccine record");
    return `Missing: ${missing.join(" & ")}`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((attendee) => (
            <TableRow key={attendee.id}>
              <TableCell>{attendee.email}</TableCell>
              <TableCell>{attendee.name || "-"}</TableCell>
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
