"use client";

/** Tombol hapus dengan konfirmasi. Dipakai di dalam <form action={serverAction}>. */
export default function ConfirmButton({ label = "Hapus", message = "Hapus data ini? Tindakan tidak bisa dibatalkan.", className }: { label?: string; message?: string; className?: string }) {
  return (
    <button type="submit" className={className ?? "btn-sm btn border border-red-200 text-red-700 hover:bg-red-50"}
      onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>
      {label}
    </button>
  );
}
