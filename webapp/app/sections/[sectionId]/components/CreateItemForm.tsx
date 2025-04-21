"use client";

import { useState } from "react";

export default function CreateItemForm({ sectionId }: { sectionId: string }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    await fetch("/api/items", {
      method: "POST",
      body: JSON.stringify({ name, sectionId }),
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);
    setName("");
    // Ideally trigger a re-fetch or use router.refresh();
  };

  return (
    <div className="p-4 border rounded-xl bg-white shadow">
      <h2 className="font-semibold mb-2">Add Item</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border px-2 py-1 rounded w-full mb-2"
        placeholder="Item name"
      />
      <button
        onClick={handleCreate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-1 rounded"
      >
        {loading ? "Creating..." : "Create"}
      </button>
    </div>
  );
}
