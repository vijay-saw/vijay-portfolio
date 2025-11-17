// src/components/Footer.jsx
const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Vijay Saw. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

