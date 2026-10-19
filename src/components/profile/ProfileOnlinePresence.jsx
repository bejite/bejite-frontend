import React from "react";
import { FaGlobe, FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa";
import SectionLabel from "./SectionLabel";
import ProfileDetailRow from "./ProfileDetailRow";

const toExternalHref = (url) => {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

/**
 * Online Presence section displaying social and website links for recruiters/users.
 */
const ProfileOnlinePresence = ({ profileData }) => {
  if (!profileData) return null;

  const recruiterLinks = profileData.links || {};
  const linkedinUrl =
    profileData.linkedin_url || recruiterLinks.linkedin || null;
  const twitterUrl = profileData.twitter_url || recruiterLinks.twitter || null;
  const instagramUrl =
    profileData.instagram_url || recruiterLinks.instagram || null;

  return (
    <section className="p-6 sm:p-8">
      <SectionLabel tone="#16730F">Online Presence</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
        <ProfileDetailRow
          icon={FaGlobe}
          label="Website"
          value={profileData.website}
          href={toExternalHref(profileData.website)}
          preserveCase
        />
        <ProfileDetailRow
          icon={FaLinkedin}
          label="LinkedIn"
          value={linkedinUrl}
          href={toExternalHref(linkedinUrl)}
          preserveCase
        />
        <ProfileDetailRow
          icon={FaTwitter}
          label="X (Twitter)"
          value={twitterUrl}
          href={toExternalHref(twitterUrl)}
          preserveCase
        />
        <ProfileDetailRow
          icon={FaInstagram}
          label="Instagram"
          value={instagramUrl}
          href={toExternalHref(instagramUrl)}
          preserveCase
        />
      </div>
    </section>
  );
};

export default ProfileOnlinePresence;
