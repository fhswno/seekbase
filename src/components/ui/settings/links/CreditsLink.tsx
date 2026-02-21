// NEXT
import Link from "next/link";

// LUCIDE
import { ExternalLink } from "lucide-react";

// TYPESCRIPT
type Props = {
  href: string;
  label: string;
};

const CreditsLink = ({ href, label }: Props) => {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-accent transition-colors duration-[80ms] hover:text-accent-light"
    >
      {label}
      <ExternalLink size={11} />
    </Link>
  );
};

export default CreditsLink;
