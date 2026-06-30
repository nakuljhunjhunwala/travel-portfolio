import type { Trip, Day, Accommodation } from "@/types";

interface TripEssentialsProps {
  trip: Trip;
  days: Day[];
}

function inr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

/* ── Derive the stay list from the day data (single source of truth) ── */
interface StayRow {
  acc: Accommodation;
  city: string;
  nights: number;
}

function deriveStays(days: Day[]): StayRow[] {
  const map = new Map<string, StayRow>();
  for (const d of days) {
    if (!d.accommodation) continue;
    const existing = map.get(d.accommodation.name);
    if (existing) existing.nights += 1;
    else map.set(d.accommodation.name, { acc: d.accommodation, city: d.city, nights: 1 });
  }
  return Array.from(map.values());
}

/* ── Icons ── */
function TrainIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="14" rx="2" /><path d="M4 10h16" /><path d="M9 21l-2-4" /><path d="M15 21l2-4" /><circle cx="9" cy="13.5" r="1" /><circle cx="15" cy="13.5" r="1" />
    </svg>
  );
}
function BedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4v16" /><path d="M22 8H2" /><path d="M22 20V8l-10-4" /><path d="M6 8v4" /><path d="M2 12h4" />
    </svg>
  );
}
function RupeeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}
function BulbIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 00-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0012 2z" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 11a19.79 19.79 0 01-3.07-8.67A2 2 0 012.86 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
    </svg>
  );
}

/* ── Section shell ── */
function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 md:px-6 py-5">
      <div className="flex items-center gap-2.5 mb-3.5">
        <span className="w-7 h-7 rounded-lg bg-primary-soft text-primary-text flex items-center justify-center flex-shrink-0">
          {icon}
        </span>
        <h3 className="font-heading font-semibold text-heading text-sm md:text-base">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function TripEssentials({ trip, days }: TripEssentialsProps) {
  const stays = deriveStays(days);
  const t = trip.transport;
  const cost = trip.costBreakdown;
  const tips = trip.tips ?? [];

  if (!t && stays.length === 0 && !cost && tips.length === 0) return null;

  const maxItem = cost?.items?.reduce((m, i) => Math.max(m, i.amount), 0) ?? 0;

  return (
    <div className="bg-card rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_6px_16px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Header */}
      <div className="px-5 md:px-6 pt-5 md:pt-6 pb-1">
        <h2 className="font-heading font-bold text-heading text-base md:text-lg">Trip Essentials</h2>
        <p className="text-[11px] md:text-xs text-muted mt-0.5">
          Everything you need to plan this one yourself — transport, stays, real costs and hard-won tips.
        </p>
      </div>

      {/* Getting around */}
      {t && (
        <>
          <div className="border-t border-border/60 mt-3" />
          <Section icon={<TrainIcon />} title="Getting around">
            {t.summary && (
              <p className="font-body text-sm text-body leading-relaxed mb-3">{t.summary}</p>
            )}
            <div className="space-y-1.5">
              {t.trainIn && (
                <p className="font-body text-[13px] md:text-sm text-body">
                  <span className="text-muted">Train in · </span>
                  {t.trainIn}
                </p>
              )}
              {t.trainOut && (
                <p className="font-body text-[13px] md:text-sm text-body">
                  <span className="text-muted">Train out · </span>
                  {t.trainOut}
                </p>
              )}
            </div>

            {/* Cab card */}
            {(t.cabVehicle || t.cabDriverName) && (
              <div className="mt-3 rounded-xl bg-[var(--color-travel-row)] p-3.5 md:p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    {t.cabVehicle && (
                      <p className="font-heading font-semibold text-heading text-sm">{t.cabVehicle}</p>
                    )}
                    {t.cabDriverName && (
                      <p className="text-[13px] text-body mt-0.5">
                        Driver: {t.cabDriverName}
                        {t.cabDriverPhone && (
                          <>
                            {" · "}
                            <a
                              href={`tel:${t.cabDriverPhone}`}
                              className="inline-flex items-center gap-1 text-link hover:underline font-mono"
                            >
                              <PhoneIcon />
                              {t.cabDriverPhone}
                            </a>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                  {t.cabPackage && (
                    <span className="font-mono text-xs md:text-sm text-primary-text bg-primary-soft rounded-lg px-2.5 py-1 font-medium whitespace-nowrap">
                      {t.cabPackage}
                    </span>
                  )}
                </div>
                {(t.cabInclusions || t.cabTerms) && (
                  <div className="mt-2 pt-2 border-t border-black/[0.06] space-y-1">
                    {t.cabInclusions && (
                      <p className="text-[11px] md:text-xs text-muted">
                        <span className="text-body">Includes:</span> {t.cabInclusions}
                      </p>
                    )}
                    {t.cabTerms && (
                      <p className="text-[11px] md:text-xs text-muted">{t.cabTerms}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </Section>
        </>
      )}

      {/* Where we stayed */}
      {stays.length > 0 && (
        <>
          <div className="border-t border-border/60" />
          <Section icon={<BedIcon />} title={`Where we stayed · ${stays.length} stays`}>
            <div className="divide-y divide-border/60">
              {stays.map((s) => (
                <div key={s.acc.name} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-heading font-semibold text-heading text-[13px] md:text-sm leading-snug">
                      {s.acc.googleMapsUrl ? (
                        <a
                          href={s.acc.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:underline decoration-primary/30 underline-offset-2"
                        >
                          <span className="text-primary/70"><PinIcon /></span>
                          {s.acc.name}
                        </a>
                      ) : (
                        s.acc.name
                      )}
                    </p>
                    <p className="text-[11px] md:text-xs text-muted mt-0.5">
                      {s.city} · {s.nights} night{s.nights !== 1 ? "s" : ""}
                      {s.acc.phoneNumber && (
                        <>
                          {" · "}
                          <a href={`tel:${s.acc.phoneNumber}`} className="text-link hover:underline font-mono">
                            {s.acc.phoneNumber}
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                  {(s.acc.totalCost || s.acc.costPerNight) && (
                    <span className="font-mono text-[11px] md:text-xs text-body whitespace-nowrap mt-0.5">
                      {s.acc.totalCost ?? s.acc.costPerNight}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      {/* What it cost */}
      {cost && (
        <>
          <div className="border-t border-border/60" />
          <Section icon={<RupeeIcon />} title="What it cost">
            <div className="flex items-end justify-between gap-3 mb-4">
              <div>
                {cost.perPerson != null && (
                  <p className="font-mono text-2xl md:text-3xl font-bold text-heading leading-none">
                    {inr(cost.perPerson)}
                    <span className="text-sm font-body font-normal text-muted"> / person</span>
                  </p>
                )}
                {cost.groupTotal != null && (
                  <p className="text-[11px] md:text-xs text-muted mt-1.5 font-mono">
                    {inr(cost.groupTotal)} total
                    {cost.travellers ? ` · ${cost.travellers} people` : ""}
                  </p>
                )}
              </div>
            </div>

            {cost.items && cost.items.length > 0 && (
              <div className="space-y-2.5">
                {cost.items.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] md:text-[13px] font-body text-body">{item.label}</span>
                      <span className="font-mono text-[11px] md:text-xs text-muted">{inr(item.amount)}</span>
                    </div>
                    <div className="h-[5px] rounded-full bg-[var(--color-travel-row)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${maxItem > 0 ? Math.round((item.amount / maxItem) * 100) : 0}%`,
                          background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-text))",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cost.note && (
              <p className="mt-3.5 text-[11px] md:text-xs text-muted italic leading-relaxed">{cost.note}</p>
            )}
          </Section>
        </>
      )}

      {/* Good to know */}
      {tips.length > 0 && (
        <>
          <div className="border-t border-border/60" />
          <Section icon={<BulbIcon />} title="Good to know">
            <ul className="space-y-2.5">
              {tips.map((tip, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                  <span className="font-body text-[13px] md:text-sm text-body leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </Section>
        </>
      )}
    </div>
  );
}
