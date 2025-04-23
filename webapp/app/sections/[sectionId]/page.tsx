// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";

// export default function SectionDetailPage() {
//     const { sectionId } = useParams();
//     const [items, setItems] = useState([]);
//     const [subsections, setSubsections] = useState([]);
//     const [name, setName] = useState("");
//     const [description, setDescription] = useState("");
//     const [type, setType] = useState("item"); // or 'subsection'

//     useEffect(() => {
//         fetch(`/api/sections/${sectionId}`)
//             .then(res => res.json())
//             .then(data => {
//                 setItems(data.items);
//                 setSubsections(data.subsections);
//             });
//     }, [sectionId]);

//     const handleSubmit = async () => {
//         const res = await fetch(`/api/sections/${sectionId}`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ type, name, description }),
//         });

//         const data = await res.json();
//         alert(`${type} created: ${JSON.stringify(data)}`);
//     };

//     return (
//         <div className="p-4">
//             <h1 className="text-2xl font-bold">Section Details</h1>
//             <h2 className="mt-4 text-xl">Subsections</h2>
//             <ul className="mb-4">
//                 {subsections.map((s: unknown) => (
//                     <li key={s.id}>{s.name}</li>
//                 ))}
//             </ul>

//             <h2 className="text-xl">Items</h2>
//             <ul className="mb-4">
//                 {items.map((i: unknown) => (
//                     <li key={i.id}>{i.name}</li>
//                 ))}
//             </ul>

//             <div className="mt-6">
//                 <h2 className="text-lg font-semibold">Add Item / Subsection</h2>
//                 <select onChange={e => setType(e.target.value)} className="border p-2 my-2">
//                     <option value="item">Item</option>
//                     <option value="subsection">Subsection</option>
//                 </select>
//                 <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="border p-2 block my-2" />
//                 <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="border p-2 block my-2" />
//                 <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">
//                     Add {type}
//                 </button>
//             </div>
//         </div>
//     );
// }
export default function Placeholder() {
    return <div>Coming soon...</div>;
  }