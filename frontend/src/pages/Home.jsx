export default function Home({ profile }) {
  if (!profile) return null;

  return (
    <section
      id="home"
      className="pt-10 pb-20 flex flex-col items-center text-center"
      data-aos="fade-up"
      data-aos-duration="1200"
    >
      {/* PROFILE PHOTO */}
      {profile.photo ? (
        <img
          src={profile.photo}   // Django returns full absolute URL
          alt="Profile"
          data-aos="zoom-in"
          data-aos-duration="1200"
          className="
            w-44 h-44
            rounded-full
            object-cover
            shadow-2xl
            border-4
            border-white
            mb-8
          "
        />
      ) : (
        <div
          className="
            w-44 h-44
            rounded-full
            bg-gray-200
            shadow-xl
            flex items-center justify-center
            text-gray-600 text-lg
            mb-8
          "
          data-aos="zoom-in"
          data-aos-duration="1200"
        >
          No Photo
        </div>
      )}

      {/* NAME */}
      <h1
        className="text-6xl font-extrabold mb-4 capitalize"
        data-aos="fade-up"
        data-aos-duration="1200"
        data-aos-delay="200"
      >
        {profile.name}
      </h1>

      {/* ROLE */}
      <p
        className="text-2xl text-gray-700 mb-4"
        data-aos="fade-up"
        data-aos-duration="1200"
        data-aos-delay="400"
      >
        {profile.role}
      </p>

      {/* SUMMARY */}
      <p
        className="text-lg text-gray-500 max-w-3xl px-6"
        data-aos="fade-up"
        data-aos-duration="1200"
        data-aos-delay="600"
      >
        {profile.summary}
      </p>
    </section>
  );
}

