import { useParams } from "react-router-dom";

export default function PharmacyDetail() {
  const { regionId, cityId, pharmacyId } = useParams();

  return (
    <div>
      <div className="Container">Hi</div>
    </div>
  );
}