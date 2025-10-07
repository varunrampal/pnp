// src/components/Accordion.jsx
export function Accordion({ children }) {
  return <div className="divide-y rounded-xl border">{children}</div>;
}

export function AccordionItem({ question, children, defaultOpen = false }) {
  return (
    <details className="group p-4 open:bg-gray-50 open:rounded-xl" {...(defaultOpen ? { open: true } : {})}>
      <summary className="cursor-pointer list-none text-base sm:text-lg font-semibold outline-none">
        {question}
      </summary>
      <div className="mt-3 text-gray-700 leading-relaxed">
        {children}
      </div>
    </details>
  );
}
