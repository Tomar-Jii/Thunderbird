import React, { useState } from 'react';
import { 
  Plane, 
  Zap, 
  ShieldAlert, 
  Cpu, 
  Radio, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Volume2, 
  ExternalLink, 
  TrendingUp, 
  BarChart2, 
  Clock, 
  Flame, 
  Building2, 
  Navigation,
  Wind,
  Layers,
  ArrowRight
} from 'lucide-react';
import { soundEffects } from '../utils/audioAlert';

interface AirportHub {
  icao: string;
  name: string;
  city: string;
  activeRunways: string[];
  currentWind: string;
  windShearRisk: 'HIGH' | 'MODERATE' | 'LOW';
  microburstAlert: boolean;
  visibilityKm: number;
  holdingStackDelaysMin: number;
  diversionRisk: string;
  recommendedAction: string;
  metarNowcast: string;
}

const AIRPORTS: AirportHub[] = [
  {
    icao: 'VECC',
    name: 'Netaji Subhash Chandra Bose Intl',
    city: 'Kolkata',
    activeRunways: ['19L', '19R', '01L'],
    currentWind: '290° at 38G52 KT',
    windShearRisk: 'HIGH',
    microburstAlert: true,
    visibilityKm: 1.2,
    holdingStackDelaysMin: 45,
    diversionRisk: 'CRITICAL (Diversions to BBI / GAU)',
    recommendedAction: 'SUSPEND ARRIVALS: Severe LLWS on final approach Runway 19L. Gust front collision imminent.',
    metarNowcast: 'SPECI VECC 291750Z 29038G52KT 1200 +TSRA SQ BKN012CB OVC060 22/20 Q0998 WS RWY19L TEMPO 0800 +TSRAGR'
  },
  {
    icao: 'VIDP',
    name: 'Indira Gandhi Intl',
    city: 'Delhi NCR',
    activeRunways: ['28', '29R', '11L'],
    currentWind: '310° at 28G42 KT',
    windShearRisk: 'HIGH',
    microburstAlert: true,
    visibilityKm: 2.5,
    holdingStackDelaysMin: 30,
    diversionRisk: 'MODERATE (Holding at DPN VOR)',
    recommendedAction: 'MICROBURST WARNING: -24 knot airspeed loss detected by TDWR at 3 DME on Runway 28 glide slope.',
    metarNowcast: 'SPECI VIDP 291800Z 31028G42KT 2500 TS BLDU SCT025CB BKN080 34/18 Q1002 WS RWY28 TEMPO 1500 SQ'
  },
  {
    icao: 'VABB',
    name: 'Chhatrapati Shivaji Maharaj Intl',
    city: 'Mumbai',
    activeRunways: ['27', '09'],
    currentWind: '240° at 22G34 KT',
    windShearRisk: 'MODERATE',
    microburstAlert: false,
    visibilityKm: 3.0,
    holdingStackDelaysMin: 20,
    diversionRisk: 'LOW (Standard Separation)',
    recommendedAction: 'HEAVY RAIN BAND: Runway surface friction degraded. Expect 15-minute departure slot spacing.',
    metarNowcast: 'METAR VABB 291800Z 24022G34KT 3000 +SHRA FEW010 BKN020CB 28/26 Q1006 TEMPO 1500 +TSRA'
  },
  {
    icao: 'VOBL',
    name: 'Kempegowda Intl',
    city: 'Bengaluru',
    activeRunways: ['09L', '09R'],
    currentWind: '120° at 14 KT',
    windShearRisk: 'MODERATE',
    microburstAlert: false,
    visibilityKm: 5.0,
    holdingStackDelaysMin: 15,
    diversionRisk: 'LOW',
    recommendedAction: 'LIGHTNING THREAT IN TMA: High cloud-to-ground flash rate within 12 NM. Ramp ground operations paused.',
    metarNowcast: 'METAR VOBL 291800Z 12014KT 5000 VCTS SCT025CB SCT090 26/21 Q1012 NOSIG'
  }
];

export const TacticalAviationGrid: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'aviation' | 'grid' | 'pinn' | 'cbs'>('aviation');
  const [selectedAirportIcao, setSelectedAirportIcao] = useState<string>('VECC');
  const [leadTimeMinutes, setLeadTimeMinutes] = useState<number>(60);
  const [selectedLanguage, setSelectedLanguage] = useState<'hi' | 'en' | 'bn' | 'mr'>('hi');
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [cbsSimulated, setCbsSimulated] = useState<boolean>(false);

  const currentAirport = AIRPORTS.find(a => a.icao === selectedAirportIcao) || AIRPORTS[0];

  const handleCopyPayload = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleTriggerCbsBroadcast = () => {
    setCbsSimulated(true);
    soundEffects.playSiren(2.5);
    setTimeout(() => setCbsSimulated(false), 5000);
  };

  // Multilingual alert texts
  const alertTexts = {
    hi: {
      title: 'तत्काल आपदा पूर्व चेतावनी (NDMA / IMD)',
      severity: 'RED ALERT (अति गंभीर)',
      body: 'आईएमडी एवं एनडीएमए द्वारा तत्काल चेतावनी: कोलकाता, हुगली एवं हावड़ा जिलों में अगले 45 मिनटों में 85 किमी/घंटे की तीव्र अंधड़-हवाओं, भीषण मेघगर्जन, ओलावृष्टि और सघन आकाशीय बिजली गिरने की 94% संभावना है। सभी नागरिक पक्के मकानों में शरण लें, वृक्षों व बिजली के खंभों से दूर रहें।',
      action: 'खेतों में काम कर रहे किसान तुरंत सुरक्षित आश्रय में जाएं। विद्युत ग्रिड सुरक्षा प्रोटोकॉल सक्रिय किया गया।'
    },
    en: {
      title: 'IMD OPERATIONAL CONVECTIVE DISASTER WARNING',
      severity: 'RED ALERT (CRITICAL CONVECTIVE HAZARD)',
      body: 'Extreme severe thunderstorm with squall winds exceeding 85 km/h, large hail accretion, and high-frequency cloud-to-ground lightning is nowcasting for Kolkata Metropolitan Area and adjacent districts over the next 45 minutes (Lead Time T+45m).',
      action: 'Aviation TDWR microburst protocol active. Outdoor agricultural work suspended. High-voltage transmission lines auto-islanded.'
    },
    bn: {
      title: 'জরুরী দুর্যোগ সতর্কতা (NDMA / মৌসম ভবন)',
      severity: 'লাল সতর্কতা (অত্যন্ত বিপজ্জনক)',
      body: 'ভারতীয় মৌসম ভবন (IMD) সতর্কবার্তা: আগামী ৪৫ মিনিটের মধ্যে কলকাতা, হাওড়া এবং উত্তর ২৪ পরগনায় কালবৈশাখীর প্রবল ঝড় (৮৫ কিমি/ঘণ্টা), বজ্রঝড় এবং তীব্র বজ্রপাতের আশঙ্কা। খোলা মাঠে থাকবেন না, অবিলম্বে পাকা ভবনে আশ্রয় নিন।',
      action: 'গাছের নিচে বা বিদ্যুতের খুঁটির কাছে দাঁড়াবেন না। বিমানবন্দর ও রেলওয়ে জরুরি প্রটোকল কার্যকর।'
    },
    mr: {
      title: 'आपत्कालीन पूर्वसूचना (NDMA / भारतीय हवामान विभाग)',
      severity: 'रेड अलर्ट (अति तीव्र वादळ)',
      body: 'हवामान विभाग इशारा: पुढील ४५ मिनिटांत चक्री वाऱ्यासह जोरदार पाऊस, गारपीट आणि तीव्र विजांचा कडकडाट होण्याची ९४% शक्यता. नागरिकांनी त्वरित पक्क्या घरात आसरा घ्यावा. झाडांखाली थांबू नका.',
      action: 'शेतकऱ्यांनी त्वरित सुरक्षित ठिकाणी जावे. आपत्ती व्यवस्थापन पथके सज्ज ठेवण्यात आली आहेत.'
    }
  };

  // CAP 1.2 XML template
  const capXmlPayload = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>STORMSIGHT-IMD-2026-09-29-0094</identifier>
  <sender>imd-nowcast@mausam.imd.gov.in</sender>
  <sent>2026-09-29T18:00:00+05:30</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>Severe Thunderstorm &amp; Squall with Extreme Lightning</event>
    <urgency>Immediate</urgency>
    <severity>Extreme</severity>
    <certainty>Observed</certainty>
    <headline>${alertTexts[selectedLanguage].title}</headline>
    <description>${alertTexts[selectedLanguage].body}</description>
    <instruction>${alertTexts[selectedLanguage].action}</instruction>
    <area>
      <areaDesc>Kolkata Metropolitan, Howrah, Hooghly Sector (SIH26072 Nowcast Grid)</areaDesc>
      <circle>22.65,88.45,35.0</circle>
    </area>
    <parameter>
      <valueName>CAPE_J_KG</valueName>
      <value>3850</value>
    </parameter>
    <parameter>
      <valueName>MAX_RADAR_DBZ</valueName>
      <value>67.4</value>
    </parameter>
  </info>
</alert>`;

  return (
    <div className="space-y-5 animate-fade-in font-sans">
      {/* Top Banner Navigation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-bold">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight font-['Chakra_Petch',sans-serif]">
                  TACTICAL AVIATION & INFRASTRUCTURE DEFENSE
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded">
                  SIH26072 DEEP-TECH EXTENSION
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Operational TDWR airport wind shear hazards, 765kV power grid islanding protection, PINN vs optical flow benchmarks, and multilingual CAP 1.2 cell broadcast.
              </p>
            </div>
          </div>

          {/* Sub-tab Switcher */}
          <div className="flex flex-wrap items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveSubTab('aviation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeSubTab === 'aviation'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Aviation Aerodrome (TDWR)</span>
            </button>
            <button
              onClick={() => setActiveSubTab('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeSubTab === 'grid'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Power Grid & Rural Defense</span>
            </button>
            <button
              onClick={() => setActiveSubTab('pinn')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeSubTab === 'pinn'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>PINN vs Optical Flow Benchmark</span>
            </button>
            <button
              onClick={() => setActiveSubTab('cbs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeSubTab === 'cbs'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Multilingual Cell Broadcast</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: AVIATION TDWR & WIND SHEAR */}
      {activeSubTab === 'aviation' && (
        <div className="space-y-4">
          {/* Airport Selector Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {AIRPORTS.map((apt) => {
              const isSelected = apt.icao === selectedAirportIcao;
              return (
                <button
                  key={apt.icao}
                  onClick={() => setSelectedAirportIcao(apt.icao)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg ring-1 ring-indigo-500/30'
                      : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold font-mono text-white flex items-center gap-1.5">
                      <Plane className="w-4 h-4 text-cyan-400" />
                      {apt.icao}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      apt.windShearRisk === 'HIGH' 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' 
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {apt.windShearRisk} WS RISK
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-semibold mt-1">{apt.name}</p>
                  <p className="text-[11px] text-slate-400">{apt.city}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                    <span>Active: {apt.activeRunways.join(', ')}</span>
                    <span className="text-rose-400 font-bold">{apt.holdingStackDelaysMin}m Delay</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Aviation Live Operational Console */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            {/* Left 8 Cols: Terminal Radar & Runway Glide Path Hazard */}
            <div className="xl:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                    Terminal Doppler Weather Radar (TDWR) Aerodrome Glidepath Display
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/20 text-cyan-300 rounded">
                    Range: 25 NM Radius
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Update Cycle: 60 sec Scan
                </span>
              </div>

              {/* Synthetic TDWR Aerodrome Display (SVG) */}
              <div className="relative w-full aspect-[16/9] bg-[#030712] rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-2">
                <svg viewBox="0 0 640 360" className="w-full h-full select-none">
                  {/* Concentric Range Rings (5NM, 10NM, 15NM, 20NM) */}
                  {[50, 100, 150, 200].map((r, i) => (
                    <g key={r}>
                      <circle cx="320" cy="180" r={r} stroke="#1e293b" strokeWidth="1" fill="none" strokeDasharray="3 3" />
                      <text x="325" y={180 - r + 12} fill="#475569" fontSize="8" fontFamily="monospace">
                        {(i + 1) * 5} NM
                      </text>
                    </g>
                  ))}

                  {/* Compass Radial Azimuth Lines */}
                  <line x1="320" y1="20" x2="320" y2="340" stroke="#1e293b" strokeWidth="1" />
                  <line x1="160" y1="180" x2="480" y2="180" stroke="#1e293b" strokeWidth="1" />
                  <text x="320" y="16" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">000°</text>
                  <text x="320" y="352" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">180°</text>
                  <text x="495" y="183" fill="#64748b" fontSize="9" fontFamily="monospace">090°</text>
                  <text x="135" y="183" fill="#64748b" fontSize="9" fontFamily="monospace">270°</text>

                  {/* Severe Storm Echo Approaching Runway */}
                  <defs>
                    <radialGradient id="microburstCore" cx="40%" cy="40%" r="50%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                      <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.8" />
                      <stop offset="70%" stopColor="#10b981" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
                    </radialGradient>
                  </defs>

                  {/* Approaching Convective Cell Clustered on Approach Corridor */}
                  <path
                    d="M 230 140 C 210 100, 280 80, 310 90 C 350 100, 370 140, 360 170 C 340 210, 270 200, 240 180 Z"
                    fill="url(#microburstCore)"
                  />

                  {/* Severe Hail Core */}
                  <ellipse cx="295" cy="135" rx="24" ry="20" fill="#dc2626" fillOpacity="0.9" />
                  <text x="295" y="138" fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    62 dBZ
                  </text>

                  {/* Microburst Wind Divergence Vectors (Outflow) */}
                  <g stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="295" y1="135" x2="260" y2="120" />
                    <line x1="295" y1="135" x2="330" y2="115" />
                    <line x1="295" y1="135" x2="335" y2="160" />
                    <line x1="295" y1="135" x2="270" y2="165" />
                  </g>

                  {/* Microburst Hazard Alert Box */}
                  {currentAirport.microburstAlert && (
                    <g>
                      <rect x="235" y="60" width="165" height="24" rx="4" fill="#991b1b" fillOpacity="0.85" stroke="#ef4444" strokeWidth="1.5" />
                      <text x="317" y="76" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                        ⚠️ MICROBURST DETECTED (-28 KT)
                      </text>
                    </g>
                  )}

                  {/* Airport Center Runways (19L/01R or 28/10) */}
                  <g>
                    {/* Main Runway */}
                    <rect x="317" y="150" width="6" height="60" fill="#f8fafc" rx="1" transform="rotate(-15 320 180)" />
                    {/* Parallel / Cross Runway */}
                    <rect x="300" y="177" width="40" height="5" fill="#94a3b8" rx="1" transform="rotate(75 320 180)" />
                    {/* Airport Icon */}
                    <circle cx="320" cy="180" r="4" fill="#38bdf8" />
                    <text x="330" y="184" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      {currentAirport.icao} ARP
                    </text>
                  </g>

                  {/* Final Approach Glide Path Corridors */}
                  <line x1="320" y1="210" x2="320" y2="330" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
                  <text x="325" y="270" fill="#f59e0b" fontSize="8" fontFamily="monospace">
                    ILS RWY 19L GLIDEPATH
                  </text>

                  {/* Simulated Incoming Aircraft on Final Approach */}
                  <g transform="translate(315, 290)">
                    <path d="M 5 0 L 8 10 L 13 12 L 8 13 L 8 18 L 5 16 L 2 18 L 2 13 L -3 12 L 2 10 Z" fill="#22d3ee" />
                    <text x="16" y="8" fill="#22d3ee" fontSize="8" fontFamily="monospace" fontWeight="bold">
                      AIC402 (A321) 3200 FT
                    </text>
                    <text x="16" y="17" fill="#f43f5e" fontSize="7.5" fontFamily="monospace">
                      WS ALERT DISPATCHED
                    </text>
                  </g>
                </svg>
              </div>

              {/* Decoded SPECI / METAR Box */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 font-mono text-xs">
                <span className="text-slate-400 block text-[10px]">CURRENT METAR / SPECI NOWCAST TELEMETRY:</span>
                <p className="text-cyan-300 font-bold tracking-wide">
                  {currentAirport.metarNowcast}
                </p>
              </div>
            </div>

            {/* Right 4 Cols: Operational Flight Action & Air Traffic Delays */}
            <div className="xl:col-span-4 space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-cyan-400" />
                    ATC Aerodrome Advisory
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    currentAirport.windShearRisk === 'HIGH' 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {currentAirport.diversionRisk}
                  </span>
                </div>

                {/* Directive Box */}
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-200">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>TACTICAL ATC DIRECTIVE:</span>
                  </div>
                  <p className="leading-relaxed">
                    {currentAirport.recommendedAction}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Surface Wind</span>
                    <span className="text-slate-100 font-bold">{currentAirport.currentWind}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Runway Visual Range</span>
                    <span className="text-slate-100 font-bold">{currentAirport.visibilityKm} km</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Avg Holding Delay</span>
                    <span className="text-amber-400 font-bold">{currentAirport.holdingStackDelaysMin} minutes</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Diversion Cost Averted</span>
                    <span className="text-emerald-400 font-bold">₹42.8 Lakhs / flt</span>
                  </div>
                </div>

                {/* Automated Action Protocols */}
                <div className="pt-2 border-t border-slate-800 space-y-2 text-xs font-mono">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Automated Dispatch Protocols:</span>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-300">Runway 19L Go-Around Advisory</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px]">TRANSMITTED</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-300">Terminal Apron Lightning Halt</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-300">Alternate Fuel Buffering (BBI)</span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">STANDBY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: POWER GRID & RURAL DEFENSE */}
      {activeSubTab === 'grid' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  765 kV / 400 kV PowerGrid Transmission Line Lightning Protection Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time lightning flash proximity calculation against high-voltage corridors to trigger automated islanding and prevent cascading grid blackouts.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
                GRID STATUS: ELEVATED THREAT
              </span>
            </div>

            {/* Grid Corridors Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                    <th className="p-3">TRANSMISSION CORRIDOR</th>
                    <th className="p-3">VOLTAGE</th>
                    <th className="p-3">PROXIMITY (KM)</th>
                    <th className="p-3">LIGHTNING DENSITY</th>
                    <th className="p-3">TRIP RISK</th>
                    <th className="p-3">DEFENSE ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white">Subhashgram - Jeerat D/C</td>
                    <td className="p-3 text-cyan-300">400 kV AC</td>
                    <td className="p-3 text-rose-400 font-bold">2.4 km</td>
                    <td className="p-3 text-rose-300 font-bold">48 strokes/10m</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        CRITICAL (92%)
                      </span>
                    </td>
                    <td className="p-3 text-amber-300">Auto-reclose blocked; Shift load to Rajarhat</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white">Farakka - Durgapur 765kV</td>
                    <td className="p-3 text-cyan-300">765 kV HVDC</td>
                    <td className="p-3 text-amber-400 font-bold">6.1 km</td>
                    <td className="p-3 text-amber-300">22 strokes/10m</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        HIGH (64%)
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">Surge arresters monitored</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white">Agra - Gwalior Supergrid</td>
                    <td className="p-3 text-cyan-300">765 kV AC</td>
                    <td className="p-3 text-slate-300">14.8 km</td>
                    <td className="p-3 text-slate-400">8 strokes/10m</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        LOW (12%)
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">Normal nominal operation</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white">Kolkata Metro OHE Line 1</td>
                    <td className="p-3 text-purple-300">750V Third Rail</td>
                    <td className="p-3 text-rose-400 font-bold">1.1 km</td>
                    <td className="p-3 text-rose-300 font-bold">54 strokes/10m</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        HIGH (84%)
                      </span>
                    </td>
                    <td className="p-3 text-amber-300">Speed restricted to 40 km/h</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Rural Farmer Lightning Defense */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  RURAL & FARMER OPEN-FIELD LIGHTNING CASUALTY MITIGATION (IMD DAMINI INTEGRATION)
                </span>
                <span className="text-emerald-400 font-bold">EST. 320+ CASUALTIES PREVENTED / YR</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                In India, over 2,500 rural citizens lose their lives annually to cloud-to-ground lightning strikes in open agricultural paddy fields. StormSight AI couples 15-minute cell vector extrapolation with automated hyper-local Cell Broadcast SMS, giving farmers 30–45 minutes of actionable lead time to seek concrete shelter before the first ground strike occurs.
              </p>
            </div>
          </div>

          {/* Right 4 Cols: Grid Islanding Diagram */}
          <div className="xl:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
            <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider block pb-2 border-b border-slate-800">
              Automated Substation Protection Status
            </span>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300 font-bold">Subhashgram 400kV Substation</span>
                  <span className="text-rose-400 font-bold animate-pulse">DEFENSE LEVEL 3</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Capacitor banks disconnected. Static Var Compensators (SVC) stabilizing bus voltage against lightning impulse transients.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300 font-bold">Jeerat 400kV Grid Intertie</span>
                  <span className="text-amber-400 font-bold">MONITORING</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Surge counter: 14 strikes registered in last 30 minutes. Insulation margin: 94.2%.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300 font-bold">Solar Photovoltaic Park (75 MW)</span>
                  <span className="text-cyan-400 font-bold">INVERTER TRIP SHIELD</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Grounding array surge clamping active. Ground impedance: 0.82 Ohms (IMD certified safe).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PINN VS OPTICAL FLOW BENCHMARK */}
      {activeSubTab === 'pinn' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4 font-mono">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                SCIENTIFIC BENCHMARK: StormSight Physics-Informed ConvLSTM vs Baselines
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Comparative verification across lead times: Why traditional Optical Flow fails after 45 minutes, while PINN preserves convective growth.
              </p>
            </div>

            {/* Lead Time Slider */}
            <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400">Nowcast Horizon:</span>
              <span className="text-cyan-300 font-bold">T+{leadTimeMinutes} min</span>
              <input
                type="range"
                min="15"
                max="120"
                step="15"
                value={leadTimeMinutes}
                onChange={(e) => setLeadTimeMinutes(parseInt(e.target.value))}
                className="w-28 accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          {/* 3 Model Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Model 1: Optical Flow */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">1. PySTEPS Optical Flow</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">Semi-Lagrangian</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Critical Success Index (CSI):</span>
                  <span className="text-amber-400 font-bold">
                    {leadTimeMinutes <= 30 ? '0.68' : leadTimeMinutes <= 60 ? '0.42' : '0.19'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Probability of Detection:</span>
                  <span className="text-slate-200">
                    {leadTimeMinutes <= 30 ? '0.79' : leadTimeMinutes <= 60 ? '0.51' : '0.24'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Cell Genesis / Dissipation:</span>
                  <span className="text-rose-400 font-semibold">Fails (Assumes Frozen Field)</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-sans border-t border-slate-800/80 pt-2">
                Pure advection fails when new convective cells trigger dynamically from low-level convergence.
              </p>
            </div>

            {/* Model 2: Pure NWP */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">2. WRF-ARW (3km Numerical)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">Hydrostatic NWP</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Critical Success Index (CSI):</span>
                  <span className="text-blue-400 font-bold">
                    {leadTimeMinutes <= 30 ? '0.34' : leadTimeMinutes <= 60 ? '0.39' : '0.44'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Data Assimilation Latency:</span>
                  <span className="text-rose-400 font-semibold">3 to 6 Hours Delay</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Spatial Displacement Error:</span>
                  <span className="text-amber-400">±25 to 40 km</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-sans border-t border-slate-800/80 pt-2">
                Good synoptic physics, but far too slow for 0–60 min operational flash nowcasting.
              </p>
            </div>

            {/* Model 3: StormSight Hybrid PINN */}
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/50 shadow-md shadow-cyan-950/50 space-y-3 ring-1 ring-cyan-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300">3. StormSight PINN-ConvLSTM</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 font-bold">OUR ARCHITECTURE</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Critical Success Index (CSI):</span>
                  <span className="text-emerald-400 font-bold">
                    {leadTimeMinutes <= 30 ? '0.84' : leadTimeMinutes <= 60 ? '0.74' : '0.62'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Inference Latency:</span>
                  <span className="text-emerald-400 font-bold">&lt; 180 ms (Real-Time)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Physical Mass Conservation:</span>
                  <span className="text-cyan-300 font-semibold">Enforced via Loss Regularization</span>
                </div>
              </div>
              <p className="text-[11px] text-cyan-200/80 font-sans border-t border-cyan-500/20 pt-2">
                Combines high-resolution radar spatio-temporal dynamics with atmospheric thermodynamic constraints.
              </p>
            </div>
          </div>

          {/* Mathematical Formulation Explainer */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
            <span className="font-bold text-white block">PHYSICS-INFORMED LOSS REGULARIZATION:</span>
            <p className="text-slate-400 font-sans leading-relaxed">
              Standard deep learning models suffer from severe blurring (over-smoothing) after 30 minutes because MSE loss averages pixel probabilities. StormSight AI introduces a compound loss function:
            </p>
            <div className="bg-slate-900 p-2.5 rounded font-mono text-[11px] text-cyan-300 border border-slate-800">
              L_total = L_FocalReflectivity + λ_1 * L_ConservationOfMass(∇·(ρv) = 0) + λ_2 * L_VorticityAdvection + λ_3 * L_LPI_Lightning
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: MULTILINGUAL CELL BROADCAST & CAP 1.2 */}
      {activeSubTab === 'cbs' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* Left 7 Cols: Cell Broadcast Simulator */}
          <div className="xl:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-rose-400" />
                  NDMA Sachet & Telecom Cell Broadcast Service (CBS)
                </h3>
                <p className="text-xs text-slate-400">
                  Instant geo-fenced emergency siren alert delivered to all active mobile phone towers without internet dependency.
                </p>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                {[
                  { id: 'hi', label: 'हिंदी' },
                  { id: 'en', label: 'English' },
                  { id: 'bn', label: 'বাংলা' },
                  { id: 'mr', label: 'मराठी' },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLanguage(lang.id as 'hi' | 'en' | 'bn' | 'mr')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      selectedLanguage === lang.id
                        ? 'bg-rose-500 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Phone Mockup Notification */}
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#090d16] border-2 border-rose-500/50 shadow-2xl shadow-rose-950/60 space-y-3 font-sans">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-2 border-b border-slate-800">
                <span className="flex items-center gap-1 text-rose-400 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 animate-bounce" />
                  GOVT OF INDIA EMERGENCY BROADCAST
                </span>
                <span>NOWCAST T+45M</span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-rose-300">
                    {alertTexts[selectedLanguage].title}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500 text-slate-950 font-bold">
                    {alertTexts[selectedLanguage].severity}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {alertTexts[selectedLanguage].body}
                </p>
                <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-[11px] text-amber-300 font-mono">
                  {alertTexts[selectedLanguage].action}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleTriggerCbsBroadcast}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold shadow-md shadow-rose-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{cbsSimulated ? 'BROADCASTING SIREN...' : 'TRIGGER SIREN & CBS ALERT'}</span>
                </button>
                <span className="text-[10px] text-slate-400 font-mono">Channel: 919 (IMD Severe)</span>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: CAP 1.2 XML Payload */}
          <div className="xl:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                CAP 1.2 XML Interoperability Standard
              </span>
              <button
                onClick={() => handleCopyPayload(capXmlPayload)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                title="Copy XML for NDMA Sachet Integration"
              >
                {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPayload ? 'Copied XML' : 'Copy Payload'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-sans">
              Compliant with ITU-T X.1303 / WMO Common Alerting Protocol v1.2 for direct ingestion by NDMA Sachet, Telecom TSP towers, and Emergency Operation Centers (EOCs).
            </p>

            {/* XML code container */}
            <div className="bg-[#040711] p-3 rounded-lg border border-slate-800/80 text-[10px] text-cyan-200 overflow-x-auto max-h-[300px] leading-relaxed">
              <pre>{capXmlPayload}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
