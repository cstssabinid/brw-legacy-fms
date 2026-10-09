"use client";

type ConfirmDeleteFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  itemId: string;
  itemLabel: string;
};

export function ConfirmDeleteForm({ action, itemId, itemLabel }: ConfirmDeleteFormProps) {
  function confirmDelete(event: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete ${itemLabel}? This cannot be undone.`)) event.preventDefault();
  }

  return (
    <form action={action} onSubmit={confirmDelete}>
      <input type="hidden" name="id" value={itemId} />
      <button className="btn w-full border border-red-500/40 text-red-400 hover:bg-red-500/10" type="submit" aria-label={`Delete ${itemLabel}`}>
        Delete
      </button>
    </form>
  );
}
