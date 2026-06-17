type PasteTextBoxProps = {
  value: string;
  onChange: (value: string) => void;
};

export const PasteTextBox = ({ value, onChange }: PasteTextBoxProps) => {
  return (
    <section className="clearit-card">
      <h2 className="text-base font-semibold text-slate-900">Paste text instead</h2>
      <p className="mt-1 text-sm text-slate-600">
        Paste the confusing message, letter, bill, or error here…
      </p>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste the confusing message, letter, bill, or error here…"
        className="mt-4 min-h-40 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none ring-indigo-500 transition focus:ring-2"
      />
    </section>
  );
};
