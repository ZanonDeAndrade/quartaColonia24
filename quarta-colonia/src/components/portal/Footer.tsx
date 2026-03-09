import { Facebook, Instagram } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="qc-footer-bleed mt-4 border-t border-primary-foreground/20 bg-primary text-primary-foreground">
      <div className="grid w-full grid-cols-1 gap-3 px-4 py-3 md:grid-cols-[1fr_0.72fr_140px_1fr] md:items-center md:gap-4 md:px-6 lg:px-8">
        <section aria-labelledby="footer-about-title">
          <h3 className="mb-1 text-base font-semibold" id="footer-about-title">
            Quarta Colônia 24 Horas
          </h3>
          <p className="break-words text-sm leading-5 text-primary-foreground/80">
            O portal de noticias mais completo da sua regiao. Informacao com credibilidade.
          </p>
        </section>

        <section aria-labelledby="footer-contact-title" className="md:max-w-[320px]">
          <h3 className="mb-1 text-base font-semibold" id="footer-contact-title">
            Contato
          </h3>
          <p>
            <a
              aria-label="Enviar e-mail para contato"
              className="break-all text-sm text-primary-foreground/80 transition-colors duration-200 hover:text-primary-foreground"
              href="mailto:quartacolonia24horas@gmail.com"
            >
              quartacolonia24horas@gmail.com
            </a>
          </p>

        </section>

        <section
          aria-label="Redes sociais"
          className="flex justify-center md:justify-self-center md:self-center md:-ml-16 lg:-ml-20"
        >
          <h3 className="sr-only">Redes sociais</h3>
          <div className="flex gap-3">
            <a
              aria-label="Instagram"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary-foreground/30 text-primary-foreground/90 transition-colors duration-200 hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              href="https://www.instagram.com/qc24horas?igsh=OGdzb2xjdHowZHVh"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Instagram size={20} />
            </a>
            <a
              aria-label="Facebook"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary-foreground/30 text-primary-foreground/90 transition-colors duration-200 hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              href="https://www.facebook.com/people/Quarta-Col%C3%B4nia-24-Horas/61587779258992/?rdid=RAxvw9UO8e1tFdmH&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1EFmDj19FF%2F"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Facebook size={20} />
            </a>
          </div>
        </section>

        <section aria-labelledby="footer-advertise-title">
          <h3 className="mb-1 text-base font-semibold" id="footer-advertise-title">
            Anuncie Conosco
          </h3>
          <p className="break-words text-sm leading-5 text-primary-foreground/80">
            Divulgue sua empresa para os leitores da regiao. Entre em contato para conhecer nossos pacotes.
          </p>
        </section>
      </div>

      <div className="w-full border-t border-primary-foreground/20 px-4 py-2 text-center text-xs text-primary-foreground/60 md:px-6 lg:px-8">
        &copy; {currentYear} Quarta Colônia 24H. Todos os direitos reservados.
      </div>
    </footer>
  );
}
