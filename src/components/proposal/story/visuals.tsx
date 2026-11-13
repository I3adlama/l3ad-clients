"use client";

import type { CSSProperties, ReactNode } from "react";
import type { StoryVisual } from "@/lib/types";
import { useInViewClass } from "./primitives";

/**
 * Wide animated illustrations, one per service. Each plays once when it
 * scrolls into view (the `is-in` class starts the CSS sequence). They are
 * sketches of the idea, never screenshots, and each caption says so.
 */

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

function Frame({ children, caption, kind }: { children: ReactNode; caption: string; kind: string }) {
  const ref = useInViewClass<HTMLDivElement>();
  return (
    <figure className="sp-vis">
      <div ref={ref} className={`sp-vis__stage sp-vis--${kind}`}>
        {children}
      </div>
      <figcaption className="sp-vis__cap">
        <i className="bi-info-circle" aria-hidden /> {caption}
      </figcaption>
    </figure>
  );
}

function Stars({ at = 0.5 }: { at?: number }) {
  return (
    <span className="sp-stars" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <i key={i} className="bi-star-fill" style={{ animationDelay: `${at + i * 0.12}s` }} />
      ))}
    </span>
  );
}

function WebsiteVisual({ clientName }: { clientName: string }) {
  return (
    <Frame kind="website" caption="A sketch of the direction, in your colors. The real preview lands Monday.">
      <div className="sp-vis__main">
        <div className="sp-browser sp-pop" style={d(0)}>
          <div className="sp-browser__bar">
            <span />
            <span />
            <span />
            <em>
              <i className="bi-lock-fill" aria-hidden /> {clientName}
            </em>
          </div>
          <div className="sp-browser__body">
            <div className="sp-site__nav">
              <b>Services</b>
              <b>Pre-Wire Packages</b>
              <b>About</b>
              <b>FAQ</b>
              <strong>Request a Quote</strong>
            </div>
            <p className="sp-site__h">
              <span className="sp-site__h1">Built to connect.</span>
              <span className="sp-site__h2">Made to last.</span>
            </p>
            <div className="sp-site__stripes">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="sp-site__tiles">
              <span>
                <i className="bi-camera-video" aria-hidden />
                Cameras
              </span>
              <span>
                <i className="bi-speaker" aria-hidden />
                Audio / Video
              </span>
              <span>
                <i className="bi-house-gear" aria-hidden />
                Pre-Wiring
              </span>
              <span>
                <i className="bi-wifi" aria-hidden />
                Networking
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="sp-vis__side sp-vis__side--site">
        <div className="sp-phone sp-pop" style={d(0.3)}>
          <div className="sp-phone__notch" />
          <p>
            <span className="sp-site__h1">Built to connect.</span>
            <span className="sp-site__h2">Made to last.</span>
          </p>
          <div className="sp-phone__btn">Request a Quote</div>
          <div className="sp-phone__btn sp-phone__btn--ghost">
            <i className="bi-telephone-fill" aria-hidden /> Tap to call
          </div>
        </div>
        <div className="sp-badges">
          <div className="sp-speed sp-pop" style={d(0.55)}>
            <svg viewBox="0 0 64 64" aria-hidden>
              <circle cx="32" cy="32" r="27" className="sp-speed__track" />
              <circle cx="32" cy="32" r="27" className="sp-speed__arc" />
            </svg>
            <b>90+</b>
            <small>phone speed target</small>
          </div>
          <div className="sp-badge sp-pop" style={d(0.7)}>
            <i className="bi-file-earmark-arrow-up" aria-hidden />
            Blueprint upload
          </div>
          <div className="sp-badge sp-pop" style={d(0.85)}>
            <i className="bi-key" aria-hidden />
            Yours to keep
          </div>
        </div>
      </div>
    </Frame>
  );
}

function ProfileVisual({ clientName }: { clientName: string }) {
  return (
    <Frame kind="profile" caption="Illustration. The stars and reviews will be the ones your clients leave.">
      <div className="sp-map" aria-hidden>
        <i className="sp-map__road sp-map__road--a" />
        <i className="sp-map__road sp-map__road--b" />
        <i className="sp-map__road sp-map__road--c" />
        <span className="sp-map__pin">
          <i className="bi-geo-alt-fill" />
        </span>
        <span className="sp-map__ring" />
      </div>
      <div className="sp-vis__main">
        <div className="sp-gcard sp-pop" style={d(0.2)}>
          <b>{clientName}</b>
          <div className="sp-gcard__row">
            <Stars at={0.7} />
            <small>Low voltage contractor, Cocoa FL</small>
          </div>
          <div className="sp-gcard__actions">
            <span>
              <i className="bi-telephone-fill" /> Call
            </span>
            <span>
              <i className="bi-signpost-2-fill" /> Directions
            </span>
            <span>
              <i className="bi-globe2" /> Website
            </span>
          </div>
          <div className="sp-gcard__stats">
            <span>
              <i className="bi-telephone-inbound" aria-hidden /> Calls
            </span>
            <span>
              <i className="bi-signpost-split" aria-hidden /> Directions
            </span>
            <span>
              <i className="bi-cursor" aria-hidden /> Website taps
            </span>
          </div>
        </div>
      </div>
      <div className="sp-vis__side">
        <div className="sp-review sp-pop" style={d(0.9)}>
          <Stars at={1.2} />
          <i className="sp-skel" style={{ width: "88%" }} />
          <i className="sp-skel" style={{ width: "62%" }} />
        </div>
        <div className="sp-review sp-review--b sp-pop" style={d(1.2)}>
          <Stars at={1.5} />
          <i className="sp-skel" style={{ width: "74%" }} />
          <i className="sp-skel" style={{ width: "90%" }} />
        </div>
        <div className="sp-review sp-pop" style={d(1.5)}>
          <Stars at={1.8} />
          <i className="sp-skel" style={{ width: "80%" }} />
          <i className="sp-skel" style={{ width: "54%" }} />
        </div>
      </div>
    </Frame>
  );
}

function AdsVisual({ clientName }: { clientName: string }) {
  return (
    <Frame kind="ads" caption="Illustration of a Local Services Ad. Google decides the final look.">
      <div className="sp-search sp-pop" style={d(0)}>
        <i className="bi-search" />
        <span className="sp-typed">security camera installation near me</span>
      </div>
      <div className="sp-adrow">
        <div className="sp-ad sp-pop" style={d(2)}>
          <div className="sp-ad__top">
            <span className="sp-ad__check">
              <i className="bi-patch-check-fill" />
            </span>
            <div>
              <b>{clientName}</b>
              <small>Checked by Google: license, insurance, owner</small>
            </div>
          </div>
          <div className="sp-ad__row">
            <Stars at={2.4} />
            <small>Cocoa, Rockledge, Merritt Island, Viera</small>
          </div>
          <div className="sp-ad__call">
            <span className="sp-ad__pulse" />
            <span className="sp-ad__pulse sp-ad__pulse--2" />
            <i className="bi-telephone-fill" /> Call
          </div>
        </div>
        <div className="sp-ad sp-ad--ghost sp-pop" style={d(2.2)}>
          <i className="sp-skel" style={{ width: "56%" }} />
          <i className="sp-skel sp-skel--thin" style={{ width: "80%" }} />
          <i className="sp-skel sp-skel--thin" style={{ width: "64%" }} />
        </div>
        <div className="sp-ad sp-ad--ghost sp-pop" style={d(2.35)}>
          <i className="sp-skel" style={{ width: "48%" }} />
          <i className="sp-skel sp-skel--thin" style={{ width: "72%" }} />
          <i className="sp-skel sp-skel--thin" style={{ width: "58%" }} />
        </div>
      </div>
      <div className="sp-chiprow">
        <span className="sp-chip sp-pop" style={d(2.6)}>
          <i className="bi-cash-coin" aria-hidden /> You pay per lead, not per click
        </span>
        <span className="sp-chip sp-chip--plain sp-pop" style={d(2.75)}>
          <i className="bi-sliders" aria-hidden /> You set the budget
        </span>
        <span className="sp-chip sp-chip--plain sp-pop" style={d(2.9)}>
          <i className="bi-clock" aria-hidden /> Runs only when you can answer
        </span>
      </div>
    </Frame>
  );
}

function SeoVisual({ clientName }: { clientName: string }) {
  return (
    <Frame kind="seo" caption="Illustration of the goal. Rankings are earned over months, and I report them monthly.">
      <div className="sp-vis__main">
        <div className="sp-search sp-pop" style={d(0)}>
          <i className="bi-search" />
          <span>home theater installation</span>
        </div>
        <ol className="sp-serp sp-pop" style={d(0.2)}>
          {[0, 1, 2].map((i) => (
            <li key={i} className={`sp-serp__row sp-serp__row--${i}`}>
              <em className={i > 0 ? "sp-serp__roll" : undefined}>
                <span>{i + 1}</span>
                {i > 0 && <span>{i + 2}</span>}
              </em>
              <span>
                <i className="sp-skel" style={{ width: `${[58, 44, 66][i]}%` }} />
                <i className="sp-skel sp-skel--thin" style={{ width: `${[82, 74, 60][i]}%` }} />
              </span>
            </li>
          ))}
          <li className="sp-serp__row sp-serp__row--you">
            <em className="sp-serp__roll sp-serp__rank">
              <span>4</span>
              <span>2</span>
            </em>
            <span>
              <b>{clientName}: Home Theater Installation</b>
              <small>Real projects, package prices, licensed and insured</small>
            </span>
          </li>
        </ol>
      </div>
      <div className="sp-vis__side">
        <div className="sp-chart sp-pop" style={d(0.5)}>
          <p>
            <i className="bi-graph-up-arrow" aria-hidden /> Position over time
          </p>
          <svg viewBox="0 0 240 130" aria-hidden>
            <g className="sp-chart__grid">
              <line x1="0" y1="20" x2="240" y2="20" />
              <line x1="0" y1="55" x2="240" y2="55" />
              <line x1="0" y1="90" x2="240" y2="90" />
              <line x1="0" y1="125" x2="240" y2="125" />
            </g>
            <path className="sp-chart__line" d="M6 116 C 40 114, 58 104, 84 92 S 128 64, 156 46 S 206 22, 234 16" />
            <circle className="sp-chart__dot" cx="234" cy="16" r="5" />
          </svg>
          <div className="sp-chart__x">
            <span>Month 1</span>
            <span>Month 3</span>
            <span>Month 6</span>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function AiVisual({ clientName }: { clientName: string }) {
  return (
    <Frame kind="ai" caption="Illustration of the goal. Nobody controls an AI answer, so I measure it monthly.">
      <div className="sp-vis__main">
        <div className="sp-chat sp-chat--q sp-pop" style={d(0)}>
          Who installs security cameras near Cocoa, FL?
        </div>
        <div className="sp-chat sp-chat--dots sp-pop" style={d(0.5)} aria-hidden>
          <i />
          <i />
          <i />
        </div>
        <div className="sp-chat sp-chat--a sp-pop" style={d(2.4)}>
          <p>
            <i className="bi-stars" aria-hidden /> A few licensed options in the area:
          </p>
          <p className="sp-chat__you">
            <i className="bi-check-circle-fill" /> <b>{clientName}</b>, a low voltage contractor in Cocoa with published
            package pricing
          </p>
          <i className="sp-skel" style={{ width: "84%" }} />
          <i className="sp-skel" style={{ width: "66%" }} />
        </div>
      </div>
      <div className="sp-vis__side">
        <div className="sp-engines sp-pop" style={d(2.8)}>
          <p>
            <i className="bi-clipboard-check" aria-hidden /> Monthly check: are you named?
          </p>
          {["ChatGPT", "Gemini", "Grok", "Claude"].map((e, i) => (
            <div key={e} className="sp-engine">
              <span>{e}</span>
              <i className="bi-check-circle-fill" style={{ animationDelay: `${3.3 + i * 0.25}s` }} />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

export default function ServiceVisual({ visual, clientName }: { visual: StoryVisual; clientName: string }) {
  switch (visual) {
    case "website":
      return <WebsiteVisual clientName={clientName} />;
    case "profile":
      return <ProfileVisual clientName={clientName} />;
    case "ads":
      return <AdsVisual clientName={clientName} />;
    case "seo":
      return <SeoVisual clientName={clientName} />;
    case "ai":
      return <AiVisual clientName={clientName} />;
  }
}
