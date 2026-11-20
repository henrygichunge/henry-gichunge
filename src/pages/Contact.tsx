import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "../components/ui";
import PageHeader from "../components/PageHeader";
import ContactForm from "../components/ContactForm";
import { TextSkeleton } from "../components/Skeleton";
import { usePageMeta } from "../hooks/usePageMeta";
import { useSite } from "../hooks/useSiteContent";
import { contactContent } from "../data/content";

export default function Contact() {
  usePageMeta("Contact", "Contact Henry Gichunge about projects, collaboration or education technology.");

  const { data, loading } = useSite();
  const contact = data?.contact;
  const socials = data?.socials ?? [];

  const details = [
    { icon: Mail, label: "Email", value: contact?.email ?? "" },
    { icon: Phone, label: "Phone", value: contact?.phone ?? "" },
    { icon: MapPin, label: "Location", value: contact?.location ?? "" },
  ];

  return (
    <>
      <PageHeader eyebrow="Contact" title="Let's talk." intro={contactContent.intro} />

      <section className="py-16 sm:py-24">
        <Container className="grid gap-14 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-5">
            {loading ? (
              <TextSkeleton lines={5} label="Loading contact details" />
            ) : (
              <>
                <ul className="space-y-6">
                  {details.map(({ icon: Icon, label, value }) => (
                    <li key={label} className="flex items-start gap-4">
                      <Icon size={22} className="mt-1 text-gold" strokeWidth={1.5} />
                      <div>
                        <p className="text-xs uppercase tracking-widest text-mist">{label}</p>
                        <p className={value ? "mt-1" : "mt-1 text-sm text-mist"}>{value || "To be added"}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div>
                  <p className="text-xs uppercase tracking-widest text-mist">Social</p>
                  {socials.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {socials.map((s) => (
                        <li key={s.url}>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gold transition-colors hover:text-ivory"
                          >
                            {s.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-mist">Social links will be added.</p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </Container>
      </section>
    </>
  );
}