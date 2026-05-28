import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { qrT } from '../i18n/qrLocales';
import 'swiper/css';
import 'swiper/css/pagination';
import { mediaUrl } from '../../utils/mediaUrl';

const HeroSlider = ({ images, name, data, settings, lang = 'az' }) => {
  if (images === undefined && !name) {
    return (
      <div className="space-y-4 bg-[#f2f2f7] px-4 pb-4 pt-4 dark:bg-black">
        <p className="h-16 animate-pulse rounded-2xl bg-gray-200 dark:bg-[#1C1C1E]" />
        <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-gray-200 dark:bg-[#1C1C1E]" />
      </div>
    );
  }

  const displayName = name || data?.nameAz || data?.name || '';
  const logoPath = data?.logo || data?.Logo || settings?.logo || settings?.Logo || '';
  const logoUrl = mediaUrl(logoPath);
  const serviceCharge = Number(settings?.serviceChargePercent ?? settings?.ServiceChargePercent ?? 0);
  const slides = images && images.length > 0 ? images : [];
  const hasImages = slides.length > 0;
  const multi = slides.length > 1;

  return (
    <div className="bg-[#f2f2f7] pb-4 pt-4 transition-colors dark:bg-black">
      <div className="mx-auto flex max-w-lg items-center gap-4 px-4 pb-4">
        <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-gray-200 dark:bg-[#1C1C1E] dark:ring-white/10">
          {logoUrl ? (
            <img src={logoUrl} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-black uppercase text-[#FFA540]">
              {displayName.charAt(0) || '?'}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold leading-tight text-gray-900 dark:text-white">
            {displayName}
          </h1>
          {serviceCharge > 0 ? (
            <p className="mt-1 text-sm text-gray-500 dark:text-[#8E8E93]">
              {qrT(lang, 'serviceFeeLabel')}: {serviceCharge}%
            </p>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4">
        {hasImages ? (
          <div className="overflow-hidden rounded-2xl bg-gray-200 shadow-sm ring-1 ring-gray-200/80 dark:bg-[#1C1C1E] dark:ring-white/10">
            <Swiper
              modules={[Autoplay, Pagination]}
              speed={500}
              loop={multi}
              grabCursor
              allowTouchMove
              touchRatio={1}
              autoplay={
                multi
                  ? { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }
                  : false
              }
              pagination={{ clickable: true, dynamicBullets: multi }}
              className="qr-hero-swiper aspect-[4/3] w-full"
            >
              {slides.map((img, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={mediaUrl(img)}
                    className="h-full w-full object-cover"
                    alt={displayName}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/80 dark:bg-[#1C1C1E] dark:ring-white/10">
            <span className="px-6 text-center text-lg font-bold text-gray-400 dark:text-white/40">
              {displayName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSlider;
