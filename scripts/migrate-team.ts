import { readFile } from "fs/promises";
import path from "path";

import "@/lib/cms/collections";
import { connectToDatabase } from "@/lib/db";
import { uploadMedia } from "@/lib/cms/media";
import { snapshotVersion } from "@/lib/cms/version-history";
import { TeamMember } from "@/models/team-member";
import { User } from "@/models/user";

/**
 * One-time content migration, following the same pattern as
 * `migrate-content.ts` (Bhatkal Time Luxe / IoT Sensor Dashboard): moves the
 * five founder profiles already written and approved in `team/*.md` into
 * real, published `TeamMember` documents. Bios below are condensed directly
 * from each founder's own markdown file — nothing invented. Photos are the
 * real, existing files in `public/team/*.jpg` as-is; unifying them into one
 * photographic art direction (`DESIGN/NEXT/CREATIVE_DIRECTION.md` §10) is
 * separate, later production work — this migration exists so the site has
 * real people and real words behind it in the meantime, not a placeholder.
 *
 * `socials.email` is schema-required but no real founder email exists yet
 * anywhere in this repo — `firstname@hubzero.dev` is a directional
 * placeholder on the company's own domain, not a claimed working inbox;
 * replace with real addresses before this ever runs against production.
 *
 * Idempotent: safe to re-run (upserts by `username`).
 *
 * Usage: `npm run migrate-team` (after `npm run create-admin`).
 */

interface FounderSeed {
  username: string;
  name: string;
  role: string;
  bio: string;
  photoFile: string;
  isCoreMember: boolean;
}

const founders: FounderSeed[] = [
  {
    username: "rifaque",
    name: "Rifaque Ahmed",
    role: "Chief Executive Officer",
    bio: "Rifaque founded HubZero with the belief that meaningful engineering comes from solving problems that last, building products with care, and creating an environment where ambitious engineers can learn, collaborate, and create technology that genuinely matters. HubZero didn't begin as a company — it started as a small friend group built around gaming, which naturally evolved into a place where we collaborated on small engineering projects and experimented with ideas we wanted to build together. His interests span artificial intelligence, developer tools, infrastructure, cloud architecture, and full-stack engineering, all connected by one goal: reducing complexity and making powerful technology more accessible.",
    photoFile: "rifaque.jpg",
    isCoreMember: true,
  },
  {
    username: "raif",
    name: "Raif Karani",
    role: "Chief Technical Officer",
    bio: "Raif specializes in full-stack web development, scalable backend systems, and modern software architecture. His work focuses on designing systems that remain understandable, maintainable, and reliable as they grow, with a strong belief that simplicity is one of engineering's greatest strengths. Engineering, to him, isn't about writing clever code — it's about creating software that people can confidently build upon. Good architecture should help future engineers, not confuse them.",
    photoFile: "raif.jpg",
    isCoreMember: true,
  },
  {
    username: "iyad",
    name: "Mohammed Iyad",
    role: "Chief Operating Officer",
    bio: "Iyad is an Electronics and Communication Engineering graduate whose work sits at the intersection of intelligent software, embedded hardware, robotics, product design, branding, and organizational systems — disciplines he sees as different parts of the same product journey. His approach is built around three simple ideas: build with purpose, design for people, never stop improving. Alongside building products, he's equally interested in creating the systems, workflows, and partnerships that let a team consistently build meaningful technology.",
    photoFile: "iyad.jpg",
    isCoreMember: true,
  },
  {
    username: "sultan",
    name: "Syed Mohammed Sultan",
    role: "Chief Marketing Officer",
    bio: "Sultan is a software engineer with a strong interest in full-stack development, artificial intelligence, and building software that solves practical business problems. He believes great software should be easy to understand, scalable enough to grow over time, and valuable because it solves real problems rather than showcasing unnecessary technical complexity. Engineering is most rewarding, in his view, when technology becomes useful instead of simply impressive.",
    photoFile: "sultan.jpg",
    isCoreMember: true,
  },
  {
    username: "salsabeel",
    name: "Salsabeel Kobattey",
    role: "VP of Hardware / Chief Financial Officer",
    bio: "Salsabeel is an electronics engineer whose passion lies in understanding technology at its most fundamental level — embedded systems, robotics, VLSI, FPGA design, and computer architecture, with a particular focus on building efficient, reliable hardware that solves real-world problems. Engineering, to him, is about understanding problems before designing solutions: simplifying a difficult problem is evidence of understanding it deeply, and complexity belongs in the engineering process, not in the experience of the people who use what gets built.",
    photoFile: "salsabeel.jpg",
    isCoreMember: true,
  },
];

async function main() {
  await connectToDatabase();

  const admin = await User.findOne({ role: "head_admin" }).sort({ createdAt: 1 });
  if (!admin) {
    console.error('No head_admin account exists yet — run "npm run create-admin" first.');
    process.exit(1);
  }
  const adminId = admin._id.toString();

  for (const founder of founders) {
    const photoPath = path.join(process.cwd(), "public/team", founder.photoFile);
    const buffer = await readFile(photoPath);
    const media = await uploadMedia({
      buffer,
      originalName: founder.photoFile,
      mimeType: "image/jpeg",
      alt: `${founder.name}, ${founder.role} at HubZero`,
      uploadedBy: adminId,
    });

    const doc = await TeamMember.findOneAndUpdate(
      { username: founder.username },
      {
        username: founder.username,
        name: founder.name,
        role: founder.role,
        bio: founder.bio,
        photo: media.id,
        socials: { email: `${founder.username}@hubzero.dev` },
        isCoreMember: founder.isCoreMember,
        profileVisible: true,
        linkedUserId: admin._id,
        status: "published",
        publishedAt: new Date(),
        createdBy: adminId,
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true, runValidators: true },
    );

    await snapshotVersion(
      "teamMember",
      doc!.toObject() as unknown as Record<string, unknown>,
      adminId,
    );
    console.log(`Migrated TeamMember "${founder.username}" (${doc!._id.toString()})`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("Team migration failed:", error);
  process.exit(1);
});
