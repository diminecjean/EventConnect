import {
  Linkedin,
  Twitter,
  Instagram,
  Github,
  Facebook,
  Globe,
} from "lucide-react";

type SocialMedia = {
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  github?: string;
  facebook?: string;
  website?: string;
};

interface SocialMediaLinksProps {
  socialMedia: SocialMedia | null | undefined;
}

const socialMediaConfig = [
  {
    key: "linkedin",
    icon: Linkedin,
    hoverClass: "hover:text-blue-500",
    label: "LinkedIn",
  },
  {
    key: "twitter",
    icon: Twitter,
    hoverClass: "hover:text-blue-400",
    label: "Twitter",
  },
  {
    key: "instagram",
    icon: Instagram,
    hoverClass: "hover:text-pink-500",
    label: "Instagram",
  },
  {
    key: "github",
    icon: Github,
    hoverClass: "hover:text-gray-200",
    label: "GitHub",
  },
  {
    key: "facebook",
    icon: Facebook,
    hoverClass: "hover:text-blue-600",
    label: "Facebook",
  },
  {
    key: "website",
    icon: Globe,
    hoverClass: "hover:text-green-400",
    label: "Website",
  },
];

export default function SocialMediaLinks({
  socialMedia,
}: SocialMediaLinksProps) {
  if (!socialMedia) return null;

  return (
    <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
      {socialMediaConfig.map((item) => {
        const url = socialMedia[item.key as keyof SocialMedia];
        if (!url) return null;

        const Icon = item.icon;

        return (
          <a
            key={item.key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-gray-400 ${item.hoverClass} transition-colors`}
          >
            <Icon size={18} />
            <span className="sr-only">{item.label}</span>
          </a>
        );
      })}
    </div>
  );
}
