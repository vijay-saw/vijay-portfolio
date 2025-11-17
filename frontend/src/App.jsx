import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import { getProfile, getProjects } from "./api";



function App() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getProfile().then((res) => setProfile(res.data)).catch(console.error);
    getProjects().then((res) => setProjects(res.data)).catch(console.error);
  }, []);

return (
  <div className="bg-gray-100 min-h-screen">
    <Navbar />

    <main className="max-w-4xl mx-auto px-6 py-12 space-y-24">
      <Home profile={profile} />
      <About profile={profile} />
      <Projects projects={projects} />
      <Contact />
    </main>
  </div>
);


}

export default App;

