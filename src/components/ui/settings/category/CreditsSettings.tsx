// NEXT
import Link from "next/link";

// COMPONENTS
import SettingSectionHeader from "../headers/SettingSectionHeader";
import CreditsLink from "../links/CreditsLink";

// DATA
import { CREDIT_LINKS } from "@/data/settings";

const CreditsSettings = () => {
  return (
    <div>
      <SettingSectionHeader
        title="Credits"
        description="The people and projects behind Seekbase"
      />

      {/* CREATED */}
      <div className="mb-6 rounded-lg border border-border p-4">
        <h4 className="text-sm font-semibold text-text">Created by</h4>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-lg font-bold text-accent">
            D
          </div>
          <div>
            <p className="text-sm font-medium text-text">Dave Ohayon</p>
            <div className="mt-0.5 flex items-center gap-3 text-xs">
              <CreditsLink href="https://davidohayon.uk" label="Website" />
              <CreditsLink href="https://github.com/fhswno" label="GitHub" />
              <CreditsLink href="https://x.com/fhswno" label="X / Twitter" />
            </div>
          </div>
        </div>
      </div>

      {/* BUILT WITH */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-semibold text-text">Built with</h4>
        <div className="grid grid-cols-2 gap-2">
          {CREDIT_LINKS.map(
            (
              tech: { name: string; desc: string; url: string },
              index: number,
            ) => (
              <Link
                key={index}
                href={tech.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 rounded-md border border-border p-2 transition-colors duration-[80ms] hover:bg-surface-2"
              >
                <div>
                  <p className="text-xs font-medium text-text group-hover:text-accent">
                    {tech.name}
                  </p>
                  <p className="text-[10px] text-text-faint">{tech.desc}</p>
                </div>
              </Link>
            ),
          )}
        </div>
      </div>

      {/* SPECIAL THANKS */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-text">Special thanks</h4>
        <p className="text-xs leading-relaxed text-text-muted">
          To the open-source community for building the incredible tools that
          make Seekbase possible. To the teams at The Browser Company, Linear,
          and Notion for setting the bar on craft and design. And to everyone
          who has provided feedback and believed in this project from day one.
        </p>
      </div>
    </div>
  );
};

export default CreditsSettings;
