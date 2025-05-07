
import { FileText } from "lucide-react";
import { Attendee } from "@/types/attendee";
import { Dog } from "@/types/dog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VaccineFileCellProps {
  attendee: Attendee;
  dogs: Dog[];
}

const VaccineFileCell = ({ attendee, dogs }: VaccineFileCellProps) => {
  const hasAttendeeVaccine = !!attendee.vaccine_file_url;
  const dogsWithVaccines = dogs.filter(dog => !!dog.vaccine_file_url);
  
  if (!hasAttendeeVaccine && dogsWithVaccines.length === 0) {
    return (
      <div className="text-gray-500 italic text-sm">No files uploaded</div>
    );
  }

  return (
    <div className="space-y-2">
      {hasAttendeeVaccine && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.open(attendee.vaccine_file_url!, '_blank')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Dog Vaccine
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View uploaded dog vaccine record</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {dogsWithVaccines.map((dog) => (
        <TooltipProvider key={dog.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.open(dog.vaccine_file_url!, '_blank')}
              >
                <FileText className="w-4 h-4 mr-2" />
                {dog.name}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View {dog.name}'s vaccine record</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default VaccineFileCell;
