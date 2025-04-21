export default function SectionInfo({ section }: { section: any }) {
    return (
      <div className="p-4 border rounded-xl bg-white shadow">
        <h1 className="text-2xl font-bold">{section.name}</h1>
        <p className="text-gray-600">{section.description || "No description provided."}</p>
      </div>
    );
  }
  