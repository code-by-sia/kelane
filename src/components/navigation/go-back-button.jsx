import { StepBackIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";

export default function GoBackButton({ onClick }) {
  const navigate = useNavigate();
  return (
    <Button onClick={() => navigate(-1)}>
      <StepBackIcon /> Back
    </Button>
  );
}
