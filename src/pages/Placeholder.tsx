import { ButtonLink, Container } from "../components/ui";

export default function Placeholder({
  title,
  message = "This page is being built and will be available soon.",
}: {
  title: string;
  message?: string;
}) {
  return (
    <Container className="py-32 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">Coming soon</p>
      <h1 className="mt-5 text-5xl sm:text-6xl">{title}</h1>
      <p className="mx-auto mt-6 max-w-md text-mist">{message}</p>
      <div className="mt-10 flex justify-center">
        <ButtonLink to="/" variant="ghost">
          Back to home
        </ButtonLink>
      </div>
    </Container>
  );
}