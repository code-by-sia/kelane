import { Step } from "./step-item";
import "./steps.css";

export { Step } from "./step-item";

export default function Steps({ steps, value, onChange }) {
  return (
    <div className="steps">
      {steps.map((step, index) => (
        <Step
          key={index}
          title={step.title}
          subtitle={step.subtitle}
          icon={step.icon}
          completed={index <= value}
          onClick={() => onChange(index)}
        />
      ))}
    </div>
  );
}
