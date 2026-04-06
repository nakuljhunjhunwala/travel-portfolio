import type { TravelConnector as TravelConnectorType } from "@/types";
import WalkIcon from "@/components/ui/icons/WalkIcon";
import DriveIcon from "@/components/ui/icons/DriveIcon";
import AutoIcon from "@/components/ui/icons/AutoIcon";
import TrainIcon from "@/components/ui/icons/TrainIcon";
import BusIcon from "@/components/ui/icons/BusIcon";

interface TravelConnectorProps {
  connector: TravelConnectorType;
}

function TransportIcon({ mode }: { mode: TravelConnectorType["mode"] }) {
  const props = { size: 14, className: "text-muted" };
  switch (mode) {
    case "walk":
      return <WalkIcon {...props} />;
    case "drive":
      return <DriveIcon {...props} />;
    case "auto":
      return <AutoIcon {...props} />;
    case "train":
      return <TrainIcon {...props} />;
    case "bus":
      return <BusIcon {...props} />;
    default:
      return <DriveIcon {...props} />;
  }
}

export default function TravelConnector({ connector }: TravelConnectorProps) {
  const hasContact = connector.contactName || connector.contactPhone;

  return (
    <div className="flex gap-3 py-2.5 md:py-3 pl-6 md:pl-8">
      {/* Dotted line stub */}
      <div className="flex flex-col items-center gap-[3px] flex-shrink-0 pt-1">
        <span className="block w-[3px] h-[3px] rounded-full bg-border-dashed" />
        <span className="block w-[3px] h-[3px] rounded-full bg-border-dashed" />
        <span className="block w-[3px] h-[3px] rounded-full bg-border-dashed" />
      </div>

      {/* Info column */}
      <div className="flex flex-col gap-0.5 min-w-0">
        {/* Duration / distance / directions row */}
        <div className="flex items-center gap-1.5 text-muted flex-wrap">
          <TransportIcon mode={connector.mode} />
          <span className="font-mono text-[11px] md:text-xs truncate">
            {connector.duration} · {connector.distance}
          </span>
          <span className="text-xs text-border-dashed">▾</span>
          <a
            href={connector.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link text-[11px] md:text-xs hover:underline py-2 -my-2 px-1"
          >
            Directions
          </a>
        </div>

        {/* Contact + cost row */}
        {hasContact && (
          <div className="flex items-center gap-1.5 text-muted flex-wrap text-[11px] md:text-xs">
            {/* Person icon */}
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {connector.contactName && <span>{connector.contactName}</span>}
            {connector.contactPhone && (
              <a
                href={`tel:${connector.contactPhone}`}
                className="text-link hover:underline font-mono"
              >
                {connector.contactPhone}
              </a>
            )}
            {connector.costEstimate && (
              <span className="font-mono text-muted/80">
                · ~{connector.costEstimate}
              </span>
            )}
          </div>
        )}

        {/* Note row */}
        {connector.note && (
          <p className="text-[11px] md:text-xs text-muted italic">
            {connector.note}
          </p>
        )}
      </div>
    </div>
  );
}
