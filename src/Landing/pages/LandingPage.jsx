import React, { useState } from 'react';
import { FiLayout, FiPieChart, FiSmartphone, FiArrowRight, FiCheckCircle, FiMenu, FiX, FiZap, FiLayers, FiShield } from 'react-icons/fi';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#0f172a] font-sans selection:bg-[#0200fe] selection:text-white">
      
      {/* 1. MODERN NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl z-50 border-b border-gray-50">
        <div className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-[#0200fe] rounded-2xl flex items-center justify-center text-white font-black italic shadow-lg shadow-blue-200 group-hover:rotate-12 transition-transform">N</div>
            <span className="text-2xl font-black tracking-tighter italic uppercase text-slate-900">NeoPos</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            <a href="#features" className="hover:text-[#0200fe] transition-all">Özəlliklər</a>
            <a href="#stats" className="hover:text-[#0200fe] transition-all">Niyə Biz?</a>
            <a href="#contact" className="hover:text-[#0200fe] transition-all">Əlaqə</a>
          </div>

          <div className="hidden md:block">
            <button className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#0200fe] transition-all shadow-xl shadow-slate-200">
              Sistemi Yoxla
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 px-6 py-8 flex flex-col gap-6 animate-fadeIn">
            <a href="#features" className="text-lg font-black uppercase italic tracking-tighter" onClick={() => setIsMenuOpen(false)}>Özəlliklər</a>
            <a href="#stats" className="text-lg font-black uppercase italic tracking-tighter" onClick={() => setIsMenuOpen(false)}>Statistika</a>
            <button className="w-full py-4 bg-[#0200fe] text-white rounded-2xl font-black uppercase tracking-widest">Daxil Ol</button>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative px-6 pt-40 pb-20 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl -z-10" />
        
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#0200fe] rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
            <FiZap className="animate-pulse" /> AI Dəstəkli Restoran Avtomatlaşdırması
          </div>
          
          <h1 className="text-5xl md:text-[90px] font-[1000] italic uppercase tracking-tighter leading-[0.85] text-slate-900">
            Məkanınızı <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0200fe] to-blue-400">
              Gələcəyə Daşıyın
            </span>
          </h1>
          
          <p className="text-slate-500 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            Restoran, kafe və otellər üçün bulud əsaslı idarəetmə həlli. 
            Müştəri məmnuniyyətini artırın, xərcləri 30% azaldın.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <button className="group w-full sm:w-auto px-12 py-6 bg-[#0200fe] text-white rounded-2xl font-black uppercase italic tracking-widest shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-95">
              İndi Başla <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
            <div className="flex items-center gap-4 px-6 py-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
                <div className="flex -space-x-3">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />)}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">+500 məkan bizə güvənir</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. QUICK STATS */}
      <section id="stats" className="px-6 py-20 border-y border-gray-50 bg-slate-50/30">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
                { label: 'Sürətli Satış', val: '2X' },
                { label: 'Xərc Qənaəti', val: '30%' },
                { label: 'Aktiv İstifadəçi', val: '10K+' },
                { label: 'Dəstək', val: '24/7' }
            ].map((s, i) => (
                <div key={i} className="text-center md:text-left">
                    <h4 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-[#0200fe] mb-1">{s.val}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                </div>
            ))}
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section id="features" className="px-6 py-32 max-w-7xl mx-auto">
        <div className="mb-20 text-center md:text-left">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Mükəmməl <span className="text-[#0200fe]">Özəlliklər</span></h2>
            <p className="text-slate-400 font-medium">Biznesinizi asanlaşdıran hər şey tək bir ekranda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<FiSmartphone />} 
            title="Ağıllı QR Menyu" 
            desc="Müştəriləriniz ofisiant gözləmədən, birbaşa telefondan sifariş versin." 
            color="bg-blue-500"
          />
          <FeatureCard 
            icon={<FiLayers />} 
            title="Anbar Və Uçot" 
            desc="Məhsul qalıqlarına, maya dəyərinə və itkilərə anlıq nəzarət edin." 
            color="bg-emerald-500"
          />
          <FeatureCard 
            icon={<FiShield />} 
            title="Maliyyə Təhlükəsizliyi" 
            desc="Kassa əməliyyatları və silinmələr üzərində 100% rəqəmsal nəzarət." 
            color="bg-purple-500"
          />
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="bg-[#0200fe] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-3xl shadow-blue-300">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white mb-8">Bu gün rəqəmsallaşmağa <br /> hazırsınız?</h2>
            <button className="px-12 py-6 bg-white text-[#0200fe] rounded-2xl font-black uppercase italic tracking-[0.2em] shadow-xl hover:bg-slate-50 transition-all">
                Demanı İndi Al
            </button>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="px-6 py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0200fe] rounded-xl flex items-center justify-center text-white font-black italic text-xs">N</div>
              <span className="text-xl font-black tracking-tighter italic uppercase text-slate-900">NeoPos</span>
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest max-w-xs">Restoran idarəetməsində yeni standartlar müəyyən edirik.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            <FooterIcon label="Təhlükəsiz Bulud" />
            <FooterIcon label="Sürətli Quraşdırılma" />
            <FooterIcon label="7/24 Dəstək" />
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-gray-50 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">© 2026 NeoPos Systems. Crafted with precision.</p>
        </div>
      </footer>

    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color }) => (
  <div className="bg-white p-10 rounded-[3rem] border border-gray-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-50 transition-all group">
    <div className={`w-16 h-16 ${color} text-white rounded-[1.5rem] flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
      {React.cloneElement(icon, { size: 32 })}
    </div>
    <h3 className="text-2xl font-[1000] uppercase italic tracking-tighter mb-4 text-slate-900 leading-none">{title}</h3>
    <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
  </div>
);

const FooterIcon = ({ label }) => (
  <div className="flex items-center gap-2 text-slate-300">
    <FiCheckCircle size={16} className="text-[#0200fe]" />
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
  </div>
);

export default LandingPage;