
import { useSearchParams } from "react-router-dom";
import CheckInLayout from "@/components/CheckInLayout";
import DogVaccineUpload from "@/components/DogVaccineUpload";

const DogVaccineUploadPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  return (
    <CheckInLayout
      step={3}
      title="Dog Vaccine Records"
      subtitle="Add your dogs and upload their vaccine records"
    >
      <DogVaccineUpload email={email} />
    </CheckInLayout>
  );
};

export default DogVaccineUploadPage;
