import { CertificateViewLink } from '../../CertificateViewerModal';

export const DetailItem = ({ label, value }) => {
  if (value == null || value === '') return null;
  return (
    <div className="rounded-lg border border-gray-100 bg-[#F9FAF8] px-4 py-3 min-w-0">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#1A3E32] break-words">{value}</p>
    </div>
  );
};

export const ProfileSection = ({ title, children }) => (
  <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
    {title ? (
      <h2 className="text-lg sm:text-xl font-semibold text-[#1A3E32] mb-4">{title}</h2>
    ) : null}
    {children}
  </section>
);

export function AccountDetailsSection({ items }) {
  if (!items.length) return null;

  return (
    <ProfileSection title="Account details">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <DetailItem key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </ProfileSection>
  );
}

export function AboutSection({ bio }) {
  if (!bio) return null;

  return (
    <ProfileSection title="About">
      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">{bio}</p>
    </ProfileSection>
  );
}

export function OnlinePresenceSection({ items }) {
  if (!items.length) return null;

  return (
    <ProfileSection title="Online presence">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-gray-100 bg-[#F9FAF8] px-4 py-3 min-w-0"
          >
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {item.label}
            </p>
            <a
              href={
                String(item.value).startsWith('http')
                  ? item.value
                  : `https://${item.value}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 text-sm font-semibold text-[#16730F] hover:underline break-all"
            >
              {item.value}
            </a>
          </div>
        ))}
      </div>
    </ProfileSection>
  );
}

export function VerificationDocumentsSection({
  userId,
  profileUser,
  documentTypeLabel,
  documentTitle,
  viewLinkLabel,
  emptyDocumentLabel = 'No document uploaded.',
}) {
  return (
    <ProfileSection title="Verification documents">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <DetailItem label="Document type" value={documentTypeLabel} />
        <DetailItem
          label="Verification consent"
          value={profileUser?.verification_consent ? 'Yes' : 'No'}
        />
      </div>
      {profileUser?.id_document ? (
        <CertificateViewLink
          fileUrl={profileUser.id_document}
          fetchUrl={`/api/admin/data/users/${userId}/id-document/view`}
          title={documentTitle}
          className="inline-flex items-center text-sm font-medium text-[#16730F] hover:underline"
        >
          {viewLinkLabel}
        </CertificateViewLink>
      ) : (
        <p className="text-sm text-gray-500">{emptyDocumentLabel}</p>
      )}
    </ProfileSection>
  );
}
