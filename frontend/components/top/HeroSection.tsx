export default function HeroSection() {
  return (
    <section className="relative overflow-hidden text-center pb-2">
      {/* 背景の装飾円 */}
      <div className="absolute top-2 right-2 w-20 h-20 rounded-full bg-accent/10 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-14 h-14 rounded-full bg-primary/10 pointer-events-none" />
      <div className="absolute top-10 right-16 w-8 h-8 rounded-full bg-accent/15 pointer-events-none" />
     
      <div className="flex justify-center mb-3">
        <svg width="230" height="210" viewBox="-10 0 250 210" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="wc1" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="2" result="noise"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
              <feGaussianBlur in="displaced" stdDeviation="2.5" result="blurred"/>
              <feComposite in="blurred" in2="SourceGraphic" operator="over"/>
            </filter>
            <filter id="wc2" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="8" result="noise"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
              <feGaussianBlur in="displaced" stdDeviation="2" result="blurred"/>
            </filter>
            <filter id="wc3" x="-30%" y="-30%" width="160%" height="160%">
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="5" result="noise"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
              <feGaussianBlur in="displaced" stdDeviation="1.5"/>
            </filter>
          </defs>
          <ellipse cx="118" cy="95" rx="120" ry="88"
            fill="#EDE0F5" fillOpacity="0.75"
            filter="url(#wc1)"/>
          <ellipse cx="148" cy="72" rx="48" ry="44"
            fill="#FFD6E8" fillOpacity="0.6"
            filter="url(#wc2)"/>
          <ellipse cx="72" cy="118" rx="28" ry="24"
            fill="#D4C4F0" fillOpacity="0.5"
            filter="url(#wc3)"/>
          <ellipse cx="175" cy="108" rx="16" ry="14"
            fill="#FFE4F0" fillOpacity="0.65"
            filter="url(#wc3)"/>
          <text x="118" y="88" textAnchor="middle"
            fontFamily="'Zen Maru Gothic', sans-serif"
            fontSize="35" fontWeight="750" fill="#7C6FD4">
            プログ<tspan fill="#FFB347">ミ</tspan>
          </text>
          <text x="118" y="108" textAnchor="middle"
            fontFamily="'DM Sans', sans-serif"
            fontSize="16" fill="#7C6FD4" letterSpacing="4">
            Progumi
          </text>
        </svg>
      </div>
      <p className="text-sm text-foreground leading-relaxed">
        IT用語を学習するための<br />
        <span className="text-primary font-semibold">学習支援アプリ</span>
      </p>
    </section>
  );
}