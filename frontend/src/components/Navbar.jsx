export default function Navbar() {
  return (
    <nav className="p-4 shadow flex gap-4 bg-white sticky top-0 z-10">
      <a href="#home" className="font-semibold">Home</a>
      <a href="#about">About</a>
      <a href="#projects">Projects</a>
      <a href="#contact">Contact</a>
    </nav>
  );
}

