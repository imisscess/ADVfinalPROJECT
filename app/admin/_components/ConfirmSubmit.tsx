"use client";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  message: string;
  label: string;
  className: string;
  fields?: Record<string, string>;
};

export function ConfirmSubmit({ action, message, label, className, fields }: Props) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {Object.entries(fields ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
