import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  Mic2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import "../styles/events.css";

type EventStatus = "UPCOMING" | "PAST" | "CANCELLED";

type EventRecord = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  speaker: string | null;
  image_url: string | null;
  registration_enabled: boolean;
  registration_url: string | null;
  status: EventStatus;
};

type RegistrationForm = {
  name: string;
  email: string;
  phone: string;
  organization: string;
};

const EMPTY_FORM: RegistrationForm = {
  name: "",
  email: "",
  phone: "",
  organization: "",
};

const formatDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatTime = (value: string | null) => {
  if (!value) {
    return "";
  }

  const [hoursString, minutesString] = value.split(":");

  const hours = Number(hoursString);
  const minutes = Number(minutesString);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return value;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const formatTimeRange = (
  startTime: string | null,
  endTime: string | null,
) => {
  const start = formatTime(startTime);
  const end = formatTime(endTime);

  if (start && end) {
    return `${start} — ${end}`;
  }

  return start || end || "Schedule to be announced";
};

const isPastEvent = (event: EventRecord) => {
  const eventDate = new Date(`${event.event_date}T23:59:59`);

  return eventDate.getTime() < Date.now();
};

function Events() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [filter, setFilter] = useState<"UPCOMING" | "PAST" | "ALL">(
    "UPCOMING",
  );

  const [selectedEvent, setSelectedEvent] =
    useState<EventRecord | null>(null);

  const [form, setForm] = useState<RegistrationForm>(EMPTY_FORM);

  const [registering, setRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] =
    useState(false);
  const [registrationError, setRegistrationError] = useState("");

  /*
   * ----------------------------------------------------------
   * LOAD EVENTS
   * ----------------------------------------------------------
   */

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    const { data, error } = await supabase
      .from("events")
      .select(
        "id, title, description, event_date, start_time, end_time, venue, speaker, image_url, registration_enabled, registration_url, status",
      )
      .order("event_date", {
        ascending: true,
      });

    if (error) {
      setEvents([]);
      setLoadError(
        "Unable to load events right now. Please try again.",
      );
      setLoading(false);
      return;
    }

    /*
     * Normalize the Supabase response into our frontend type.
     *
     * This avoids TypeScript problems caused by Supabase's
     * inferred database types differing from EventRecord.
     */
    const normalizedEvents: EventRecord[] = (data ?? []).map(
      (event) => ({
        id: event.id,
        title: event.title,
        description: event.description ?? null,
        event_date: event.event_date,
        start_time: event.start_time ?? null,
        end_time: event.end_time ?? null,
        venue: event.venue ?? null,
        speaker: event.speaker ?? null,
        image_url: event.image_url ?? null,
        registration_enabled:
          event.registration_enabled ?? true,
        registration_url: event.registration_url ?? null,
        status: event.status as EventStatus,
      }),
    );

    setEvents(normalizedEvents);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  /*
   * Prevent background scrolling while registration modal
   * is open.
   */

  useEffect(() => {
    if (!selectedEvent) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedEvent]);

  /*
   * ----------------------------------------------------------
   * EVENT FILTERING
   * ----------------------------------------------------------
   */

  const upcomingEvents = useMemo(() => {
    return events.filter(
      (event) =>
        event.status === "UPCOMING" &&
        !isPastEvent(event),
    );
  }, [events]);

  const pastEvents = useMemo(() => {
    return events.filter(
      (event) =>
        event.status === "PAST" ||
        event.status === "CANCELLED" ||
        isPastEvent(event),
    );
  }, [events]);

  const visibleEvents = useMemo(() => {
    if (filter === "UPCOMING") {
      return upcomingEvents;
    }

    if (filter === "PAST") {
      return pastEvents;
    }

    return events;
  }, [events, filter, upcomingEvents, pastEvents]);

  const featuredEvent = useMemo(() => {
    return upcomingEvents[0] ?? events[0] ?? null;
  }, [events, upcomingEvents]);

  /*
   * ----------------------------------------------------------
   * REGISTRATION MODAL
   * ----------------------------------------------------------
   */

  const closeModal = () => {
    if (registering) {
      return;
    }

    setSelectedEvent(null);
    setForm(EMPTY_FORM);
    setRegistrationError("");
    setRegistrationSuccess(false);
  };

  const openRegistration = (event: EventRecord) => {
    if (!event.registration_enabled) {
      return;
    }

    setSelectedEvent(event);
    setForm(EMPTY_FORM);
    setRegistrationError("");
    setRegistrationSuccess(false);
  };

  const updateField = (
    field: keyof RegistrationForm,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /*
   * ----------------------------------------------------------
   * REGISTER FOR EVENT
   * ----------------------------------------------------------
   */

  const handleRegistration = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!selectedEvent) {
      return;
    }

    setRegistering(true);
    setRegistrationError("");

    /*
     * Event registrations currently require an authenticated
     * Supabase user according to the RLS policy.
     */
    const {
      data: userData,
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setRegistrationError(
        "Please sign in to your NISQ Vanguard account before registering for an event.",
      );
      setRegistering(false);
      return;
    }

    const { error } = await supabase
      .from("event_registrations")
      .insert({
        event_id: selectedEvent.id,
        user_id: userData.user.id,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        organization: form.organization.trim() || null,
      });

    if (error) {
      /*
       * PostgreSQL unique constraint:
       * UNIQUE(event_id, email)
       */
      if (error.code === "23505") {
        setRegistrationError(
          "You are already registered for this event.",
        );
      } else {
        setRegistrationError(
          "Something went wrong. Please try again.",
        );
      }

      setRegistering(false);
      return;
    }

    setRegistrationSuccess(true);
    setRegistering(false);
  };

  /*
   * ----------------------------------------------------------
   * RENDER
   * ----------------------------------------------------------
   */

  return (
    <main className="events-page">
      {/* ======================================================
          HERO
          ====================================================== */}

      <section className="events-hero">
        <div className="events-container events-hero-grid">
          <div className="events-hero-copy">
            <p className="events-eyebrow">
              NISQ VANGUARD / EVENTS
            </p>

            <h1>
              Conversations that move
              <span> cybersecurity forward.</span>
            </h1>

            <p className="events-hero-description">
              Join cybersecurity workshops, awareness programs,
              technical sessions, research discussions and
              community events designed around practical
              security.
            </p>

            <div className="events-hero-actions">
              <a
                href="#event-library"
                className="events-primary-button"
              >
                EXPLORE EVENTS
                <ArrowRight size={17} />
              </a>

              <a
                href="/contact"
                className="events-secondary-button"
              >
                HOST A SECURITY SESSION
                <ChevronRight size={17} />
              </a>
            </div>

            <div className="events-hero-meta">
              <div>
                <ShieldCheck size={17} />
                <span>Practical security</span>
              </div>

              <div>
                <Users size={17} />
                <span>Security community</span>
              </div>

              <div>
                <Mic2 size={17} />
                <span>Expert sessions</span>
              </div>
            </div>
          </div>

          <div className="events-hero-visual">
            <div className="events-visual-frame">
              <div className="events-visual-header">
                <span>EVENT NETWORK</span>
                <span className="events-status-dot" />
              </div>

              <div className="events-network">
                <div className="events-network-line events-line-one" />
                <div className="events-network-line events-line-two" />
                <div className="events-network-line events-line-three" />

                <div className="events-network-node events-node-main">
                  <ShieldCheck size={28} />
                  <span>NISQ</span>
                </div>

                <div className="events-network-node events-node-one">
                  <Users size={18} />
                  <span>COMMUNITY</span>
                </div>

                <div className="events-network-node events-node-two">
                  <Mic2 size={18} />
                  <span>EXPERTS</span>
                </div>

                <div className="events-network-node events-node-three">
                  <CalendarDays size={18} />
                  <span>EVENTS</span>
                </div>
              </div>

              <div className="events-visual-footer">
                <span>EDUCATE</span>
                <span>CONNECT</span>
                <span>DEFEND</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          FEATURED EVENT
          ====================================================== */}

      {featuredEvent && (
        <section className="events-featured-section">
          <div className="events-container">
            <div className="events-section-heading">
              <div>
                <p className="events-eyebrow">FEATURED</p>

                <h2>
                  What’s happening at NISQ Vanguard.
                </h2>
              </div>

              <span className="events-heading-index">
                01
              </span>
            </div>

            <article className="events-featured-card">
              <div className="events-featured-content">
                <div className="events-event-status">
                  {featuredEvent.status === "UPCOMING" &&
                  !isPastEvent(featuredEvent)
                    ? "UPCOMING EVENT"
                    : "EVENT"}
                </div>

                <h3>{featuredEvent.title}</h3>

                <p>
                  {featuredEvent.description ||
                    "A NISQ Vanguard cybersecurity event focused on practical knowledge, security awareness and emerging threats."}
                </p>

                <div className="events-featured-details">
                  <div>
                    <CalendarDays size={18} />
                    <span>
                      {formatDate(
                        featuredEvent.event_date,
                      )}
                    </span>
                  </div>

                  <div>
                    <Clock3 size={18} />
                    <span>
                      {formatTimeRange(
                        featuredEvent.start_time,
                        featuredEvent.end_time,
                      )}
                    </span>
                  </div>

                  {featuredEvent.venue && (
                    <div>
                      <MapPin size={18} />
                      <span>
                        {featuredEvent.venue}
                      </span>
                    </div>
                  )}

                  {featuredEvent.speaker && (
                    <div>
                      <Mic2 size={18} />
                      <span>
                        {featuredEvent.speaker}
                      </span>
                    </div>
                  )}
                </div>

                {featuredEvent.registration_enabled &&
                  featuredEvent.status === "UPCOMING" &&
                  !isPastEvent(featuredEvent) && (
                    <button
                      type="button"
                      className="events-primary-button"
                      onClick={() =>
                        openRegistration(featuredEvent)
                      }
                    >
                      REGISTER FOR EVENT
                      <ArrowRight size={17} />
                    </button>
                  )}
              </div>

              <div className="events-featured-media">
                {featuredEvent.image_url ? (
                  <img
                    src={featuredEvent.image_url}
                    alt={featuredEvent.title}
                  />
                ) : (
                  <div className="events-featured-placeholder">
                    <CalendarDays size={38} />
                    <span>
                      EVENT / NISQ VANGUARD
                    </span>
                  </div>
                )}

                <div className="events-featured-date">
                  <span>
                    {new Date(
                      `${featuredEvent.event_date}T00:00:00`,
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                    })}
                  </span>

                  <small>
                    {new Date(
                      `${featuredEvent.event_date}T00:00:00`,
                    ).toLocaleDateString("en-IN", {
                      month: "short",
                    })}
                  </small>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* ======================================================
          EVENT LIBRARY
          ====================================================== */}

      <section
        className="events-library-section"
        id="event-library"
      >
        <div className="events-container">
          <div className="events-section-heading events-library-heading">
            <div>
              <p className="events-eyebrow">
                EVENT LIBRARY
              </p>

              <h2>
                Explore upcoming and past sessions.
              </h2>
            </div>

            <div className="events-filter-group">
              <button
                type="button"
                className={
                  filter === "UPCOMING"
                    ? "events-filter active"
                    : "events-filter"
                }
                onClick={() => setFilter("UPCOMING")}
              >
                UPCOMING
              </button>

              <button
                type="button"
                className={
                  filter === "PAST"
                    ? "events-filter active"
                    : "events-filter"
                }
                onClick={() => setFilter("PAST")}
              >
                PAST
              </button>

              <button
                type="button"
                className={
                  filter === "ALL"
                    ? "events-filter active"
                    : "events-filter"
                }
                onClick={() => setFilter("ALL")}
              >
                ALL
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="events-state-card">
              <div className="events-loader" />

              <h3>Loading events</h3>

              <p>
                Connecting to the NISQ Vanguard event
                network.
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && loadError && (
            <div className="events-state-card events-state-error">
              <ShieldCheck size={30} />

              <h3>Events unavailable</h3>

              <p>{loadError}</p>

              <button
                type="button"
                className="events-primary-button"
                onClick={() => void loadEvents()}
              >
                TRY AGAIN
                <ArrowRight size={17} />
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading &&
            !loadError &&
            visibleEvents.length === 0 && (
              <div className="events-state-card">
                <CalendarDays size={30} />

                <h3>No events available</h3>

                <p>
                  There are no events in this category yet.
                  Check back soon for new NISQ Vanguard
                  sessions.
                </p>
              </div>
            )}

          {/* Events */}
          {!loading &&
            !loadError &&
            visibleEvents.length > 0 && (
              <div className="events-grid">
                {visibleEvents.map((event, index) => {
                  const canRegister =
                    event.registration_enabled &&
                    event.status === "UPCOMING" &&
                    !isPastEvent(event);

                  return (
                    <article
                      className="events-card"
                      key={event.id}
                    >
                      <div className="events-card-media">
                        {event.image_url ? (
                          <img
                            src={event.image_url}
                            alt={event.title}
                            loading="lazy"
                          />
                        ) : (
                          <div className="events-card-placeholder">
                            <CalendarDays size={28} />

                            <span>
                              EVENT{" "}
                              {String(index + 1).padStart(
                                2,
                                "0",
                              )}
                            </span>
                          </div>
                        )}

                        <span
                          className={`events-card-status events-status-${event.status.toLowerCase()}`}
                        >
                          {event.status}
                        </span>
                      </div>

                      <div className="events-card-content">
                        <div className="events-card-date">
                          <CalendarDays size={15} />

                          {formatDate(event.event_date)}
                        </div>

                        <h3>{event.title}</h3>

                        <p>
                          {event.description ||
                            "NISQ Vanguard cybersecurity session."}
                        </p>

                        <div className="events-card-details">
                          {event.start_time && (
                            <div>
                              <Clock3 size={15} />

                              <span>
                                {formatTimeRange(
                                  event.start_time,
                                  event.end_time,
                                )}
                              </span>
                            </div>
                          )}

                          {event.venue && (
                            <div>
                              <MapPin size={15} />

                              <span>
                                {event.venue}
                              </span>
                            </div>
                          )}

                          {event.speaker && (
                            <div>
                              <Mic2 size={15} />

                              <span>
                                {event.speaker}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="events-card-footer">
                          {canRegister ? (
                            <button
                              type="button"
                              className="events-card-action"
                              onClick={() =>
                                openRegistration(event)
                              }
                            >
                              REGISTER
                              <ArrowRight size={15} />
                            </button>
                          ) : event.registration_url ? (
                            <a
                              href={
                                event.registration_url
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="events-card-action"
                            >
                              EVENT DETAILS
                              <ArrowRight size={15} />
                            </a>
                          ) : (
                            <span className="events-card-closed">
                              REGISTRATION CLOSED
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
        </div>
      </section>

      {/* ======================================================
          WHY NISQ EVENTS
          ====================================================== */}

      <section className="events-purpose-section">
        <div className="events-container">
          <div className="events-section-heading">
            <div>
              <p className="events-eyebrow">
                WHY NISQ EVENTS
              </p>

              <h2>
                Security knowledge should be shared.
              </h2>
            </div>

            <span className="events-heading-index">
              02
            </span>
          </div>

          <div className="events-purpose-grid">
            <article className="events-purpose-card">
              <div className="events-purpose-number">
                01
              </div>

              <ShieldCheck size={25} />

              <h3>Practical Security</h3>

              <p>
                Sessions are built around real security
                behaviour, risk decisions and practical
                defensive thinking.
              </p>
            </article>

            <article className="events-purpose-card">
              <div className="events-purpose-number">
                02
              </div>

              <Users size={25} />

              <h3>Community</h3>

              <p>
                Connect students, professionals,
                organizations, educators and security
                practitioners.
              </p>
            </article>

            <article className="events-purpose-card">
              <div className="events-purpose-number">
                03
              </div>

              <Mic2 size={25} />

              <h3>Expertise</h3>

              <p>
                Explore cybersecurity, AI security,
                threat intelligence and emerging defence
                technologies.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ======================================================
          HOST EVENT CTA
          ====================================================== */}

      <section className="events-host-section">
        <div className="events-container">
          <div className="events-host-card">
            <div>
              <p className="events-eyebrow">
                FOR ORGANIZATIONS
              </p>

              <h2>
                Planning a cybersecurity
                <span> event or workshop?</span>
              </h2>

              <p>
                Work with NISQ Vanguard to design practical
                cybersecurity awareness programs, workshops,
                technical sessions and campus events.
              </p>
            </div>

            <a
              href="/contact"
              className="events-primary-button"
            >
              PLAN A SECURITY EVENT
              <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </section>

      {/* ======================================================
          REGISTRATION MODAL
          ====================================================== */}

      {selectedEvent && (
        <div
          className="events-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="events-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-registration-title"
          >
            <button
              type="button"
              className="events-modal-close"
              onClick={closeModal}
              aria-label="Close registration dialog"
              disabled={registering}
            >
              <X size={20} />
            </button>

            {!registrationSuccess ? (
              <>
                <div className="events-modal-header">
                  <p className="events-eyebrow">
                    EVENT REGISTRATION
                  </p>

                  <h2 id="event-registration-title">
                    {selectedEvent.title}
                  </h2>

                  <div className="events-modal-meta">
                    <span>
                      <CalendarDays size={15} />

                      {formatDate(
                        selectedEvent.event_date,
                      )}
                    </span>

                    <span>
                      <Clock3 size={15} />

                      {formatTimeRange(
                        selectedEvent.start_time,
                        selectedEvent.end_time,
                      )}
                    </span>
                  </div>
                </div>

                <form
                  className="events-registration-form"
                  onSubmit={handleRegistration}
                >
                  <div className="events-form-grid">
                    <label>
                      <span>Full Name *</span>

                      <input
                        type="text"
                        value={form.name}
                        onChange={(event) =>
                          updateField(
                            "name",
                            event.target.value,
                          )
                        }
                        placeholder="Your full name"
                        autoComplete="name"
                        required
                      />
                    </label>

                    <label>
                      <span>Email *</span>

                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          updateField(
                            "email",
                            event.target.value,
                          )
                        }
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                      />
                    </label>

                    <label>
                      <span>Phone</span>

                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(event) =>
                          updateField(
                            "phone",
                            event.target.value,
                          )
                        }
                        placeholder="+91"
                        autoComplete="tel"
                      />
                    </label>

                    <label>
                      <span>Organization</span>

                      <input
                        type="text"
                        value={form.organization}
                        onChange={(event) =>
                          updateField(
                            "organization",
                            event.target.value,
                          )
                        }
                        placeholder="Company / College"
                        autoComplete="organization"
                      />
                    </label>
                  </div>

                  {registrationError && (
                    <div
                      className="events-form-error"
                      role="alert"
                    >
                      {registrationError}
                    </div>
                  )}

                  <div className="events-login-note">
                    <ShieldCheck size={16} />

                    <span>
                      Event registration is linked to your
                      NISQ Vanguard account.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="events-primary-button events-submit-button"
                    disabled={registering}
                  >
                    {registering
                      ? "REGISTERING..."
                      : "CONFIRM REGISTRATION"}

                    {!registering && (
                      <ArrowRight size={17} />
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="events-success-state">
                <div className="events-success-icon">
                  <CheckCircle2 size={34} />
                </div>

                <p className="events-eyebrow">
                  REGISTRATION CONFIRMED
                </p>

                <h2>You’re registered.</h2>

                <p>
                  Your registration for{" "}
                  <strong>
                    {selectedEvent.title}
                  </strong>{" "}
                  has been recorded successfully.
                </p>

                <div className="events-success-details">
                  <div>
                    <CalendarDays size={17} />

                    <span>
                      {formatDate(
                        selectedEvent.event_date,
                      )}
                    </span>
                  </div>

                  <div>
                    <Clock3 size={17} />

                    <span>
                      {formatTimeRange(
                        selectedEvent.start_time,
                        selectedEvent.end_time,
                      )}
                    </span>
                  </div>

                  {selectedEvent.venue && (
                    <div>
                      <MapPin size={17} />

                      <span>
                        {selectedEvent.venue}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="events-primary-button"
                  onClick={closeModal}
                >
                  DONE
                  <ArrowRight size={17} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default Events;