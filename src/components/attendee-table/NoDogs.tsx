
import { TableCell, TableRow } from "@/components/ui/table";

const NoDogs = () => {
  return (
    <TableRow>
      <TableCell
        colSpan={6}
        className="text-center py-4 text-gray-500"
      >
        No pets registered for these attendees
      </TableCell>
    </TableRow>
  );
};

export default NoDogs;
