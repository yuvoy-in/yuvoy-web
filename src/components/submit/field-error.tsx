/** Announced as it appears, and named by its field's `aria-describedby`. */
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-terra-deep text-sm">
      {message}
    </p>
  );
}
