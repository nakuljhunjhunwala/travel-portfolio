import Image from "next/image";
import type { Accommodation } from "@/types";

interface AccommodationCardProps {
  accommodation: Accommodation;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill={star <= rating ? "#2563EB" : "none"}
          stroke={star <= rating ? "#2563EB" : "#D1D5DB"}
          strokeWidth="2"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function AccommodationCard({ accommodation }: AccommodationCardProps) {
  return (
    <div className="mt-3 rounded-2xl bg-blue-50/50 border-t-2 border-dashed border-blue-200 overflow-hidden">
      <div className="p-4 md:p-5">
        <div className="flex gap-3">
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header: bed icon + name */}
            <div className="flex items-start gap-2.5">
              <span className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 4v16" />
                  <path d="M22 8H2" />
                  <path d="M22 20V8l-10-4" />
                  <path d="M6 8v4" />
                  <path d="M2 12h4" />
                </svg>
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <h4 className="font-heading font-bold text-heading text-sm md:text-base leading-snug">
                    {accommodation.googleMapsUrl ? (
                      <a
                        href={accommodation.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline decoration-blue-400/40 underline-offset-2"
                      >
                        {accommodation.name}
                      </a>
                    ) : (
                      accommodation.name
                    )}
                  </h4>
                  <span className="inline-flex items-center rounded-md px-1.5 py-0 text-[10px] font-medium text-blue-700 bg-blue-100 leading-5">
                    Stay
                  </span>
                </div>

                {/* Rating */}
                {accommodation.rating != null && (
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <StarRating rating={accommodation.rating} />
                    <span className="font-mono text-[11px] text-blue-700">
                      {accommodation.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Meta row: check-in / check-out */}
            {(accommodation.checkIn || accommodation.checkOut) && (
              <div className="mt-2 ml-[38px] md:ml-[42px] flex flex-wrap gap-1.5">
                {accommodation.checkIn && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-700 text-[11px] md:text-xs font-mono">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    In {accommodation.checkIn}
                  </span>
                )}
                {accommodation.checkOut && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-700 text-[11px] md:text-xs font-mono">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Out {accommodation.checkOut}
                  </span>
                )}
              </div>
            )}

            {/* Cost row */}
            {(accommodation.costPerNight || accommodation.totalCost) && (
              <div className="mt-2 ml-[38px] md:ml-[42px] flex flex-wrap items-center gap-2">
                {accommodation.costPerNight && (
                  <span className="font-mono text-[11px] md:text-xs text-blue-700 font-medium">
                    {accommodation.costPerNight}
                    <span className="text-muted font-body font-normal"> / night</span>
                  </span>
                )}
                {accommodation.totalCost && (
                  <span className="font-mono text-[11px] md:text-xs text-muted">
                    ({accommodation.totalCost} total)
                  </span>
                )}
              </div>
            )}

            {/* Action buttons: Phone / Book */}
            {(accommodation.phoneNumber || accommodation.bookingUrl) && (
              <div className="mt-2 ml-[38px] md:ml-[42px] flex flex-wrap gap-1.5">
                {accommodation.phoneNumber && (
                  <a
                    href={`tel:${accommodation.phoneNumber}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-blue-200 text-[11px] md:text-xs text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 11a19.79 19.79 0 01-3.07-8.67A2 2 0 012.86 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                    </svg>
                    {accommodation.phoneNumber}
                  </a>
                )}
                {accommodation.bookingUrl && (
                  <a
                    href={accommodation.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-blue-300 bg-blue-600 text-[11px] md:text-xs text-white hover:bg-blue-700 transition-colors font-medium"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Book
                  </a>
                )}
              </div>
            )}

            {/* Honest note */}
            {accommodation.honestNote && (
              <p className="mt-2 ml-[38px] md:ml-[42px] font-body text-[12px] md:text-sm text-muted italic leading-relaxed">
                &ldquo;{accommodation.honestNote}&rdquo;
              </p>
            )}
          </div>

          {/* Photo thumbnail */}
          {accommodation.photoUrl && (
            <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-xl overflow-hidden relative flex-shrink-0 self-start">
              <Image
                src={accommodation.photoUrl}
                alt={accommodation.name}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 80px, 100px"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
