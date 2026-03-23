"use client";

import { useState, useEffect } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  gold: "#C9A84C",
  goldLight: "#F5E6C0",
  goldDark: "#8B6914",
  teal: "#0D6E6E",
  tealLight: "#E0F4F4",
  tealDark: "#064444",
  ink: "#0E1B2A",
  slate: "#374151",
  muted: "#6B7280",
  border: "#E5E7EB",
  bg: "#FAFAF8",
  white: "#FFFFFF",
};

// ─── Translations ─────────────────────────────────────────────────────────────
const T = {
  ar: {
    dir: "rtl",
    lang: "ar",
    nav: {
      logo1: "ميدي",
      logo2: "كونكت",
      badge: "العراق",
      links: ["كيف يعمل", "قصص المرضى", "الباقات", "الأسئلة"],
      whatsapp: "واتساب",
      book: "احجز الآن",
    },
    hero: {
      eyebrow: "🇮🇶 للمرضى العراقيين — خدمة متكاملة من البيت للمستشفى",
      title: "أفضل رعاية طبية أمريكية\nمن العراق",
      subtitle:
        "نربطك بأمهر الأطباء الأمريكيين المعتمدين — استشارة أونلاين، تنسيق السفر، علاج متكامل في أفضل مستشفيات أمريكا. خدمة متاحة لجميع مدن العراق.",
      book: "احجز استشارتك المجانية",
      learn: "كيف نساعدك",
      trust1: "لا قوائم انتظار",
      trust2: "دعم عربي 24/7",
      trust3: "دفع بالدينار والدولار",
      served: "+٣٢٠٠",
      servedLabel: "مريض عراقي تم علاجه",
      cities: "نخدم بغداد · البصرة · أربيل · الموصل · النجف · كربلاء · الناصرية وجميع المحافظات",
    },
    stats: [
      { value: "+٣٢٠٠", label: "مريض عراقي تم علاجه" },
      { value: "٩٨٪", label: "نسبة رضا المرضى" },
      { value: "+٢٠٠", label: "طبيب أمريكي معتمد" },
      { value: "٤٨ ساعة", label: "موعدك جاهز خلال" },
    ],
    howItWorks: {
      title: "رحلتك الطبية خطوة بخطوة",
      subtitle: "من بغداد إلى أفضل المستشفيات الأمريكية — نحن معك في كل خطوة",
      steps: [
        {
          icon: "💬",
          num: "١",
          title: "استشارة مجانية أونلاين",
          desc: "تحدث مع منسّقنا الطبي العراقي مجاناً. نراجع ملفك الطبي ونحدد التخصص والطبيب الأنسب لحالتك.",
          points: ["محادثة بالعربية", "مراجعة الملف الطبي مجاناً", "توصية بالطبيب المناسب"],
        },
        {
          icon: "🏥",
          num: "٢",
          title: "استشارة متخصصة مع طبيب أمريكي",
          desc: "فيديو كول مباشر مع أخصائيك الأمريكي المعتمد. يشخّص حالتك ويضع خطة العلاج.",
          points: ["ترجمة فورية إذا لزم", "تقرير طبي مفصّل", "خطة علاجية واضحة"],
        },
        {
          icon: "✈️",
          num: "٣",
          title: "تنسيق السفر والعلاج",
          desc: "نرتّب لك كل شيء: تأشيرة طبية، حجز طيران من أقرب مطار، إقامة، ومرافقة في المستشفى.",
          points: ["دعم تأشيرة طبية أمريكية", "حجز طيران وفندق", "مرافق عربي في أمريكا"],
        },
        {
          icon: "🔄",
          num: "٤",
          title: "متابعة بعد العودة",
          desc: "تعود لبيتك في العراق ونحن لا نتركك. متابعة مستمرة مع فريقك الطبي عن بُعد.",
          points: ["جلسات متابعة منتظمة", "إدارة الأدوية والوصفات", "تقارير دورية لطبيبك المحلي"],
        },
      ],
    },
    conditions: {
      title: "نتخصص في علاج الحالات الصعبة",
      subtitle: "أمراض يصعب علاجها في العراق — نحن نفتح لك أبواب أفضل طب في العالم",
      list: [
        { icon: "❤️", name: "أمراض القلب والشرايين" },
        { icon: "🧠", name: "أورام الدماغ والجهاز العصبي" },
        { icon: "🩸", name: "سرطانات الدم والأورام" },
        { icon: "🦴", name: "جراحات العظام والمفاصل" },
        { icon: "👁️", name: "طب العيون المتقدم" },
        { icon: "🫁", name: "أمراض الرئة والجهاز التنفسي" },
        { icon: "🧬", name: "الأمراض الوراثية والنادرة" },
        { icon: "🩺", name: "الفحوصات الشاملة الوقائية" },
      ],
    },
    testimonials: {
      title: "مرضى عراقيون شفاء بإذن الله",
      subtitle: "تجارب حقيقية من مدن العراق",
      items: [
        {
          name: "أبو علي الموسوي",
          city: "النجف",
          procedure: "جراحة قلب مفتوح",
          stars: 5,
          text: "كنت أنتظر موعداً في بغداد لأكثر من ٨ أشهر. MediConnect رتّب لي موعداً في مستشفى كليفلاند كلينك خلال أسبوعين. الجراحة نجحت والحمد لله وأنا الآن بصحة كاملة.",
        },
        {
          name: "أم سارة الجبوري",
          city: "بغداد",
          procedure: "علاج سرطان الثدي",
          stars: 5,
          text: "تشخيص السرطان كان صدمة. لكن الفريق في MediConnect أخذ بيدي من اليوم الأول — رتّبوا كل شيء من التأشيرة للعلاج والإقامة. اليوم أنا بخير وأشكرهم كثيراً.",
        },
        {
          name: "كريم إبراهيم العبيدي",
          city: "البصرة",
          procedure: "استبدال مفصل الركبة",
          stars: 5,
          text: "كنت لا أقدر أمشي بشكل طبيعي. بعد استشارة أونلاين مع الطبيب الأمريكي وجراحة ناجحة في هيوستن، عدت للبصرة أمشي وأركض مع أولادي.",
        },
        {
          name: "د. هيثم الراوي",
          city: "أربيل",
          procedure: "ورم دماغي نادر",
          stars: 5,
          text: "كطبيب عراقي، أعرف حدود إمكانياتنا. حالتي كانت تحتاج تخصصاً نادراً. MediConnect وصلني بمركز جونز هوبكنز. النتيجة أفضل مما كنت أتوقع.",
        },
      ],
    },
    pricing: {
      title: "باقات واضحة بدون تعقيد",
      subtitle: "ندفع من أجل صحتك — كل الأسعار شاملة ومحددة مسبقاً",
      popular: "الأكثر طلباً",
      iqd: "≈ {iqd} دينار عراقي",
      custom: "تحتاج خطة خاصة؟ تواصل معنا مباشرة عبر واتساب",
      plans: [
        {
          name: "استشارة مبدئية",
          desc: "للمعرفة والتوجيه",
          price: "$199",
          iqd: "٢٦١,٠٠٠",
          period: "مرة واحدة",
          features: [
            "استشارة فيديو ٦٠ دقيقة",
            "مراجعة ملفك الطبي",
            "رأي طبي مفصّل",
            "خطة علاج مقترحة",
            "تقرير باللغة العربية",
          ],
          highlight: false,
          cta: "ابدأ الآن",
        },
        {
          name: "الباقة الشاملة",
          desc: "الأكثر اختياراً من العراق",
          price: "$599",
          iqd: "٧٨٤,٠٠٠",
          period: "مرة واحدة",
          features: [
            "استشارة ٩٠ دقيقة + متابعة",
            "تشخيص شامل ومفصّل",
            "خطة علاج كاملة",
            "مساعدة في التأشيرة الطبية",
            "تنسيق مع المستشفى الأمريكي",
          ],
          highlight: true,
          cta: "اختر الباقة",
        },
        {
          name: "باقة السفاري الطبي",
          desc: "من العراق إلى أمريكا",
          price: "$1,299",
          iqd: "١,٧٠٠,٠٠٠",
          period: "مرة واحدة",
          features: [
            "كل مزايا الباقة الشاملة",
            "حجز الطيران والفندق",
            "مرافق عربي في أمريكا",
            "ثلاث جلسات متابعة",
            "دعم كونسيرج ٢٤/٧",
          ],
          highlight: false,
          cta: "احجز الرحلة",
        },
      ],
    },
    cities: {
      title: "نخدم جميع محافظات العراق",
      subtitle: "مكاتب شركاء في المدن الكبرى — تواصل من أي مكان",
      list: [
        { name: "بغداد", flag: "🏙️", patients: "+١٢٠٠ مريض" },
        { name: "البصرة", flag: "🌊", patients: "+٦٠٠ مريض" },
        { name: "أربيل", flag: "🏔️", patients: "+٥٠٠ مريض" },
        { name: "الموصل", flag: "🌿", patients: "+٣٢٠ مريض" },
        { name: "النجف", flag: "🕌", patients: "+٢٨٠ مريض" },
        { name: "كربلاء", flag: "✨", patients: "+٢٢٠ مريض" },
        { name: "السليمانية", flag: "🌄", patients: "+١٨٠ مريض" },
        { name: "الناصرية", flag: "🏛️", patients: "+١٢٠ مريض" },
      ],
    },
    booking: {
      title: "احجز استشارتك المجانية",
      subtitle: "منسّقنا الطبي العراقي يتواصل معك خلال ساعة واحدة",
      features: [
        { icon: "🇮🇶", title: "فريق عراقي متخصص", desc: "منسّقون عراقيون يفهمون وضعك ويتحدثون لغتك." },
        { icon: "💰", title: "دفع بالدينار العراقي", desc: "ندعم الدفع بالدينار العراقي أو الدولار أو التحويل البنكي." },
        { icon: "📱", title: "واتساب وتيليغرام", desc: "تواصل معنا بالطريقة الأسهل لك — واتساب أو تيليغرام أو كول." },
      ],
      whatsapp: "تواصل عبر واتساب",
      orForm: "أو أرسل طلبك هنا",
      name: "الاسم الكامل",
      city: "مدينتك في العراق",
      phone: "رقم الهاتف / واتساب",
      condition: "الحالة الطبية باختصار",
      submit: "أرسل الطلب",
      note: "سيتواصل معك فريقنا خلال ساعة — مجاناً بدون أي التزام",
    },
    faq: {
      title: "أسئلة يسألها المرضى العراقيون",
      subtitle: "نجاوب على كل استفساراتك بصراحة",
      items: [
        {
          q: "هل أحتاج تأشيرة لأسافر للعلاج في أمريكا؟",
          a: "نعم، تحتاج تأشيرة B-1/B-2 للسياحة الطبية. فريقنا يساعدك في إعداد جميع الوثائق المطلوبة من رسائل المستشفى وتقارير طبية وغيرها. نسبة نجاح تأشيرات عملائنا تتجاوز ٩٠٪.",
        },
        {
          q: "كم يستغرق الحصول على موعد مع طبيب أمريكي؟",
          a: "عادةً بين ٤٨ ساعة و٧ أيام للاستشارة الأونلاين، وبين أسبوعين وشهر للعلاج الفيزيائي في أمريكا حسب نوع الحالة وأولويتها.",
        },
        {
          q: "هل تقبلون الدفع بالدينار العراقي؟",
          a: "نعم، نقبل الدينار العراقي عبر شركاء الصرافة المعتمدين في بغداد والبصرة وأربيل، بالإضافة إلى الدولار والتحويل البنكي الدولي وبطاقات الائتمان.",
        },
        {
          q: "هل يوجد مترجم عربي في المستشفيات الأمريكية؟",
          a: "نعم، جميع المستشفيات الشريكة معنا توفر خدمات ترجمة طبية معتمدة. بالإضافة لذلك نوفر مرافقاً عربياً من فريقنا لباقة السفاري الطبي.",
        },
        {
          q: "هل التشخيصات الأمريكية تختلف عن التشخيصات في العراق؟",
          a: "في كثير من الحالات، التكنولوجيا الطبية في أمريكا تكشف أشياء لا تظهر في فحوصات عادية. كثير من مرضانا العراقيين حصلوا على تشخيصات مختلفة أو أدق مما حصلوا عليه سابقاً.",
        },
      ],
    },
    cta: {
      title: "صحتك تستحق الأفضل",
      sub: "لا تنتظر — كل يوم تأخير قد يكون مهماً. فريقنا العراقي مستعد الآن.",
      book: "احجز استشارة مجانية",
      whatsapp: "واتساب مباشر",
    },
    footer: {
      tagline: "نربط العراقيين بأفضل رعاية طبية أمريكية — من بيتك في العراق إلى أفضل مستشفيات العالم.",
      services: { title: "خدماتنا", links: ["استشارات طبية", "تنسيق السفر", "رأي ثانٍ", "متابعة ما بعد العلاج", "فحوصات شاملة"] },
      cities: { title: "المدن", links: ["بغداد", "البصرة", "أربيل", "الموصل", "النجف", "كربلاء"] },
      contact: { title: "تواصل معنا", wa: "+964 750 123 4567", email: "iraq@mediconnect.com", hours: "متاح ٢٤/٧" },
      copyright: "© ٢٠٢٥ MediConnect العراق. جميع الحقوق محفوظة.",
      legal: ["سياسة الخصوصية", "الشروط والأحكام", "HIPAA"],
    },
  },

  en: {
    dir: "ltr",
    lang: "en",
    nav: {
      logo1: "Medi",
      logo2: "Connect",
      badge: "Iraq",
      links: ["How It Works", "Success Stories", "Packages", "FAQs"],
      whatsapp: "WhatsApp",
      book: "Book Now",
    },
    hero: {
      eyebrow: "🇮🇶 For Iraqi Patients — Full Service From Home to Hospital",
      title: "World-Class U.S. Medical Care\nFrom Iraq",
      subtitle:
        "We connect Iraqi patients with top U.S. board-certified doctors — online consultation, travel coordination, and complete treatment at America's finest hospitals. Available from all Iraqi cities.",
      book: "Book Your Free Consultation",
      learn: "How We Help",
      trust1: "No Waiting Lists",
      trust2: "Arabic Support 24/7",
      trust3: "Pay in IQD or USD",
      served: "+3,200",
      servedLabel: "Iraqi Patients Treated",
      cities: "Serving Baghdad · Basra · Erbil · Mosul · Najaf · Karbala · Nasiriyah & all provinces",
    },
    stats: [
      { value: "+3,200", label: "Iraqi Patients Treated" },
      { value: "98%", label: "Patient Satisfaction" },
      { value: "+200", label: "U.S. Certified Doctors" },
      { value: "48 hrs", label: "Appointment Ready In" },
    ],
    howItWorks: {
      title: "Your Medical Journey Step by Step",
      subtitle: "From Baghdad to America's best hospitals — we're with you every step of the way",
      steps: [
        {
          icon: "💬",
          num: "1",
          title: "Free Online Consultation",
          desc: "Speak with our Iraqi medical coordinator for free. We review your file and identify the right specialist.",
          points: ["Arabic-language support", "Free medical file review", "Specialist recommendation"],
        },
        {
          icon: "🏥",
          num: "2",
          title: "Specialist Video Consultation",
          desc: "Direct video call with your U.S. board-certified specialist. Diagnosis and treatment plan.",
          points: ["Live interpretation if needed", "Detailed medical report", "Clear treatment roadmap"],
        },
        {
          icon: "✈️",
          num: "3",
          title: "Travel & Treatment Coordination",
          desc: "We arrange everything: medical visa, flights from your nearest airport, accommodation, and hospital escort.",
          points: ["U.S. medical visa support", "Flight & hotel booking", "Arabic companion in the U.S."],
        },
        {
          icon: "🔄",
          num: "4",
          title: "Follow-up After You Return",
          desc: "You return home to Iraq and we don't leave your side. Continuous remote follow-up with your medical team.",
          points: ["Regular follow-up sessions", "Medication & prescription management", "Reports for your local doctor"],
        },
      ],
    },
    conditions: {
      title: "We Specialize in Complex Cases",
      subtitle: "Conditions that are difficult to treat in Iraq — we open doors to the world's best medicine",
      list: [
        { icon: "❤️", name: "Heart & Vascular Disease" },
        { icon: "🧠", name: "Brain Tumors & Neurology" },
        { icon: "🩸", name: "Blood Cancers & Oncology" },
        { icon: "🦴", name: "Orthopedic & Joint Surgery" },
        { icon: "👁️", name: "Advanced Ophthalmology" },
        { icon: "🫁", name: "Pulmonology & Respiratory" },
        { icon: "🧬", name: "Genetic & Rare Diseases" },
        { icon: "🩺", name: "Comprehensive Checkups" },
      ],
    },
    testimonials: {
      title: "Iraqi Patients Who Found Healing",
      subtitle: "Real stories from cities across Iraq",
      items: [
        {
          name: "Abu Ali Al-Musawi",
          city: "Najaf",
          procedure: "Open Heart Surgery",
          stars: 5,
          text: "I waited 8 months for an appointment in Baghdad. MediConnect arranged an appointment at Cleveland Clinic in two weeks. The surgery was successful and I'm now in full health, thank God.",
        },
        {
          name: "Um Sara Al-Jubouri",
          city: "Baghdad",
          procedure: "Breast Cancer Treatment",
          stars: 5,
          text: "The diagnosis was a shock. But the MediConnect team guided me from day one — they arranged everything from visa to treatment to accommodation. Today I'm well and eternally grateful.",
        },
        {
          name: "Kareem Ibrahim Al-Obeidi",
          city: "Basra",
          procedure: "Knee Replacement",
          stars: 5,
          text: "I couldn't walk normally. After an online consultation and successful surgery in Houston, I returned to Basra walking and running with my children.",
        },
        {
          name: "Dr. Haytham Al-Rawi",
          city: "Erbil",
          procedure: "Rare Brain Tumor",
          stars: 5,
          text: "As an Iraqi doctor, I know our limitations. My case required rare expertise. MediConnect connected me to Johns Hopkins. The results exceeded my expectations.",
        },
      ],
    },
    pricing: {
      title: "Clear Packages, No Surprises",
      subtitle: "All prices are inclusive and fixed upfront",
      popular: "Most Popular",
      iqd: "≈ {iqd} Iraqi Dinar",
      custom: "Need a custom plan? Contact us directly via WhatsApp",
      plans: [
        {
          name: "Initial Consultation",
          desc: "Get informed & oriented",
          price: "$199",
          iqd: "261,000",
          period: "one-time",
          features: [
            "60-min video consultation",
            "Medical file review",
            "Detailed medical opinion",
            "Proposed treatment plan",
            "Report in Arabic & English",
          ],
          highlight: false,
          cta: "Start Now",
        },
        {
          name: "Comprehensive Package",
          desc: "Most chosen by Iraqi patients",
          price: "$599",
          iqd: "784,000",
          period: "one-time",
          features: [
            "90-min consultation + follow-up",
            "Full comprehensive diagnosis",
            "Complete treatment plan",
            "Medical visa assistance",
            "U.S. hospital coordination",
          ],
          highlight: true,
          cta: "Choose Package",
        },
        {
          name: "Medical Travel Package",
          desc: "Iraq to America, fully arranged",
          price: "$1,299",
          iqd: "1,700,000",
          period: "one-time",
          features: [
            "All Comprehensive features",
            "Flight & hotel booking",
            "Arabic companion in the U.S.",
            "Three follow-up sessions",
            "24/7 concierge support",
          ],
          highlight: false,
          cta: "Book the Trip",
        },
      ],
    },
    cities: {
      title: "Serving All Iraqi Provinces",
      subtitle: "Partner offices in major cities — reach us from anywhere",
      list: [
        { name: "Baghdad", flag: "🏙️", patients: "+1,200 patients" },
        { name: "Basra", flag: "🌊", patients: "+600 patients" },
        { name: "Erbil", flag: "🏔️", patients: "+500 patients" },
        { name: "Mosul", flag: "🌿", patients: "+320 patients" },
        { name: "Najaf", flag: "🕌", patients: "+280 patients" },
        { name: "Karbala", flag: "✨", patients: "+220 patients" },
        { name: "Sulaymaniyah", flag: "🌄", patients: "+180 patients" },
        { name: "Nasiriyah", flag: "🏛️", patients: "+120 patients" },
      ],
    },
    booking: {
      title: "Book Your Free Consultation",
      subtitle: "Our Iraqi medical coordinator will reach you within one hour",
      features: [
        { icon: "🇮🇶", title: "Iraqi-Speaking Team", desc: "Iraqi coordinators who understand your situation and speak your language." },
        { icon: "💰", title: "Pay in Iraqi Dinar", desc: "We support payment in IQD via our certified exchange partners, or USD & bank transfer." },
        { icon: "📱", title: "WhatsApp & Telegram", desc: "Reach us the easiest way — WhatsApp, Telegram, or a regular call." },
      ],
      whatsapp: "Contact via WhatsApp",
      orForm: "Or send your request here",
      name: "Full Name",
      city: "Your City in Iraq",
      phone: "Phone / WhatsApp Number",
      condition: "Medical Condition (briefly)",
      submit: "Send Request",
      note: "Our team will contact you within one hour — free, no commitment required",
    },
    faq: {
      title: "Questions Iraqi Patients Ask",
      subtitle: "We answer all your questions honestly",
      items: [
        {
          q: "Do I need a visa to travel to the U.S. for medical treatment?",
          a: "Yes, you need a B-1/B-2 visa for medical tourism. Our team assists with all required documents including hospital letters, medical reports, and more. Our clients' visa success rate exceeds 90%.",
        },
        {
          q: "How long does it take to get an appointment with a U.S. doctor?",
          a: "Usually 48 hours to 7 days for an online consultation, and 2 weeks to 1 month for in-person treatment in the U.S., depending on the case type and urgency.",
        },
        {
          q: "Do you accept payment in Iraqi Dinar?",
          a: "Yes, we accept Iraqi Dinar via certified exchange partners in Baghdad, Basra, and Erbil, in addition to USD, international bank transfers, and credit cards.",
        },
        {
          q: "Is there an Arabic interpreter available in U.S. hospitals?",
          a: "Yes, all our partner hospitals provide certified medical interpretation services. We also provide an Arabic companion from our team in the Medical Travel Package.",
        },
        {
          q: "Are U.S. diagnoses different from those in Iraq?",
          a: "In many cases, U.S. medical technology detects things that don't show in regular tests. Many of our Iraqi patients received different or more precise diagnoses than what they had previously.",
        },
      ],
    },
    cta: {
      title: "Your Health Deserves the Best",
      sub: "Don't wait — every day of delay could matter. Our Iraqi team is ready now.",
      book: "Book Free Consultation",
      whatsapp: "Direct WhatsApp",
    },
    footer: {
      tagline: "Connecting Iraqis with the best U.S. medical care — from your home in Iraq to the world's finest hospitals.",
      services: { title: "Services", links: ["Medical Consultations", "Travel Coordination", "Second Opinion", "Post-Treatment Follow-up", "Comprehensive Checkups"] },
      cities: { title: "Cities", links: ["Baghdad", "Basra", "Erbil", "Mosul", "Najaf", "Karbala"] },
      contact: { title: "Contact Us", wa: "+964 750 123 4567", email: "iraq@mediconnect.com", hours: "Available 24/7" },
      copyright: "© 2025 MediConnect Iraq. All rights reserved.",
      legal: ["Privacy Policy", "Terms & Conditions", "HIPAA"],
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Stars({ n }: { n: number }) {
  return (
    <span>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} style={{ color: C.gold }}>★</span>
      ))}
    </span>
  );
}

function FAQItem({ q, a, isRTL }: { q: string, a: string, isRTL: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        borderBottom: `1px solid ${C.border}`,
        padding: "1.25rem 0",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <p style={{ margin: 0, fontWeight: 700, color: C.ink, fontSize: "0.95rem", flex: 1 }}>{q}</p>
        <span style={{ color: C.teal, fontSize: "1.4rem", fontWeight: 300, flexShrink: 0, lineHeight: 1 }}>
          {open ? "−" : "+"}
        </span>
      </div>
      {open && (
        <p style={{ margin: "0.75rem 0 0", color: C.muted, fontSize: "0.88rem", lineHeight: 1.8 }}>{a}</p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MediConnectIraq() {
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const t = T[locale];
  const isRTL = t.dir === "rtl";
  const font = isRTL
    ? "'Cairo', 'Tajawal', sans-serif"
    : "'Plus Jakarta Sans', 'Segoe UI', sans-serif";

  return (
    <div dir={t.dir} lang={t.lang} style={{ fontFamily: font, color: C.ink, background: C.bg, overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        a { text-decoration: none; color: inherit; }
        button { cursor: pointer; border: none; font-family: inherit; }
        input, select, textarea { font-family: inherit; outline: none; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
        .fade-up { animation: fadeUp 0.6s ease both; }
        .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(13,110,110,0.13) !important; }
        .btn-gold { transition: all 0.2s ease; }
        .btn-gold:hover { background: ${C.goldDark} !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201,168,76,0.4); }
        .btn-teal { transition: all 0.2s ease; }
        .btn-teal:hover { background: ${C.tealDark} !important; transform: translateY(-2px); }
        .wa-btn { transition: all 0.2s ease; }
        .wa-btn:hover { background: #1da851 !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,211,102,0.4); }
      `}</style>

      {/* ── TOPBAR ── */}
      <div style={{ background: C.teal, color: "#fff", padding: "8px 2rem", fontSize: "0.78rem", textAlign: "center" }}>
        <span style={{ animation: "shimmer 2.5s infinite" }}>
          🇮🇶 {t.hero.cities}
        </span>
      </div>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 200,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
        padding: "0 2rem",
        height: 68,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: "1rem",
          }}>M</div>
          <div>
            <span style={{ fontWeight: 800, fontSize: "1.15rem", color: C.teal }}>{t.nav.logo1}</span>
            <span style={{ fontWeight: 800, fontSize: "1.15rem", color: C.ink }}>{t.nav.logo2}</span>
            <span style={{
              background: C.goldLight, color: C.goldDark,
              fontSize: "0.62rem", fontWeight: 700,
              padding: "2px 7px", borderRadius: 20,
              marginInlineStart: "0.4rem",
              letterSpacing: "0.04em",
            }}>{t.nav.badge}</span>
          </div>
        </div>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>
          {t.nav.links.map(l => (
            <a key={l} href="#" style={{ fontSize: "0.875rem", fontWeight: 600, color: C.slate, transition: "color 0.2s" }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = C.teal}
              onMouseLeave={e => (e.target as HTMLElement).style.color = C.slate}>{l}</a>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            style={{ background: "#f3f4f6", color: C.slate, padding: "7px 14px", borderRadius: 8, fontWeight: 700, fontSize: "0.78rem" }}>
            {locale === "ar" ? "English" : "العربية"}
          </button>
          <button className="wa-btn" style={{
            background: "#25D366", color: "#fff",
            padding: "9px 16px", borderRadius: 8, fontWeight: 700, fontSize: "0.8rem",
            display: "flex", alignItems: "center", gap: "0.4rem",
          }}>
            <span>📱</span> {t.nav.whatsapp}
          </button>
          <button className="btn-gold" style={{
            background: C.gold, color: "#fff",
            padding: "9px 18px", borderRadius: 8, fontWeight: 700, fontSize: "0.85rem",
          }}>
            {t.nav.book}
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        background: `linear-gradient(150deg, #04312E 0%, #064444 40%, #0A5A5A 75%, #0D6E6E 100%)`,
        padding: "5rem 2rem 4rem",
        position: "relative",
        overflow: "hidden",
        color: "#fff",
      }}>
        {/* Decorative geometric pattern */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.06,
          backgroundImage: `repeating-linear-gradient(45deg, ${C.gold} 0, ${C.gold} 1px, transparent 0, transparent 50%)`,
          backgroundSize: "24px 24px",
        }} />
        {/* Gold arc */}
        <div style={{
          position: "absolute", top: -120, right: isRTL ? "auto" : -120, left: isRTL ? -120 : "auto",
          width: 500, height: 500, borderRadius: "50%",
          background: `radial-gradient(circle, ${C.gold}22 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <p className="fade-up" style={{
            fontSize: "0.85rem", fontWeight: 600,
            background: `${C.gold}25`, color: C.goldLight,
            display: "inline-block", padding: "6px 16px", borderRadius: 20,
            border: `1px solid ${C.gold}50`, marginBottom: "1.5rem",
          }}>{t.hero.eyebrow}</p>

          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "3rem", alignItems: "center" }}>
            <div className="fade-up">
              <h1 style={{
                fontSize: "clamp(2.1rem, 4.5vw, 3.4rem)", fontWeight: 900,
                lineHeight: 1.15, marginBottom: "1.5rem",
                whiteSpace: "pre-line",
              }}>
                {t.hero.title.split("\n")[0]}{"\n"}
                <span style={{ color: C.gold }}>{t.hero.title.split("\n")[1]}</span>
              </h1>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1rem", lineHeight: 1.8, marginBottom: "2rem", maxWidth: 520 }}>
                {t.hero.subtitle}
              </p>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                <button className="btn-gold" style={{
                  background: C.gold, color: "#fff",
                  padding: "14px 28px", borderRadius: 10, fontWeight: 800, fontSize: "0.95rem",
                }}>
                  {t.hero.book}
                </button>
                <button style={{
                  background: "transparent", color: "#fff",
                  padding: "14px 28px", borderRadius: 10, fontWeight: 700, fontSize: "0.95rem",
                  border: "2px solid rgba(255,255,255,0.35)",
                  transition: "all 0.2s",
                }}>
                  {t.hero.learn}
                </button>
              </div>
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                {[t.hero.trust1, t.hero.trust2, t.hero.trust3].map(tr => (
                  <span key={tr} style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <span style={{ color: C.gold }}>✓</span> {tr}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats card */}
            <div className="fade-up" style={{ animationDelay: "0.15s" }}>
              <div style={{
                background: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(16px)",
                borderRadius: 20,
                padding: "2rem",
                border: "1px solid rgba(255,255,255,0.12)",
              }}>
                {/* Big stat */}
                <div style={{
                  textAlign: "center", marginBottom: "1.5rem", paddingBottom: "1.5rem",
                  borderBottom: "1px solid rgba(255,255,255,0.12)",
                }}>
                  <p style={{ fontSize: "3.5rem", fontWeight: 900, color: C.gold, lineHeight: 1 }}>{t.hero.served}</p>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginTop: "0.35rem" }}>{t.hero.servedLabel}</p>
                </div>
                {/* 4 mini stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  {t.stats.map(s => (
                    <div key={s.label} style={{
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 12, padding: "1rem",
                      border: "1px solid rgba(255,255,255,0.08)",
                      textAlign: "center",
                    }}>
                      <p style={{ fontSize: "1.5rem", fontWeight: 800, color: C.gold, lineHeight: 1 }}>{s.value}</p>
                      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.72rem", marginTop: "0.25rem" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "5rem 2rem", background: C.bg }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ color: C.teal, fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
              {isRTL ? "العملية" : "THE PROCESS"}
            </p>
            <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, color: C.ink, marginBottom: "0.75rem" }}>
              {t.howItWorks.title}
            </h2>
            <p style={{ color: C.muted, maxWidth: 520, margin: "0 auto", fontSize: "0.9rem" }}>{t.howItWorks.subtitle}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {t.howItWorks.steps.map((step, i) => (
              <div key={step.title} className="card-hover" style={{
                background: C.white,
                borderRadius: 18,
                padding: "1.75rem",
                border: `1px solid ${C.border}`,
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Step number watermark */}
                <span style={{
                  position: "absolute", top: 12, insetInlineEnd: 18,
                  fontSize: "4rem", fontWeight: 900, color: C.tealLight,
                  lineHeight: 1, pointerEvents: "none", userSelect: "none",
                }}>{step.num}</span>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: C.tealLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.6rem", marginBottom: "1rem",
                }}>{step.icon}</div>
                <h3 style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "0.6rem", color: C.ink }}>{step.title}</h3>
                <p style={{ color: C.muted, fontSize: "0.83rem", marginBottom: "1rem", lineHeight: 1.7 }}>{step.desc}</p>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {step.points.map(pt => (
                    <li key={pt} style={{ fontSize: "0.8rem", color: C.slate, marginBottom: "0.35rem", display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                      <span style={{ color: C.teal, fontWeight: 700, marginTop: "1px" }}>✓</span> {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONDITIONS ── */}
      <section style={{ padding: "4rem 2rem", background: `linear-gradient(135deg, ${C.tealLight} 0%, #fff 100%)` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 900, color: C.ink, marginBottom: "0.6rem" }}>
              {t.conditions.title}
            </h2>
            <p style={{ color: C.muted, fontSize: "0.9rem" }}>{t.conditions.subtitle}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            {t.conditions.list.map(c => (
              <div key={c.name} className="card-hover" style={{
                background: C.white,
                borderRadius: 14, padding: "1.25rem 1rem",
                border: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", gap: "0.75rem",
              }}>
                <span style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: C.tealLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.4rem", flexShrink: 0,
                }}>{c.icon}</span>
                <span style={{ fontWeight: 700, fontSize: "0.85rem", color: C.ink }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "5rem 2rem", background: C.ink }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ color: C.gold, fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
              {isRTL ? "قصص حقيقية" : "REAL STORIES"}
            </p>
            <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, color: "#fff", marginBottom: "0.6rem" }}>
              {t.testimonials.title}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9rem" }}>{t.testimonials.subtitle}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: "1.5rem" }}>
            {t.testimonials.items.map(item => (
              <div key={item.name} className="card-hover" style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(8px)",
                borderRadius: 18, padding: "1.75rem",
                border: "1px solid rgba(255,255,255,0.1)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${C.teal}, ${C.gold})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, color: "#fff", fontSize: "1.1rem", flexShrink: 0,
                  }}>
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: "#fff", margin: 0, fontSize: "0.88rem" }}>{item.name}</p>
                    <p style={{ color: C.gold, margin: 0, fontSize: "0.75rem" }}>
                      📍 {item.city} · {item.procedure}
                    </p>
                  </div>
                </div>
                <div style={{ marginBottom: "0.75rem" }}><Stars n={item.stars} /></div>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", lineHeight: 1.75, margin: 0 }}>
                  "{item.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: "5rem 2rem", background: C.bg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, color: C.ink, marginBottom: "0.6rem" }}>
              {t.pricing.title}
            </h2>
            <p style={{ color: C.muted, fontSize: "0.9rem" }}>{t.pricing.subtitle}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "1.5rem", alignItems: "start" }}>
            {t.pricing.plans.map(plan => (
              <div key={plan.name} style={{
                background: plan.highlight ? C.teal : C.white,
                color: plan.highlight ? "#fff" : C.ink,
                borderRadius: 20, padding: "2rem",
                border: plan.highlight ? "none" : `1px solid ${C.border}`,
                boxShadow: plan.highlight ? `0 24px 64px ${C.teal}50` : "0 4px 16px rgba(0,0,0,0.04)",
                position: "relative",
                transform: plan.highlight ? "scale(1.03)" : "none",
                transition: "transform 0.3s ease",
              }}>
                {plan.highlight && (
                  <div style={{
                    position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                    background: C.gold, color: "#fff",
                    fontSize: "0.7rem", fontWeight: 800, padding: "5px 16px", borderRadius: 20,
                    letterSpacing: "0.08em", whiteSpace: "nowrap",
                    boxShadow: "0 4px 12px rgba(201,168,76,0.4)",
                  }}>{t.pricing.popular}</div>
                )}
                <h3 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.2rem" }}>{plan.name}</h3>
                <p style={{ fontSize: "0.78rem", opacity: 0.65, marginBottom: "1.25rem" }}>{plan.desc}</p>
                <div style={{ marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "2.5rem", fontWeight: 900, color: plan.highlight ? C.gold : C.teal }}>{plan.price}</span>
                  <span style={{ fontSize: "0.78rem", opacity: 0.6, marginInlineStart: "0.4rem" }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: "0.75rem", opacity: 0.6, marginBottom: "1.5rem" }}>
                  {t.pricing.iqd.replace("{iqd}", plan.iqd)}
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.75rem" }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ fontSize: "0.83rem", marginBottom: "0.6rem", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                      <span style={{ color: plan.highlight ? C.goldLight : C.teal, marginTop: "2px", flexShrink: 0 }}>✓</span>
                      <span style={{ opacity: 0.9 }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={plan.highlight ? "btn-gold" : "btn-teal"} style={{
                  width: "100%", padding: "13px",
                  borderRadius: 10, fontWeight: 800, fontSize: "0.9rem",
                  background: plan.highlight ? C.gold : C.teal,
                  color: "#fff",
                }}>{plan.cta}</button>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", color: C.muted, fontSize: "0.82rem", marginTop: "2rem" }}>{t.pricing.custom}</p>
        </div>
      </section>

      {/* ── CITIES ── */}
      <section style={{ padding: "4rem 2rem", background: C.white }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 900, color: C.ink, marginBottom: "0.6rem" }}>
              {t.cities.title}
            </h2>
            <p style={{ color: C.muted, fontSize: "0.9rem" }}>{t.cities.subtitle}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            {t.cities.list.map(city => (
              <div key={city.name} className="card-hover" style={{
                background: C.bg,
                borderRadius: 14, padding: "1.25rem",
                border: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", gap: "0.75rem",
              }}>
                <span style={{ fontSize: "1.75rem" }}>{city.flag}</span>
                <div>
                  <p style={{ fontWeight: 800, color: C.ink, margin: 0, fontSize: "0.9rem" }}>{city.name}</p>
                  <p style={{ color: C.teal, margin: 0, fontSize: "0.72rem", fontWeight: 600 }}>{city.patients}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOOKING ── */}
      <section style={{ padding: "5rem 2rem", background: `linear-gradient(135deg, ${C.tealLight} 0%, #fff 100%)` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }}>
          {/* Left */}
          <div>
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 900, color: C.ink, marginBottom: "0.75rem" }}>
              {t.booking.title}
            </h2>
            <p style={{ color: C.muted, marginBottom: "2rem", fontSize: "0.9rem", lineHeight: 1.7 }}>{t.booking.subtitle}</p>

            {t.booking.features.map(f => (
              <div key={f.title} style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "flex-start" }}>
                <span style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: C.teal,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.3rem", flexShrink: 0,
                }}>{f.icon}</span>
                <div>
                  <p style={{ fontWeight: 800, margin: "0 0 0.2rem", fontSize: "0.9rem", color: C.ink }}>{f.title}</p>
                  <p style={{ color: C.muted, margin: 0, fontSize: "0.82rem", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}

            <button className="wa-btn" style={{
              background: "#25D366", color: "#fff",
              padding: "14px 28px", borderRadius: 12, fontWeight: 800, fontSize: "0.95rem",
              display: "inline-flex", alignItems: "center", gap: "0.6rem",
              marginTop: "0.75rem",
            }}>
              📱 {t.booking.whatsapp}
            </button>
          </div>

          {/* Right – form */}
          <div style={{
            background: C.white,
            borderRadius: 20, padding: "2rem",
            boxShadow: "0 8px 40px rgba(13,110,110,0.1)",
            border: `1px solid ${C.border}`,
          }}>
            <p style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "1.5rem", color: C.teal }}>
              {t.booking.orForm}
            </p>
            {[
              { ph: t.booking.name, type: "text" },
              { ph: t.booking.city, type: "text" },
              { ph: t.booking.phone, type: "tel" },
            ].map(field => (
              <input key={field.ph} type={field.type} placeholder={field.ph} style={{
                width: "100%", display: "block",
                padding: "11px 14px", marginBottom: "0.85rem",
                border: `1px solid ${C.border}`, borderRadius: 10,
                fontSize: "0.875rem", color: C.ink,
                background: C.bg,
              }} />
            ))}
            <textarea placeholder={t.booking.condition} rows={3} style={{
              width: "100%", display: "block",
              padding: "11px 14px", marginBottom: "1.25rem",
              border: `1px solid ${C.border}`, borderRadius: 10,
              fontSize: "0.875rem", color: C.ink,
              background: C.bg, resize: "vertical",
            }} />
            <button className="btn-teal" style={{
              width: "100%", background: C.teal, color: "#fff",
              padding: "14px", borderRadius: 10,
              fontWeight: 800, fontSize: "0.95rem",
            }}>
              {t.booking.submit}
            </button>
            <p style={{ textAlign: "center", color: C.muted, fontSize: "0.75rem", marginTop: "1rem" }}>
              {t.booking.note}
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "5rem 2rem", background: C.bg }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, color: C.ink, marginBottom: "0.6rem" }}>
              {t.faq.title}
            </h2>
            <p style={{ color: C.muted, fontSize: "0.9rem" }}>{t.faq.subtitle}</p>
          </div>
          <div style={{ background: C.white, borderRadius: 18, padding: "0 1.75rem", border: `1px solid ${C.border}` }}>
            {t.faq.items.map(item => (
              <FAQItem key={item.q} q={item.q} a={item.a} isRTL={isRTL} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        background: `linear-gradient(135deg, ${C.goldDark} 0%, ${C.gold} 50%, #E8C46A 100%)`,
        padding: "5rem 2rem", textAlign: "center",
      }}>
        <h2 style={{ fontSize: "clamp(1.7rem,3.5vw,2.5rem)", fontWeight: 900, color: "#fff", marginBottom: "1rem" }}>
          {t.cta.title}
        </h2>
        <p style={{ color: "rgba(255,255,255,0.85)", maxWidth: 500, margin: "0 auto 2.25rem", fontSize: "0.95rem", lineHeight: 1.7 }}>
          {t.cta.sub}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          <button className="btn-teal" style={{
            background: C.teal, color: "#fff",
            padding: "14px 28px", borderRadius: 10, fontWeight: 800, fontSize: "0.95rem",
          }}>{t.cta.book}</button>
          <button className="wa-btn" style={{
            background: "#25D366", color: "#fff",
            padding: "14px 28px", borderRadius: 10, fontWeight: 800, fontSize: "0.95rem",
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
          }}>
            📱 {t.cta.whatsapp}
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: C.ink, color: "#94a3b8", padding: "3.5rem 2rem 1.5rem" }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: "2.5rem",
          marginBottom: "2.5rem",
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 800,
              }}>M</div>
              <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>
                <span style={{ color: C.gold }}>Medi</span>
                <span style={{ color: "#fff" }}>Connect</span>
              </span>
              <span style={{
                background: `${C.gold}25`, color: C.gold,
                fontSize: "0.6rem", fontWeight: 700, padding: "2px 7px", borderRadius: 12,
              }}>🇮🇶 Iraq</span>
            </div>
            <p style={{ fontSize: "0.84rem", lineHeight: 1.75, maxWidth: 240 }}>{t.footer.tagline}</p>
            <div style={{ display: "flex", gap: "0.6rem", marginTop: "1.25rem" }}>
              {["📘", "📸", "▶", "💬"].map(ic => (
                <span key={ic} style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: "rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.9rem", cursor: "pointer",
                }}>{ic}</span>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <p style={{ fontWeight: 700, color: "#fff", marginBottom: "1rem", fontSize: "0.9rem" }}>{t.footer.services.title}</p>
            {t.footer.services.links.map(l => (
              <a key={l} href="#" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.83rem" }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = C.gold}
                onMouseLeave={e => (e.target as HTMLElement).style.color = "#94a3b8"}>{l}</a>
            ))}
          </div>

          {/* Cities */}
          <div>
            <p style={{ fontWeight: 700, color: "#fff", marginBottom: "1rem", fontSize: "0.9rem" }}>{t.footer.cities.title}</p>
            {t.footer.cities.links.map(l => (
              <a key={l} href="#" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.83rem" }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = C.gold}
                onMouseLeave={e => (e.target as HTMLElement).style.color = "#94a3b8"}>{l}</a>
            ))}
          </div>

          {/* Contact */}
          <div>
            <p style={{ fontWeight: 700, color: "#fff", marginBottom: "1rem", fontSize: "0.9rem" }}>{t.footer.contact.title}</p>
            <p style={{ fontSize: "0.83rem", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              📱 {t.footer.contact.wa}
            </p>
            <p style={{ fontSize: "0.83rem", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              📧 {t.footer.contact.email}
            </p>
            <p style={{ fontSize: "0.83rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              🕐 {t.footer.contact.hours}
            </p>
          </div>
        </div>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: "1.5rem",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "1rem",
        }}>
          <p style={{ fontSize: "0.78rem", margin: 0 }}>{t.footer.copyright}</p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {t.footer.legal.map(l => (
              <a key={l} href="#" style={{ fontSize: "0.78rem" }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = C.gold}
                onMouseLeave={e => (e.target as HTMLElement).style.color = "#94a3b8"}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

