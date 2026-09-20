// Progumi/frontend/components/common/InputField.tsx
type Props = {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
};

export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
}: Props) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-2 rounded-2xl border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
          error ? "border-red-400" : "border-pink-100"
        }`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
