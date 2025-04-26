
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import AttendeeTable from "@/components/AttendeeTable";
import { Attendee } from "@/types/attendee";

const DUMMY_DATA: Attendee[] = [
  {
    email: "barkylover@gmail.com",
    name: "Alex Barker",
    waiverLink: "#",
    vaccineLink: "#",
    submissionTime: "2025-04-26 10:30 AM",
  },
  {
    email: "floofqueen@yahoo.com",
    name: "Sam Floof",
    waiverLink: "#",
    vaccineLink: "#",
    submissionTime: "2025-04-26 11:15 AM",
  },
  {
    email: "pupperfan@hotmail.com",
    name: "Jordan Puppers",
    waiverLink: "#",
    vaccineLink: "#",
    submissionTime: "2025-04-26 12:00 PM",
  },
  {
    email: "waggytails@outlook.com",
    name: "Casey Wags",
    waiverLink: "#",
    vaccineLink: "#",
    submissionTime: "2025-04-26 1:45 PM",
  },
  {
    email: "dogmomlife@gmail.com",
    name: "Jamie Bones",
    waiverLink: "#",
    vaccineLink: "#",
    submissionTime: "2025-04-26 2:30 PM",
  },
];

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredData = DUMMY_DATA.filter(
    attendee =>
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Check-In Dashboard</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full max-w-md"
          />
        </div>

        <AttendeeTable data={filteredData} />
      </div>
    </div>
  );
};

export default Admin;
