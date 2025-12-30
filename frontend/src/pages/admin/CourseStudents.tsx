 export default function CourseStudents() {
  const students = [
    { name: "Akhil", email: "akhil@gmail.com", progress: "60%" },
    { name: "Ravi", email: "ravi@gmail.com", progress: "90%" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Enrolled Students</h1>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Progress</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={i} className="border-t">
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.email}</td>
                <td className="p-3">{s.progress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}