export default function About({ profile }) {
  if (!profile) return null;

  return (
    <section
      id="about"
      className="pt-10"
      data-aos="fade-right"
      data-aos-duration="1200"
    >
      <h2 className="text-4xl font-bold mb-6 text-center">About Me</h2>

      <div className="bg-white shadow-md rounded-xl p-8 max-w-3xl mx-auto">
        <div className="space-y-4 text-lg">

          <p>
            <strong className="font-semibold">Location:</strong>{" "}
            {profile.location}
          </p>

          <p>
            <strong className="font-semibold">Email:</strong>{" "}
            {profile.email}
          </p>

          <div className="flex gap-6 pt-4 text-blue-600 font-medium">
            <a
              href={profile.linkedin}
              target="_blank"
              className="hover:underline"
            >
              LinkedIn →
            </a>

            <a
              href={profile.github}
              target="_blank"
              className="hover:underline"
            >
              GitHub →
            </a>
          </div>

          {/* Resume button inside card */}
          {profile.resume && (
            <div className="pt-6 text-center">
              <a
                href={profile.resume}
                target="_blank"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
              >
                Download Resume →
              </a>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}

