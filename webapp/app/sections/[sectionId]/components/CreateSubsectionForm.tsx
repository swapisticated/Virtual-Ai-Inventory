"use client";

import { useState } from "react";

export default function CreateSubsectionForm({ parentId }: { parentId: string }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    await fetch("/api/sections", {
      method: "POST",
      body: JSON.stringify({ name, parentId }),
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);
    setName("");
  };

  return (
    <div className="p-4 border rounded-xl bg-white shadow">
      <h2 className="font-semibold mb-2">Add Subsection</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border px-2 py-1 rounded w-full mb-2"
        placeholder="Subsection name"
      />
      <button
        onClick={handleCreate}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-1 rounded"
      >
        {loading ? "Creating..." : "Create"}
      </button>
    </div>
  );
}
