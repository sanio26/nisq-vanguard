import { type ChangeEvent, type FormEvent, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Users,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import "../styles/campus.css";

const programs = [
  {
    number: "01",
    title: "Cyber Awareness Workshop",
    description:
      "A focused cybersecurity awareness session covering everyday digital threats and safe practices.",
    icon: ShieldCheck,
  },
  {
    number: "02",
    title: "Cybersecurity Awareness Day",
    description:
      "A campus-wide awareness program designed to build practical cybersecurity habits.",
    icon: Building2,
  },
  {
    number: "03",
    title: "Faculty Cybersecurity Training",
    description:
      "Role-focused cybersecurity education for faculty members and academic staff.",
    icon: GraduationCap,
  },
  {
    number: "04",
    title: "Student Cybersecurity Bootcamp",
    description:
      "Hands-on cybersecurity learning for students who want practical exposure.",
    icon: Users,
  },
  {
    number: "05",
    title: "Ethical Hacking Workshop",
    description:
      "A responsible introduction to ethical hacking, security testing and defensive thinking.",
    icon: ShieldCheck,
  },
  {
    number: "06",
    title: "Cybersecurity Competition",
    description:
      "Challenge-based activities that encourage students to apply cybersecurity concepts.",
    icon: ShieldCheck,
  },
  {
    number: "07",
    title: "AI Security Awareness",
    description:
      "Awareness around AI-enabled threats, misuse, scams and responsible AI security.",
    icon: ShieldCheck,
  },
  {
    number: "08",
    title: "Digital Fraud Awareness",
    description:
      "Practical guidance on phishing, scams, identity theft and online fraud.",
    icon: Building2,
  },
  {
    number: "09",
    title: "Annual CyberSecure Campus Program",
    description:
      "A structured long-term cybersecurity awareness program for educational institutions.",
    icon: GraduationCap,
  },
];

const awarenessTopics = [
  "Phishing",
  "Social Engineering",
  "Malware",
  "Ransomware",
  "Fake Websites",
  "UPI Scams",
  "Online Fraud",
  "Email Security",
  "Password Security",
  "MFA",
  "Privacy",
  "Social Media Security",
  "AI Scams",
  "Deepfakes",
  "Identity Theft",
  "Cybercrime Reporting",
  "Safe Digital Behaviour",
];

const initialForm = {
  collegeName: "",
  contactPerson: "",
  designation: "",
  email: "",
  phone: "",
  numberOfStudents: "",
  programRequired: "",
  preferredDate: "",
  venue: "",
  requirements: "",
};

export default function Campus() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccess(false);
    setErrorMessage("");

    if (!form.collegeName.trim()) {
      setErrorMessage("Please enter your college name.");
      return;
    }

    if (!form.contactPerson.trim()) {
      setErrorMessage("Please enter the contact person's name.");
      return;
    }

    if (!form.designation.trim()) {
      setErrorMessage("Please enter the contact person's designation.");
      return;
    }

    if (!form.email.trim()) {
      setErrorMessage("Please enter an email address.");
      return;
    }

    if (!form.numberOfStudents || Number(form.numberOfStudents) <= 0) {
      setErrorMessage("Please enter a valid number of students.");
      return;
    }

    if (!form.programRequired) {
      setErrorMessage("Please select a program.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.rpc("submit_campus_request", {
        p_college_name: form.collegeName.trim(),
        p_contact_person: form.contactPerson.trim(),
        p_designation: form.designation.trim(),
        p_email: form.email.trim(),
        p_phone: form.phone.trim() || null,
        p_number_of_students: Number(form.numberOfStudents),
        p_program_required: form.programRequired,
        p_preferred_date: form.preferredDate || null,
        p_venue: form.venue.trim() || null,
        p_requirements: form.requirements.trim() || null,
      });

      if (error || !data) {
        setErrorMessage("Something went wrong. Please try again.");
        return;
      }

      setForm(initialForm);
      setSuccess(true);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="campus-page">
      <section className="campus-hero">
        <div className="container campus-hero-grid">
          <div className="campus-hero-copy">
            <p className="campus-eyebrow">
              NISQ VANGUARD · CAMPUS SECURITY
            </p>

            <h1>Building a Cyber-Aware Campus.</h1>

            <p className="campus-hero-description">
              Practical cybersecurity education for students, faculty and
              institutions — helping campuses understand digital threats and
              build safer digital habits.
            </p>

            <div className="campus-hero-actions">
              <a href="#campus-request" className="campus-primary-button">
                PLAN A CAMPUS PROGRAM
                <ArrowRight size={17} />
              </a>

              <a href="#campus-programs" className="campus-secondary-button">
                EXPLORE PROGRAMS
                <ArrowRight size={17} />
              </a>
            </div>

            <div className="campus-hero-metrics">
              <div>
                <strong>EDUCATE</strong>
                <span>Build awareness</span>
              </div>

              <div>
                <strong>ENGAGE</strong>
                <span>Practice safely</span>
              </div>

              <div>
                <strong>EMPOWER</strong>
                <span>Strengthen resilience</span>
              </div>
            </div>
          </div>

          <div
            className="campus-architecture"
            aria-label="Campus security architecture"
          >
            <div className="campus-architecture-header">
              <span>CYBERSECURE CAMPUS</span>
              <span>ACTIVE PROGRAM</span>
            </div>

            <div className="campus-architecture-core">
              <div className="campus-node campus-node-top">
                <span>STUDENTS</span>
              </div>

              <div className="campus-architecture-lines">
                <span />
              </div>

              <div className="campus-core-box">
                <ShieldCheck size={30} />
                <strong>CAMPUS SECURITY</strong>
                <span>People · Process · Practice</span>
              </div>

              <div className="campus-architecture-lines bottom">
                <span />
              </div>

              <div className="campus-node-row">
                <div className="campus-node">
                  <span>FACULTY</span>
                </div>

                <div className="campus-node">
                  <span>LEARNING</span>
                </div>

                <div className="campus-node">
                  <span>INSTITUTION</span>
                </div>
              </div>
            </div>

            <div className="campus-architecture-footer">
              <span>EDUCATE</span>
              <span>ASSESS</span>
              <span>DEFEND</span>
            </div>
          </div>
        </div>
      </section>

      <section className="campus-section campus-section-secondary">
        <div className="container campus-intro-grid">
          <div>
            <p className="campus-eyebrow">WHY CAMPUS SECURITY MATTERS</p>

            <h2>
              Cybersecurity education should become part of everyday digital
              behaviour.
            </h2>
          </div>

          <div className="campus-intro-copy">
            <p>
              Educational institutions are connected environments where
              students, faculty, systems and digital services interact every
              day.
            </p>

            <p>
              Our campus programs focus on practical awareness rather than
              abstract theory — helping participants recognise threats,
              respond responsibly and develop safer digital habits.
            </p>
          </div>
        </div>
      </section>

      <section
        id="campus-programs"
        className="campus-section campus-programs-section"
      >
        <div className="container">
          <div className="campus-section-heading">
            <div>
              <p className="campus-eyebrow">CAMPUS PROGRAMS</p>
              <h2>Programs designed for different campus needs.</h2>
            </div>

            <p>
              Choose a focused awareness session or build a broader
              cybersecurity program around your institution's requirements.
            </p>
          </div>

          <div className="campus-program-grid">
            {programs.map((program) => {
              const Icon = program.icon;

              return (
                <article className="campus-program-card" key={program.number}>
                  <div className="campus-program-top">
                    <span>{program.number}</span>
                    <Icon size={21} />
                  </div>

                  <h3>{program.title}</h3>

                  <p>{program.description}</p>

                  <span className="campus-card-line" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="campus-section campus-awareness-section">
        <div className="container">
          <div className="campus-awareness-grid">
            <div>
              <p className="campus-eyebrow">AWARENESS TOPICS</p>

              <h2>Cover the threats people actually encounter.</h2>

              <p className="campus-awareness-description">
                Programs can be adapted to student, faculty, technical or
                institution-wide audiences.
              </p>
            </div>

            <div className="campus-topic-grid">
              {awarenessTopics.map((topic) => (
                <div className="campus-topic" key={topic}>
                  <CheckCircle2 size={17} />
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="campus-section campus-approach-section">
        <div className="container">
          <div className="campus-section-heading">
            <div>
              <p className="campus-eyebrow">OUR APPROACH</p>
              <h2>From awareness to lasting behaviour.</h2>
            </div>
          </div>

          <div className="campus-approach-grid">
            <article>
              <span>01</span>
              <h3>EDUCATE</h3>
              <p>
                Establish a practical understanding of cybersecurity threats
                and responsible digital behaviour.
              </p>
            </article>

            <article>
              <span>02</span>
              <h3>ENGAGE</h3>
              <p>
                Reinforce concepts through workshops, challenges,
                demonstrations and practical activities.
              </p>
            </article>

            <article>
              <span>03</span>
              <h3>EMPOWER</h3>
              <p>
                Help participants develop the confidence to identify and
                respond to common cyber risks.
              </p>
            </article>

            <article>
              <span>04</span>
              <h3>CONTINUE</h3>
              <p>
                Build cybersecurity awareness into the institution's ongoing
                digital safety culture.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        id="campus-request"
        className="campus-section campus-request-section"
      >
        <div className="container campus-request-grid">
          <div className="campus-request-intro">
            <p className="campus-eyebrow">PLAN A CAMPUS PROGRAM</p>

            <h2>
              Let's design the right cybersecurity program for your campus.
            </h2>

            <p>
              Tell us about your institution, audience and preferred program.
              Our team can use these details to understand the requirement and
              follow up appropriately.
            </p>

            <div className="campus-request-note">
              <ShieldCheck size={21} />

              <div>
                <strong>Secure submission</strong>

                <span>
                  Your request is securely submitted to the NISQ Vanguard
                  platform.
                </span>
              </div>
            </div>
          </div>

          <div className="campus-form-card">
            {success ? (
              <div className="campus-success">
                <div className="campus-success-icon">
                  <CheckCircle2 size={30} />
                </div>

                <p className="campus-eyebrow">REQUEST RECEIVED</p>

                <h3>Your campus program request has been submitted.</h3>

                <p>
                  Thank you for contacting NISQ Vanguard. Our team will review
                  your requirements and follow up with you.
                </p>

                <button
                  type="button"
                  className="campus-secondary-button"
                  onClick={() => setSuccess(false)}
                >
                  SUBMIT ANOTHER REQUEST
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="campus-form">
                <div className="campus-form-heading">
                  <p className="campus-eyebrow">CAMPUS REQUEST</p>

                  <h3>Tell us what your institution needs.</h3>
                </div>

                <div className="campus-form-grid">
                  <label>
                    College Name *
                    <input
                      name="collegeName"
                      value={form.collegeName}
                      onChange={handleChange}
                      placeholder="Your college or institution"
                      required
                    />
                  </label>

                  <label>
                    Contact Person *
                    <input
                      name="contactPerson"
                      value={form.contactPerson}
                      onChange={handleChange}
                      placeholder="Full name"
                      required
                    />
                  </label>

                  <label>
                    Designation *
                    <input
                      name="designation"
                      value={form.designation}
                      onChange={handleChange}
                      placeholder="Your designation"
                      required
                    />
                  </label>

                  <label>
                    Email *
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="name@institution.edu"
                      required
                    />
                  </label>

                  <label>
                    Phone
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91"
                    />
                  </label>

                  <label>
                    Number of Students *
                    <input
                      type="number"
                      min="1"
                      name="numberOfStudents"
                      value={form.numberOfStudents}
                      onChange={handleChange}
                      placeholder="e.g. 250"
                      required
                    />
                  </label>

                  <label>
                    Program Required *
                    <select
                      name="programRequired"
                      value={form.programRequired}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a program</option>

                      {programs.map((program) => (
                        <option key={program.number} value={program.title}>
                          {program.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Preferred Date
                    <input
                      type="date"
                      name="preferredDate"
                      value={form.preferredDate}
                      onChange={handleChange}
                    />
                  </label>

                  <label className="campus-form-full">
                    Venue
                    <input
                      name="venue"
                      value={form.venue}
                      onChange={handleChange}
                      placeholder="Campus / auditorium / online"
                    />
                  </label>

                  <label className="campus-form-full">
                    Requirements
                    <textarea
                      name="requirements"
                      value={form.requirements}
                      onChange={handleChange}
                      placeholder="Tell us about your audience, objectives or any specific requirements."
                      rows={5}
                    />
                  </label>
                </div>

                {errorMessage && (
                  <div className="campus-form-error" role="alert">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="campus-primary-button campus-submit-button"
                  disabled={loading}
                >
                  {loading ? "SUBMITTING..." : "SUBMIT CAMPUS REQUEST"}

                  {!loading && <ArrowRight size={17} />}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}