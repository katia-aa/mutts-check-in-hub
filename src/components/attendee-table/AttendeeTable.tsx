import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Attendee } from "@/types/attendee";
import AttendeeTableRow from "./AttendeeTableRow";
import LoadingDogs from "./LoadingDogs";
import NoDogs from "./NoDogs";
import { useDogsFetcher } from "./useDogsFetcher";

interface AttendeeTableProps {
  data: Attendee[];
}

const AttendeeTable = ({ data }: AttendeeTableProps) => {
  const { dogsMap, isLoadingDogs } = useDogsFetcher(data);

  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name/Email</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead className="hidden md:table-cell">Event ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dogs</TableHead>
            <TableHead>Vaccine Files</TableHead>
            <TableHead>Waiver Signature</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoadingDogs ? (
            <LoadingDogs />
          ) : (
            data.map((attendee) => (
              <AttendeeTableRow
                key={attendee.id}
                attendee={attendee}
                dogs={dogsMap[attendee.email] || []}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendeeTable;
