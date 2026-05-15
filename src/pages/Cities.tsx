import { useNavigate, useParams } from "react-router-dom";

export default function Cities() {
  const { regionId } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <div className="Container">Hi</div>
    </div>
  );
}