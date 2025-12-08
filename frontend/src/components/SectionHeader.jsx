// src/components/SectionHeader.jsx
const SectionHeader = ({ eyebrow, title, subtitle }) => {
  return (
    <div className="mb-8 text-center">
      {eyebrow && (
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-sm text-slate-300 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;

