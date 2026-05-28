import React from 'react';
import { FiInstagram, FiPhone, FiMapPin, FiChevronRight } from 'react-icons/fi';
import { FaWhatsapp, FaTiktok } from 'react-icons/fa';
import { qrT } from '../i18n/qrLocales';

function formatPhone(phoneNumber) {
  if (!phoneNumber) return '';
  const cleaned = String(phoneNumber).replace(/\D/g, '');
  const match = cleaned.match(/^(994|0)?(50|51|55|70|77|99|10)(\d{3})(\d{2})(\d{2})$/);
  if (match) return `+994 ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
  return String(phoneNumber).trim();
}

function waDigits(phone) {
  const d = String(phone || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('994')) return d;
  if (d.startsWith('0')) return `994${d.slice(1)}`;
  return d;
}

function ContactRow({ href, label, value, icon, external, borderBottom }) {
  const inner = (
    <>
      {icon}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-[#8E8E93]">{label}</p>
        <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      <FiChevronRight className="shrink-0 text-gray-400 dark:text-[#8E8E93]" size={18} />
    </>
  );

  const cls = `flex items-center gap-3 px-4 py-4 transition active:bg-gray-50 dark:active:bg-white/5 ${
    borderBottom ? 'border-b border-gray-100 dark:border-white/10' : ''
  }`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <a href={href} className={cls}>
      {inner}
    </a>
  );
}

export default function QrSocialAndMap({ lang, settings, company, darkMode = false }) {
  const contacts = [
    {
      key: 'p1',
      number: company?.phone1 || company?.phoneNumber1,
      whatsapp: Boolean(settings?.phone1HasWhatsApp ?? settings?.Phone1HasWhatsApp),
    },
    {
      key: 'p2',
      number: company?.phone2 || company?.phoneNumber2,
      whatsapp: Boolean(settings?.phone2HasWhatsApp ?? settings?.Phone2HasWhatsApp),
    },
    {
      key: 'p3',
      number: company?.phone3 || company?.phoneNumber3,
      whatsapp: Boolean(settings?.phone3HasWhatsApp ?? settings?.Phone3HasWhatsApp),
    },
  ].filter((c) => c.number);

  const callContacts = contacts.filter((c) => !c.whatsapp);
  const whatsappContacts = contacts.filter((c) => c.whatsapp);

  const instagram = settings?.instagramUrl || settings?.InstagramUrl || '';
  const tiktok = settings?.tiktokUrl || settings?.TiktokUrl || '';
  const mapUrlRaw = settings?.mapLocationUrl || settings?.MapLocationUrl || '';
  const address =
    company?.address ||
    company?.addressAz ||
    company?.Address ||
    company?.AddressAz ||
    '';

  let mapEmbed = '';
  if (mapUrlRaw) {
    let url = String(mapUrlRaw).trim();
    if (url.startsWith('/')) url = url.substring(1);
    if (!url.startsWith('http')) url = `https://${url}`;
    mapEmbed = url;
  }

  const socialRows = [
    ...callContacts.map((c) => ({
      key: `call-${c.key}`,
      kind: 'call',
      href: `tel:${c.number}`,
      label: qrT(lang, 'call'),
      value: formatPhone(c.number),
    })),
    ...whatsappContacts.map((c) => ({
      key: `wa-${c.key}`,
      kind: 'whatsapp',
      href: `https://wa.me/${waDigits(c.number)}`,
      label: qrT(lang, 'whatsapp'),
      value: formatPhone(c.number),
      external: true,
    })),
    ...(instagram
      ? [{
          key: 'instagram',
          kind: 'instagram',
          href: instagram,
          label: 'Instagram',
          value: 'Instagram',
          external: true,
        }]
      : []),
    ...(tiktok
      ? [{ key: 'tiktok', kind: 'tiktok', href: tiktok, label: 'TikTok', value: 'TikTok', external: true }]
      : []),
  ];

  const hasSocial = socialRows.length > 0;
  const hasMap = Boolean(address || mapEmbed);

  if (!hasSocial && !hasMap) return null;

  const rowIcon = (kind) => {
    if (kind === 'call') {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white">
          <FiPhone size={18} />
        </div>
      );
    }
    if (kind === 'whatsapp') {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white">
          <FaWhatsapp size={22} />
        </div>
      );
    }
    if (kind === 'instagram') {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white">
          <FiInstagram size={20} />
        </div>
      );
    }
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white ring-1 ring-white/20">
        <FaTiktok size={20} />
      </div>
    );
  };

  return (
    <div className="mt-6 space-y-6">
      {hasSocial ? (
        <section>
          <h3 className="mb-2 px-1 text-sm font-bold text-gray-900 dark:text-white">
            {qrT(lang, 'social')}
          </h3>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/80 dark:bg-[#1C1C1E] dark:ring-0">
            {socialRows.map((row, idx) => (
              <ContactRow
                key={row.key}
                href={row.href}
                label={row.label}
                value={row.value}
                icon={rowIcon(row.kind)}
                external={row.external}
                borderBottom={idx < socialRows.length - 1}
              />
            ))}
          </div>
        </section>
      ) : null}

      {hasMap ? (
        <section>
          <h3 className="mb-2 px-1 text-sm font-bold text-gray-900 dark:text-white">
            {qrT(lang, 'location')}
          </h3>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/80 dark:bg-[#1C1C1E] dark:ring-0">
            <div className="flex items-start gap-3 border-b border-gray-100 px-4 py-4 dark:border-white/10">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500 dark:bg-red-500/15 dark:text-red-400">
                <FiMapPin size={20} />
              </div>
              <p className="flex-1 text-sm font-semibold leading-snug text-gray-900 dark:text-white">
                {address || qrT(lang, 'addressLoading')}
              </p>
            </div>
            {mapEmbed ? (
              <div
                className={`relative aspect-[4/3] w-full overflow-hidden ${
                  darkMode ? 'bg-[#0d0d0d]' : 'bg-[#e8e8e8]'
                }`}
              >
                <iframe
                  src={mapEmbed}
                  title={qrT(lang, 'location')}
                  className={`absolute inset-0 h-full w-full border-0 ${
                    darkMode ? 'qr-map-iframe-dark scale-[1.02]' : ''
                  }`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="flex aspect-[2/1] items-center justify-center text-xs font-bold text-gray-400 dark:text-[#8E8E93]">
                {qrT(lang, 'mapMissing')}
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
