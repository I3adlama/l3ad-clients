"use client";

import type { StoryVisual } from "@/lib/types";
import { useInViewClass } from "./primitives";

/**
 * Small animated illustrations, one per service. Each plays once when it
 * scrolls into view (the `is-in` class starts the CSS sequence). They are
 * sketches of the idea, never screenshots, and each one says so.
 */

function Frame({ children, caption, kind }: { children: React.ReactNode; caption: string; kind: string }) {
  const ref = useInViewClass<HTMLDivElement>();
  return (
    <figure className="sp-vis">
      <div ref={ref} className={`sp-vis__stage sp-vis--${kind}`}>
        {children}
      </div>
      <figcaption className="sp-vis__cap">{caption}</figcaption>
    </figure>
  );
}

function Stars() {
  return (
    <span className="sp-stars" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <i key={i} className="bi-star-fill" style={{ animationDelay: `${0.5 + i * 0.12}s` }} />
      ))}
    </span>
  );
}

function WebsiteVisual({ clientName }: { clientName: string }) {
  return (
    <Frame kind="website" caption="A sketch of the direction, in your colors. The real preview lands Monday.">
      <div className="sp-browser">
        <div className="sp-browser__bar">
          <span />
          <span />
          <span />
          <em>{clientName}</em>
        </div>
        <div className="sp-browser__body">
          <div className="sp-site__nav">
            <b>Services</b>
            <b>Pre-Wire Packages</b>
            <b>About</b>
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
            <span>Cameras</span>
            <span>Audio / Video</span>
            <span>Pre-Wiring</span>
            <span>Networking</span>
          </div>
        </div>
      </div>
      <div className="sp-phone">
        <div className="sp-phone__notch" />
        <p>
          <span className="sp-site__h1">Built to connect.</span>
          <span className="sp-site__h2">Made to last.</span>
        </p>
        <div className="sp-phone__btn">Request a Quote</div>
        <div className="sp-phone__btn sp-phone__btn--ghost">Tap to call</div>
      </div>
      <div className="sp-speed">
        <svg viewBox="0 0 64 64" aria-hidden>
          <circle cx="32" cy="32" r="27" className="sp-speed__track" />
          <circle cx="32" cy="32" r="27" className="sp-speed__arc" />
        </svg>
        <b>90+</b>
        <small>phone speed target</small>
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
      <div className="sp-gcard">
        <b>{clientName}</b>
        <div className="sp-gcard__row">
          <Stars />
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
      </div>
      <div className="sp-review sp-review--1">
        <Stars />
        <i className="sp-skel" style={{ width: "88%" }} />
        <i className="sp-skel" style={{ width: "62%" }} />
      </div>
      <div className="sp-review sp-review--2">
        <Stars />
        <i className="sp-skel" style={{ width: "74%" }} />
        <i className="sp-skel" style={{ width: "90%" }} />
      </div>
    </Frame>
  );
}

function AdsVisual({ clientName }: { clientName: string }) {
  return (
    <Frame kind="ads" caption="Illustration of a Local Services Ad. Google decides the final look.">
      <div className="sp-search">
        <i className="bi-search" />
        <span className="sp-typed">security camera installation near me</span>
      </div>
      <div className="sp-ad">
        <div className="sp-ad__top">
          <span className="sp-ad__check">
            <i className="bi-check-lg" />
          </span>
          <div>
            <b>{clientName}</b>
            <small>Checked by Google: license, insurance, owner</small>
          </div>
        </div>
        <div className="sp-ad__row">
          <Stars />
          <small>Serves Cocoa, Rockledge, Merritt Island, Viera</small>
        </div>
        <div className="sp-ad__call">
          <span className="sp-ad__pulse" />
          <span className="sp-ad__pulse sp-ad__pulse--2" />
          <i className="bi-telephone-fill" /> Call
        </div>
      </div>
      <div className="sp-ad sp-ad--ghost">
        <i className="sp-skel" style={{ width: "46%" }} />
        <i className="sp-skel" style={{ width: "70%" }} />
      </div>
      <div className="sp-chip sp-chip--lead">You pay per lead, not per click</div>
    </Frame>
  );
}

function SeoVisual({ clientName }: { clientName: string }) {
  return (
    <Frame kind="seo" caption="Illustration of the goal. Rankings are earned over months, and I report them monthly.">
      <div className="sp-search">
        <i className="bi-search" />
        <span>home theater installation</span>
      </div>
      <ol className="sp-serp">
        {[0, 1, 2].map((i) => (
          <li key={i} className={`sp-serp__row sp-serp__row--${i}`}>
            <em className={i > 0 ? "sp-serp__roll" : undefined}>
              <span>{i + 1}</span>
              {i > 0 && <span>{i + 2}</span>}
            </em>
            <span>
              <i className="sp-skel" style={{ width: `${[58, 44, 66, 50][i]}%` }} />
              <i className="sp-skel sp-skel--thin" style={{ width: `${[82, 74, 60, 86][i]}%` }} />
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
    </Frame>
  );
}

function AiVisual({ clientName }: { clientName: string }) {
  return (
    <Frame kind="ai" caption="Illustration of the goal. Nobody controls an AI answer, so I measure it monthly.">
      <div className="sp-chat sp-chat--q">Who installs security cameras near Cocoa, FL?</div>
      <div className="sp-chat sp-chat--dots" aria-hidden>
        <i />
        <i />
        <i />
      </div>
      <div className="sp-chat sp-chat--a">
        <p>A few licensed options in the area:</p>
        <p className="sp-chat__you">
          <i className="bi-check-circle-fill" /> <b>{clientName}</b>, a low voltage contractor in Cocoa with published
          package pricing
        </p>
        <i className="sp-skel" style={{ width: "84%" }} />
        <i className="sp-skel" style={{ width: "66%" }} />
      </div>
      <div className="sp-engines" aria-hidden>
        <span>ChatGPT</span>
        <span>Gemini</span>
        <span>Grok</span>
        <span>Claude</span>
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
