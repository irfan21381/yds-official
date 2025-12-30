 import { useState } from "react";
import { Plus, FileText, Image, HelpCircle } from "lucide-react";
import AddContentModal from "@/components/superadmin/AddContentModal";
import ModuleCard from "@/components/superadmin/ModuleCard";
import QuizBuilder from "@/components/superadmin/QuizBuilder";


type ContentType = "text" | "diagram" | "quiz";

interface Content {
  id: string;
  type: ContentType;
  title: string;
}

interface Module {
  id: string;
  title: string;
  contents: Content[];
}

export default function CourseContent() {
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleTitle, setModuleTitle] = useState("");

  const addModule = () => {
    if (!moduleTitle) return;
    setModules([
      ...modules,
      { id: Date.now().toString(), title: moduleTitle, contents: [] },
    ]);
    setModuleTitle("");
  };

  const addContent = (moduleId: string, type: ContentType) => {
    setModules(
      modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              contents: [
                ...m.contents,
                {
                  id: Date.now().toString(),
                  type,
                  title: `${type.toUpperCase()} Content`,
                },
              ],
            }
          : m
      )
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Course Content</h1>

      {/* Add Module */}
      <div className="flex gap-3">
        <input
          value={moduleTitle}
          onChange={(e) => setModuleTitle(e.target.value)}
          placeholder="Module title"
          className="border px-4 py-2 rounded-lg w-80"
        />
        <button
          onClick={addModule}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={16} /> Add Module
        </button>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        {modules.map((module) => (
          <div key={module.id} className="bg-white border rounded-xl p-4">
            <h2 className="font-semibold text-lg mb-3">{module.title}</h2>

            {/* Add content buttons */}
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => addContent(module.id, "text")}
                className="flex items-center gap-1 text-sm border px-3 py-1 rounded"
              >
                <FileText size={14} /> Text
              </button>
              <button
                onClick={() => addContent(module.id, "diagram")}
                className="flex items-center gap-1 text-sm border px-3 py-1 rounded"
              >
                <Image size={14} /> Diagram
              </button>
              <button
                onClick={() => addContent(module.id, "quiz")}
                className="flex items-center gap-1 text-sm border px-3 py-1 rounded"
              >
                <HelpCircle size={14} /> Quiz
              </button>
            </div>

            {/* Contents */}
            <ul className="space-y-2">
              {module.contents.map((c) => (
                <li
                  key={c.id}
                  className="flex justify-between items-center border rounded-lg px-3 py-2 text-sm"
                >
                  <span>{c.title}</span>
                  <span className="text-gray-500">{c.type}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}