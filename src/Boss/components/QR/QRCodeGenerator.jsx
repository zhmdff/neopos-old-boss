import React, { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { FiDownload, FiInfo, FiMaximize, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

const QR_DISPLAY_SIZE = 300; // Ekranda görünən ölçü

const QRCodeGenerator = ({ slug, companyName }) => {
  const qrRef = useRef(null);
  const qrCodeInstance = useRef(null);
  const [downloading, setDownloading] = useState(false);
  
  const qrUrl = `https://neopos.az/q/${slug}`;
  const logoPath = "/favicon.png"; 

  useEffect(() => {
    // QR Obyektini yaradırıq
    qrCodeInstance.current = new QRCodeStyling({
      width: QR_DISPLAY_SIZE,
      height: QR_DISPLAY_SIZE,
      data: qrUrl,
      image: logoPath,
      margin: 15,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'H' // Loqonun oxunması üçün vacibdir
      },
      imageOptions: {
        hideBackgroundDots: true, // Evo stili: loqonun arxasını təmizləyir
        imageSize: 0.45, // Loqo ölçüsü
        margin: 6, // Loqo ilə piksellər arasındakı dairəvi boşluq
        crossOrigin: 'anonymous',
        saveAsBlob: true
      },
      dotsOptions: {
        color: '#000000',
        type: 'square'
      },
      backgroundOptions: {
        color: '#ffffff',
      },
      cornersSquareOptions: {
        color: '#000000',
        type: 'extra-rounded' // Kənardakı böyük kvadratları dairəvi edir
      },
      cornersDotOptions: {
        color: '#000000',
        type: 'dot'
      }
    });

    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      qrCodeInstance.current.append(qrRef.current);
    }
  }, [qrUrl]);

  // Yükləmə funksiyası (Yüksək DPI sığortası ilə)
  const handleDownload = async (type) => {
    if (!qrCodeInstance.current) return;
    setDownloading(true);
    try {
        if(type === 'simple') {
            // 🔥 KRİSTAL KEYFİYYƏT: Yükləmə anında ölçünü 2000px edirik
            await qrCodeInstance.current.update({ width: 2000, height: 2000 });
            await qrCodeInstance.current.download({ 
                name: `${slug}-neopos-qr`, 
                extension: 'png' 
            });
            // Yükləmədən sonra ekran görüntüsünü geri qaytarırıq
            await qrCodeInstance.current.update({ 
                width: QR_DISPLAY_SIZE, 
                height: QR_DISPLAY_SIZE 
            });
            toast.success("Yüksək keyfiyyətli PNG yükləndi");
        } else {
            // 🔥 SVG hər zaman ən təmizidir (Vektor format)
            await qrCodeInstance.current.download({ 
                name: `${slug}-neopos-sticker`, 
                extension: 'svg' 
            });
            toast.success("Vektor (SVG) formatında yükləndi");
        }
    } catch (error) {
        toast.error("Yükləmə zamanı xəta baş verdi");
        console.error(error);
    } finally {
        setDownloading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center text-center space-y-7 transition-all hover:shadow-md italic font-black text-left relative overflow-hidden">
      
      {/* İkon və Başlıq */}
      <div className="w-14 h-14 bg-sky-50 text-[#0ea5e9] rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
        <FiMaximize size={28} />
      </div>

      {/* QR Kodun göstərildiyi yer */}
      <div className="relative group p-6 bg-white rounded-[2.5rem] shadow-inner border border-gray-50 overflow-hidden">
         <div 
            ref={qrRef} 
            className="qr-wrapper shadow-sm" 
            style={{ 
                imageRendering: 'crisp-edges', // Brauzerdə daha itigözlü görünməsi üçün
                borderRadius: '1.5rem',
                overflow: 'hidden'
            }} 
         />
      </div>

      {/* Düymələr */}
      <div className="flex flex-col w-full gap-3 font-black">
        <button 
            onClick={() => handleDownload('sticker')} 
            disabled={downloading}
            className="bg-[#0ea5e9] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-600 transition-all active:scale-95 shadow-lg shadow-blue-100 flex items-center justify-center gap-2 not-italic disabled:opacity-60"
        >
          {downloading ? <FiLoader className="animate-spin" /> : <FiDownload size={16} />} 
          Çap Üçün Vektor (SVG) Yüklə
        </button>
        <button 
            onClick={() => handleDownload('simple')} 
            disabled={downloading}
            className="bg-gray-100 text-gray-700 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2 not-italic disabled:opacity-60"
        >
          {downloading ? <FiLoader className="animate-spin" /> : <FiDownload size={16} />} 
          Sadə QR (Ultra HD PNG)
        </button>
      </div>

      {/* Məlumat Paneli */}
      <div className="w-full bg-sky-50 p-4 rounded-2xl border border-blue-100 flex gap-3 text-left leading-none">
        <FiInfo className="text-blue-600 shrink-0 mt-0.5" size={16} />
        <p className="text-[9px] text-blue-800 font-black uppercase truncate italic leading-none">
          Link: neopos.az/q/{slug}
        </p>
      </div>

      {/* Fon bəzəyi (Opsional - Layout-a uyğun) */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-sky-50/30 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

export default QRCodeGenerator;