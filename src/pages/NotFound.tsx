import { ButtonLink, Container } from "../components/ui";
import { usePageMeta } from "../hooks/usePageMeta";

export default function NotFound() {
  usePageMeta("Page not found");

  return (
    <Container className="py-32 text-center">
      <p className="font-serif text-8xl text-gold sm:text-9xl">404</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">This page does not exist.</h1>
      <p className="mx-auto mt-6 max-w-md text-mist">
        The link may be broken, or the page may have moved.
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <ButtonLink to="/">Back to home</ButtonLink>
        <ButtonLink to="/projects" variant="ghost">
          View projects
        </ButtonLink>
      </div>
    </Container>
  );
}