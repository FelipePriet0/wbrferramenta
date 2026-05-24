// Section wrapper used inside the expanded ficha layout. `red` + `noBorder`
// match the "Parecer" card style at the bottom of the page (red underlined
// title, no enclosing card border).
export function AdobeCard({
  title,
  children,
  noBorder,
  red,
}: {
  title?: string;
  children: React.ReactNode;
  noBorder?: boolean;
  red?: boolean;
}) {
  return (
    <div className="mb-3">
      {title && (
        <div className={noBorder ? 'pb-[3px] mb-2' : 'pf-card-header'}>
          <span
            className={
              red
                ? 'font-bold uppercase tracking-[0.06em] underline'
                : 'text-[9px] font-bold uppercase tracking-widest text-zinc-700'
            }
            style={red ? { fontSize: '12px', color: '#dc2626' } : undefined}
          >
            {title}
          </span>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
