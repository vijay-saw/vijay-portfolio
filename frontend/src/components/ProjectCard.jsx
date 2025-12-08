export default function ProjectCard({ project }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 border hover:shadow-xl transition">
      <h3 className="text-xl font-semibold mb-2">{project.title}</h3>

      <p className="text-gray-600 mb-4">{project.description}</p>

      <p className="text-sm text-gray-500 mb-4">
        <strong>Tech:</strong> {project.tech_stack}
      </p>

      <div className="flex gap-4 text-blue-600 text-sm font-medium">
        {project.github_url && (
          <a href={project.github_url} target="_blank" className="hover:underline">
            GitHub →
          </a>
        )}

        {project.demo_url && (
          <a href={project.demo_url} target="_blank" className="hover:underline">
            Live Demo →
          </a>
        )}
      </div>
    </div>
  );
}

