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
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Name/Email</TableHead>
            <TableHead className="min-w-[100px]">Has Dog</TableHead>
            <TableHead className="min-w-[150px]">Vaccinations</TableHead>
            <TableHead className="min-w-[150px]">Waiver Signature</TableHead>
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
