import { type LucideIcon } from "lucide-react";

type ActionButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

export const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  disabled = false,
}: ActionButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="clearit-secondary-btn h-11 justify-center disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon size={16} />
      {label}
    </button>
  );
};
