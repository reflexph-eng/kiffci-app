import Image from 'next/image';
import Link from 'next/link';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  href?: string;
}

const SIZES = {
  sm: { img: 32, text: 18 },
  md: { img: 40, text: 22 },
  lg: { img: 56, text: 28 },
};

export default function Logo({ size = 'md', showTagline = false, href = '/' }: Props) {
  const s = SIZES[size];
  const content = (
    <div className="flex items-center gap-2.5">
      <img
        src="/logo.png"
        alt="Kiffci"
        width={s.img}
        height={s.img}
        style={{ objectFit: 'contain' }}
      />
      {showTagline && (
        <div>
          <p className="font-display font-bold leading-none" style={{ fontSize: s.text }}>kiffci</p>
          <p className="text-xs text-gray-400 tracking-widest" style={{ fontSize: 9 }}>VIS · EXPLORE · KIFFE</p>
        </div>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="flex items-center hover:opacity-85 transition-opacity">
      {content}
    </Link>
  ) : <div className="flex items-center">{content}</div>;
}
