export function Field({ label, name, value, onChange, type = "text", options, error }) {
  const id = name || label.toLowerCase().replaceAll(" ", "-");
  return (
    <label className={`field${error ? " field-invalid" : ""}`} htmlFor={id}>
      <span>{label}</span>
      {options ? (
        <select id={id} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={!!error}>
          <option value="">Select...</option>
          {options.map((option) => {
            if (typeof option === "string") {
              return <option key={option} value={option}>{option}</option>;
            }
            return <option key={option.value} value={option.value}>{option.label}</option>;
          })}
        </select>
      ) : (
        <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={!!error} />
      )}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
