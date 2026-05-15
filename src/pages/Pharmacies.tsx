import { useNavigate, useParams } from "react-router-dom";

export default function Pharmacies() {
  const { regionId, cityId } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <div className="Container">Hi</div>
    </div>
  );
}