import React from 'react';
import { buildContactInfoItems } from '../utils/displayFormatUtils';

const isEmailValue = (value) =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const ContactInfoField = ({ label, value, href, fullWidth }) => (
  <div className={`min-w-0 ${fullWidth ? 'sm:col-span-2' : ''}`}>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1.5 text-[#1A3E32] text-sm font-medium leading-relaxed break-words">
      {href ? (
        <a
          href={value.startsWith('http') ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#16730F] hover:underline break-words"
        >
          {value}
        </a>
      ) : isEmailValue(value) ? (
        <a
          href={`mailto:${value}`}
          className="text-[#16730F] hover:underline break-all sm:break-normal"
          title={value}
        >
          {value}
        </a>
      ) : (
        value
      )}
    </dd>
  </div>
);

/**
 * Structured contact block: Phone + Email in two columns, Address full width, then links.
 */
export function ContactInfoSection({
  candidate,
  bio,
  items: itemsProp,
  title = 'Contact info',
  className = '',
}) {
  const items = itemsProp ?? buildContactInfoItems({ candidate, bio });
  if (items.length === 0) return null;

  const primary = items
    .filter((item) => ['Phone', 'Email', 'Address'].includes(item.type))
    .map((item) =>
      item.type === 'Email'
        ? { ...item, fullWidth: true }
        : item,
    );
  const links = items.filter((item) => item.href);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`.trim()}
    >
      <h2 className="text-xl font-semibold text-[#1A3E32] mb-5">{title}</h2>
      <dl className="space-y-5">
        {primary.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            {primary.map((item) => (
              <ContactInfoField
                key={item.type}
                label={item.type}
                value={item.value}
                href={item.href}
                fullWidth={item.fullWidth}
              />
            ))}
          </div>
        )}
        {links.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 pt-1 border-t border-gray-100">
            {links.map((item) => (
              <ContactInfoField
                key={item.type}
                label={item.type}
                value={item.value}
                href={item.href}
              />
            ))}
          </div>
        )}
      </dl>
    </div>
  );
}

export default ContactInfoSection;
