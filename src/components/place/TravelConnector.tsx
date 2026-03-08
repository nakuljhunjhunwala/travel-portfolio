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
  return (
    <div className="flex items-center gap-3 py-2.5 md:py-3 pl-6 md:pl-8">
      {/* Dotted line stub */}
      <div className="flex flex-col items-center gap-[3px] flex-shrink-0">
        <span className="block w-[3px] h-[3px] rounded-full bg-border-dashed" />
        <span className="block w-[3px] h-[3px] rounded-full bg-border-dashed" />
        <span className="block w-[3px] h-[3px] rounded-full bg-border-dashed" />
      </div>

      {/* Info */}
      <div className="flex items-center gap-1.5 text-muted min-w-0 flex-wrap">
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
    </div>
  );
}
