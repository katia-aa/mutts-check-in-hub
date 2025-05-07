
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
  onDataUpdate: () => void;
}

const AttendeeTable = ({ data, onDataUpdate }: AttendeeTableProps) => {
  const { dogsMap, isLoadingDogs } = useDogsFetcher(data);

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
            <AttendeeTableRow
              key={attendee.id}
              attendee={attendee}
              dogCount={getDogCount(attendee.email)}
            />
          ))}

          {isLoadingDogs && <LoadingDogs />}

          {Object.keys(dogsMap).length === 0 &&
            !isLoadingDogs &&
            data.length > 0 && <NoDogs />}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendeeTable;
