import React from "react";

export function Table({ className = "", children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-auto">
      <table className={`w-full caption-bottom text-start rtl:text-start text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className = "", children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={`border-b border-slate-100 [&_tr]:border-b ${className}`} {...props}>{children}</thead>;
}

export function TableBody({ className = "", children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props}>{children}</tbody>;
}

export function TableRow({ className = "", children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`border-b border-slate-100 transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-50 ${className}`} {...props}>{children}</tr>;
}

export function TableHead({ className = "", children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={`h-12 px-4 text-start rtl:text-start align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pe-0 ${className}`} {...props}>{children}</th>;
}

export function TableCell({ className = "", children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`p-4 align-middle [&:has([role=checkbox])]:pe-0 ${className}`} {...props}>{children}</td>;
}
