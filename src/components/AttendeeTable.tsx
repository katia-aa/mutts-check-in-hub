
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Attendee, GroupedAttendee } from "@/types/attendee";
import { CheckCircle, AlertTriangle, User, Dog, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AttendeeTableProps {
  data: Attendee[];
  onDataUpdate: () => void;
}

const AttendeeTable = ({ data, onDataUpdate }: AttendeeTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Group dogs with their owners
  const groupAttendees = (attendees: Attendee[]): GroupedAttendee[] => {
    const humanAttendees = attendees.filter(attendee => !attendee.is_dog);
    
    return humanAttendees.map(human => {
      const associatedDogs = attendees.filter(dog => 
        dog.is_dog && dog.owner_id === human.guest_id
      );
      
      return {
        ...human,
        dogs: associatedDogs
      };
    });
  };
  
  const groupedData = groupAttendees(data);
  
  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getStatusIcon = (attendee: Attendee) => {
    const hasAllDocs = attendee.signature_svg && attendee.vaccine_file_path;
    
    if (hasAllDocs) {
      return <CheckCircle className="text-green-500 w-5 h-5" />;
    }
    return <AlertTriangle className="text-amber-500 w-5 h-5" />;
  };

  const getStatusText = (attendee: Attendee) => {
    if (attendee.signature_svg && attendee.vaccine_file_path) {
      return "All documents uploaded";
    }
    const missing = [];
    if (!attendee.signature_svg) missing.push("signature");
    if (!attendee.vaccine_file_path) missing.push("vaccine record");
    return `Missing: ${missing.join(" & ")}`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Name/Email</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedData.map((attendee) => (
            <>
              <TableRow 
                key={attendee.id}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() => attendee.dogs && attendee.dogs.length > 0 && toggleRow(attendee.id)}
              >
                <TableCell>
                  {attendee.dogs && attendee.dogs.length > 0 ? (
                    <button className="p-1 rounded-full hover:bg-gray-200">
                      {expandedRows[attendee.id] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  ) : null}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="text-blue-500 w-5 h-5" />
                    <div>
                      <div className="font-medium">
                        {attendee.name || attendee.email}
                      </div>
                      {attendee.is_guest ? (
                        <div className="text-sm text-gray-500">
                          Guest of: {attendee.parent_ticket_email}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">{attendee.email}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span>{attendee.is_guest ? "Guest" : "Ticket Holder"}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(attendee)}
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">
                  {getStatusText(attendee)}
                </TableCell>
              </TableRow>
              
              {/* Dog rows - shown when parent row is expanded */}
              {attendee.dogs && attendee.dogs.length > 0 && expandedRows[attendee.id] && (
                attendee.dogs.map(dog => (
                  <TableRow key={dog.id} className="bg-gray-50">
                    <TableCell></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 ml-6">
                        <Dog className="text-amber-500 w-5 h-5" />
                        <div>
                          <div className="font-medium">{dog.name}</div>
                          <div className="text-xs text-gray-500">Dog</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-amber-600 font-medium">Dog</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {dog.vaccine_file_path ? (
                          <CheckCircle className="text-green-500 w-5 h-5" />
                        ) : (
                          <AlertTriangle className="text-amber-500 w-5 h-5" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {dog.vaccine_file_path ? "Vaccine uploaded" : "Missing vaccine record"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendeeTable;
