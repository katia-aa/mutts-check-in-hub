
import { TableCell, TableRow } from "@/components/ui/table";

const LoadingDogs = () => {
  return (
    <TableRow>
      <TableCell colSpan={6} className="text-center py-4">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <div className="mt-2 text-sm text-gray-500">
          Loading data...
        </div>
      </TableCell>
    </TableRow>
  );
};

export default LoadingDogs;
