import { Save } from "lucide-react";

export default function CourseForm({
  form,
  onChange,
  onSubmit,
}: {
  form: any;
  onChange: (e: any) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="bg-white border rounded-xl p-6 space-y-5"
    >
      <input
        name="title"
        value={form.title}
        onChange={onChange}
        placeholder="Course title"
        className="border px-4 py-2 rounded w-full"
      />

      <textarea
        name="description"
        value={form.description}
        onChange={onChange}
        placeholder="Course description"
        className="border px-4 py-2 rounded w-full"
      />

      <div className="grid grid-cols-2 gap-4">
        <input
          name="category"
          value={form.category}
          onChange={onChange}
          placeholder="Category"
          className="border px-4 py-2 rounded"
        />

        <select
          name="level"
          value={form.level}
          onChange={onChange}
          className="border px-4 py-2 rounded"
        >
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </div>

      <select
        name="status"
        value={form.status}
        onChange={onChange}
        className="border px-4 py-2 rounded w-full"
      >
        <option>Draft</option>
        <option>Published</option>
      </select>

      <button className="bg-blue-600 text-white px-5 py-2 rounded-lg flex gap-2">
        <Save size={16} /> Save
      </button>
    </form>
  );
} 