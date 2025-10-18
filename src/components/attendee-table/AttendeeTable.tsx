import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Attendee } from "@/types/attendee";
import AttendeeTableRow from "./AttendeeTableRow";

interface AttendeeTableProps {
  data: Attendee[];
}

const AttendeeTable = ({ data }: AttendeeTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name/Email</TableHead>
            <TableHead className="hidden md:table-cell">Has Dog</TableHead>
            <TableHead className="hidden md:table-cell">Vaccinations</TableHead>
            <TableHead>Waiver Signature</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((attendee) => (
            <AttendeeTableRow
              key={attendee.id}
              attendee={attendee}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendeeTable;
