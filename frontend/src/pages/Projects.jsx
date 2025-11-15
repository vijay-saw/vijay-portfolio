import ProjectCard from "../components/ProjectCard";

export default function Projects({ projects }) {
  return (
    <section id="projects" className="pt-20" data-aos="fade-right" data-aos-duration="1200">
      <h2 className="text-4xl font-bold mb-10 text-center">Projects</h2>

      {projects.length === 0 ? (
        <p className="text-center text-gray-500">No projects added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}

