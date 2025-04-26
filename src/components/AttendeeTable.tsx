
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Attendee } from "@/types/attendee";
import { Link } from "lucide-react";

interface AttendeeTableProps {
  data: Attendee[];
}

const AttendeeTable = ({ data }: AttendeeTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Waiver</TableHead>
            <TableHead>Vaccine Proof</TableHead>
            <TableHead>Submission Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((attendee) => (
            <TableRow key={attendee.email}>
              <TableCell>{attendee.email}</TableCell>
              <TableCell>{attendee.name}</TableCell>
              <TableCell>
                {attendee.waiverLink && (
                  <a 
                    href={attendee.waiverLink}
                    className="inline-flex items-center text-teal-600 hover:text-teal-700"
                  >
                    <Link className="w-4 h-4 mr-1" />
                    View
                  </a>
                )}
              </TableCell>
              <TableCell>
                {attendee.vaccineLink && (
                  <a 
                    href={attendee.vaccineLink}
                    className="inline-flex items-center text-teal-600 hover:text-teal-700"
                  >
                    <Link className="w-4 h-4 mr-1" />
                    View
                  </a>
                )}
              </TableCell>
              <TableCell>{attendee.submissionTime}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendeeTable;
