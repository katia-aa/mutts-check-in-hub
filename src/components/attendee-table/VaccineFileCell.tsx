
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
  const attendeeFiles = attendee.vaccine_file_urls || [];
  if (attendee.vaccine_file_url && !attendeeFiles.includes(attendee.vaccine_file_url)) {
    attendeeFiles.push(attendee.vaccine_file_url);
  }
  
  // Process dogs with vaccines
  const dogsWithVaccines = dogs.filter(dog => {
    // Check if dog has any vaccine files
    const hasFiles = (dog.vaccine_file_urls && dog.vaccine_file_urls.length > 0) || !!dog.vaccine_file_url;
    return hasFiles;
  });
  
  if (attendeeFiles.length === 0 && dogsWithVaccines.length === 0) {
    return (
      <div className="text-gray-500 italic text-sm">No files uploaded</div>
    );
  }

  return (
    <div className="space-y-2">
      {attendeeFiles.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">Human Records:</p>
          {attendeeFiles.map((fileUrl, index) => (
            <TooltipProvider key={`attendee-${index}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(fileUrl, '_blank')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {attendee.name || 'Owner'} Record {attendeeFiles.length > 1 ? `#${index + 1}` : ''}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View uploaded human vaccine record</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}

      {dogsWithVaccines.map((dog) => {
        const dogFiles = dog.vaccine_file_urls || [];
        if (dog.vaccine_file_url && !dogFiles.includes(dog.vaccine_file_url)) {
          dogFiles.push(dog.vaccine_file_url);
        }
        
        return (
          <div key={dog.id} className="space-y-1">
            {dogsWithVaccines.length > 1 && <p className="text-xs font-medium text-gray-500">{dog.name}'s Records:</p>}
            {dogFiles.map((fileUrl, index) => (
              <TooltipProvider key={`dog-${dog.id}-${index}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(fileUrl, '_blank')}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {dog.name} {dogFiles.length > 1 ? `#${index + 1}` : ''}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View {dog.name}'s vaccine record {dogFiles.length > 1 ? `#${index + 1}` : ''}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default VaccineFileCell;
