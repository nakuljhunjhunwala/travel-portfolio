import EmbedLinkInterceptor from "./EmbedLinkInterceptor";

export const metadata = {
  title: "Travel Embed",
  robots: { index: false, follow: false },
};

/**
 * Chrome-free nested layout for embed routes.
 * The root layout still wraps this with AuthProvider/fonts/globals,
 * but we hide the root's UserMenu and skip-to-content via CSS,
 * and set transparent background + hidden overflow for iframe use.
 */
export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Hide root layout chrome when inside embed */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html, body { background: transparent !important; overflow: hidden !important; }
            #embed-hide-chrome { display: none !important; }
            #main-content { min-height: auto !important; padding: 0 !important; margin: 0 !important; }
          `,
        }}
      />
      <div id="embed-root">
        <EmbedLinkInterceptor>{children}</EmbedLinkInterceptor>
      </div>
    </>
  );
}
