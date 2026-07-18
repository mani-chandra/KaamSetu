import type { Locale } from "./translations";

export type LegalSection = { title: string; body: string[] };

export type LegalDocument = {
  title: string;
  updated: string;
  sections: LegalSection[];
};

export const legalContent: Record<
  Locale,
  { terms: LegalDocument; privacy: LegalDocument; backHome: string; lastUpdated: string }
> = {
  en: {
    backHome: "← Back to home",
    lastUpdated: "Last updated:",
    terms: {
      title: "Terms of Service",
      updated: "July 17, 2026",
      sections: [
        {
          title: "1. Acceptance of Terms",
          body: [
            "By accessing or using KaamSetu, you agree to these Terms of Service. If you do not agree, please do not use the platform.",
            "KaamSetu connects customers with independent service professionals. We facilitate discovery, booking, and payments but are not the direct provider of listed services unless explicitly stated.",
          ],
        },
        {
          title: "2. Accounts & Roles",
          body: [
            "Customers must provide accurate contact details when booking. Professionals must submit truthful profile information, valid identity or certification documents where requested, and maintain up-to-date availability.",
            "Professional accounts remain inactive until approved by KaamSetu administrators. We may suspend or remove accounts that violate these terms or receive repeated complaints.",
          ],
        },
        {
          title: "3. Bookings & Payments",
          body: [
            "Instant bookings are confirmed at listed prices where available. Quote-based bookings require customer acceptance before work proceeds.",
            "Payments processed through KaamSetu are subject to our payment partner terms. Refunds and disputes are handled according to our cancellation and dispute policies.",
          ],
        },
        {
          title: "4. Conduct",
          body: [
            "Users must not harass others, post false reviews, circumvent platform fees, or use KaamSetu for unlawful activity.",
            "Professionals are responsible for the quality and safety of services they deliver. Customers are responsible for providing safe access to the service location.",
          ],
        },
        {
          title: "5. Limitation of Liability",
          body: [
            "KaamSetu is provided on an \"as is\" basis. To the extent permitted by law, we are not liable for indirect damages arising from services performed by independent professionals.",
            "Our total liability for platform-related claims is limited to the fees paid to KaamSetu for the booking in question during the preceding three months.",
          ],
        },
        {
          title: "6. Changes",
          body: [
            "We may update these terms from time to time. Continued use of the platform after changes are posted constitutes acceptance of the revised terms.",
            "For questions, contact support through the in-app help center.",
          ],
        },
      ],
    },
    privacy: {
      title: "Privacy Policy",
      updated: "July 17, 2026",
      sections: [
        {
          title: "1. Information We Collect",
          body: [
            "We collect account information such as name, email, phone number, and city when you register.",
            "Professionals may upload profile photos, portfolio images, and verification documents. Customers provide booking addresses and service details.",
            "We collect usage data including pages visited, bookings made, and device/browser information to improve the platform.",
          ],
        },
        {
          title: "2. How We Use Information",
          body: [
            "We use your data to operate bookings, process payments, send notifications, verify professionals, and provide customer support.",
            "We may send service-related emails or messages about bookings, quotes, and account status. Marketing messages are sent only where permitted.",
          ],
        },
        {
          title: "3. Sharing",
          body: [
            "Booking details are shared between the customer and assigned professional to complete the service.",
            "We use trusted third parties for payments (Razorpay), email delivery (Resend), and hosting. These providers process data under their own privacy policies.",
            "We do not sell personal information to advertisers.",
          ],
        },
        {
          title: "4. Data Retention & Security",
          body: [
            "We retain account and booking records as long as needed to provide services and meet legal obligations.",
            "We apply reasonable technical and organizational measures to protect data, but no online system is completely secure.",
          ],
        },
        {
          title: "5. Your Rights",
          body: [
            "You may request access, correction, or deletion of your personal data by contacting support, subject to legal and operational requirements.",
            "You can update profile information from your dashboard at any time.",
          ],
        },
        {
          title: "6. Contact",
          body: [
            "For privacy questions, reach out via the Support page in your dashboard or email the address listed in your account communications.",
          ],
        },
      ],
    },
  },
  te: {
    backHome: "← హోమ్‌కు తిరిగి",
    lastUpdated: "చివరిగా నవీకరించబడింది:",
    terms: {
      title: "సేవా నిబంధనలు",
      updated: "జులై 17, 2026",
      sections: [
        {
          title: "1. నిబంధనల అంగీకారం",
          body: [
            "KaamSetuని ఉపయోగించడం ద్వారా మీరు ఈ సేవా నిబంధనలకు అంగీకరిస్తారు. అంగీకరించకపోతే ప్లాట్‌ఫామ్‌ను ఉపయోగించవద్దు.",
            "KaamSetu కస్టమర్లను స్వతంత్ర సేవా ప్రొఫెషనalsతో అనుసంధానిస్తుంది. మేము బుకింగ్‌లు మరియు చెల్లింపులను సులభం చేస్తాము, కానీ సూచించిన సేవల ప్రత్యక్ష ప్రదాత కాదు.",
          ],
        },
        {
          title: "2. ఖాతాలు & పాత్రలు",
          body: [
            "బుకింగ్‌ల సమయంలో కస్టమర్లు సరైన సంప్రదింపు వివరాలను అందించాలి. ప్రొఫెషనals సత్యమైన ప్రొఫైల్ సమాచారం మరియు అప్‌డేట్ అయిన లభ్యతను నిర్వహించాలి.",
            "KaamSetu అడ్మిన్‌లు ఆమోదించే వరకు ప్రొఫెషనal ఖాతాలు నిష్క్రియంగా ఉంటాయి.",
          ],
        },
        {
          title: "3. బుకింగ్‌లు & చెల్లింపులు",
          body: [
            "తక్షణ బుకింగ్‌లు అందుబాటులో ఉన్న ధరలకు నిర్ధారించబడతాయి. కోట్ ఆధారిత బుకింగ్‌లకు కస్టమర్ అంగీకారం అవసరం.",
            "KaamSetu ద్వారా ప్రాసెస్ చేసిన చెల్లింపులు మా చెల్లింపు భాగస్వామి నిబంధనలకు లోబడి ఉంటాయి.",
          ],
        },
        {
          title: "4. ప్రవర్తన",
          body: [
            "వినియోగదారులు ఇతరులను వేధించకూడదు, తప్పుడు సమీక్షలు పోస్ట్ చేయకూడదు, లేదా చట్టవిరుద్ధ కార్యకలాపాలకు ఉపయోగించకూడదు.",
            "ప్రొఫెషనals తాము అందించే సేవల నాణ్యత మరియు భద్రతకు బాధ్యత వహిస్తారు.",
          ],
        },
        {
          title: "5. బాధ్యత పరిమితి",
          body: [
            "KaamSetu \"as is\" ఆధారంగా అందించబడుతుంది. చట్టం అనుమతించిన范围内, స్వతంత్ర ప్రొఫెషనals సేవల నుండి ఏర్పడిన简介 నష్టాలకు మేము బాధ్యత వహించము.",
          ],
        },
        {
          title: "6. మార్పులు",
          body: [
            "మేము ఈ నిబంధనలను అప్‌డేట్ చేయవచ్చు. మార్పుల తర్వాత ప్లాట్‌ఫామ్‌ను కొనసాగించడం-revised నిబంధనల అంగీకారం.",
          ],
        },
      ],
    },
    privacy: {
      title: "గోప్యతా విధానం",
      updated: "జులై 17, 2026",
      sections: [
        {
          title: "1. మేము సేకరించే సమాచారం",
          body: [
            "మీరు నమోదు చేసుకున్నప్పుడు పేరు, ఇమెయిల్, ఫోన్ మరియు నగరం వంటి ఖాతా సమాచారాన్నi సేకరిస్తాము.",
            "ప్రొఫెషనals ప్రొఫైల్ ఫోటోలు, పోర్ట్‌ఫోలియో మరియు ధృవీకరణ పత్రాలను అప్‌లోడ్ చేయవచ్చు.",
          ],
        },
        {
          title: "2. సమాచారాన్నi ఎలా ఉపయోగిస్తాము",
          body: [
            "బుకింగ్‌లు, చెల్లింపులు, నోటిఫికేషన్లు మరియు కస్టమర్ మద్దతు కోసం మీ డేటాను ఉపయోగిస్తాము.",
          ],
        },
        {
          title: "3. షేరింగ్",
          body: [
            "బుకింగ్ వివరాలు కస్టమర్ మరియు ప్రొఫెషనal మధ్య పంచుకోబడతాయి.",
            "మేము వ్యక్తిగత సమాచారాన్నi ప్రకటనదారులకు అమ్మము.",
          ],
        },
        {
          title: "4. డేటా నిల్వ & భద్రత",
          body: [
            "సేవలు అందించడానికి మరియు చట్టపరమైన బాధ్యతలను తీర్చడానికi అవసరమైనంత కాలం డేటాను నిల్వ చేస్తాము.",
          ],
        },
        {
          title: "5. మీ హక్కులు",
          body: [
            "మీరు మీ వ్యక్తిగత డేటాను యాక్సెస్, సరిదిద్దు లేదా తొలగించమని మద్దతు ద్వారా అభ్యర్థించవచ్చు.",
          ],
        },
        {
          title: "6. సంప్రదింపు",
          body: [
            "గోప్యతా ప్రశ్నల కోసం మీ డాష్‌బోర్డ్‌లోనi Support పేజీ ద్వారా సంప్రదించండి.",
          ],
        },
      ],
    },
  },
  hi: {
    backHome: "← होम पर वापस",
    lastUpdated: "अंतिम अपडेट:",
    terms: {
      title: "सेवा की शर्तें",
      updated: "17 जुलाई, 2026",
      sections: [
        {
          title: "1. शर्तों की स्वीकृति",
          body: [
            "KaamSetu का उपयोग करके आप इन सेवा की शर्तों से सहमत होते हैं। यदि सहमत नहीं हैं, तो प्लेटफ़ॉर्म का उपयोग न करें।",
            "KaamSetu ग्राहकों को स्वतंत्र सेवा प्रोफेशनल से जोड़ता है। हम बुकिंग और भुगतान सुविधाजनक बनाते हैं, लेकिन सूचीबद्ध सेवाओं का प्रत्यक्ष प्रदाता नहीं हैं।",
          ],
        },
        {
          title: "2. खाते और भूमिकाएँ",
          body: [
            "ग्राहकों को बुकिंग के समय सटीक संपर्क विवरण देने होंगे। प्रोफेशनल को सत्य प्रोफ़ाइल जानकारी और अद्यतन उपलब्धता बनाए रखनी होगी।",
            "KaamSetu व्यवस्थापकों की स्वीकृति तक प्रोफेशनल खाते निष्क्रिय रहते हैं।",
          ],
        },
        {
          title: "3. बुकिंग और भुगतान",
          body: [
            "तत्काल बुकिंग उपलब्ध कीमतों पर पुष्टि होती हैं। कोटेशन आधारित बुकिंग के लिए ग्राहक की स्वीकृति आवश्यक है।",
            "KaamSetu के माध्यम से संसाधित भुगतान हमारे भुगतान भागीदार की शर्तों के अधीन हैं।",
          ],
        },
        {
          title: "4. आचरण",
          body: [
            "उपयोगकर्ता दूसरों को परेशान नहीं करें, झूठी समीक्षाएँ न पोस्ट करें, या अवैध गतिविधि के लिए प्लेटफ़ॉर्म का उपयोग न करें।",
            "प्रोफेशनल अपनी सेवाओं की गुणवत्ता और सुरक्षा के लिए जिम्मेदार हैं।",
          ],
        },
        {
          title: "5. दायित्व की सीमा",
          body: [
            "KaamSetu \"जैसा है\" आधार पर प्रदान किया जाता है। कानून द्वारा अनुमत सीमा तक, स्वतंत्र प्रोफेशनल की सेवाओं से उत्पन्न अप्रत्यक्ष क्षति के लिए हम उत्तरदायी नहीं हैं।",
          ],
        },
        {
          title: "6. परिवर्तन",
          body: [
            "हम समय-समय पर इन शर्तों को अपडेट कर सकते हैं। परिवर्तन के बाद प्लेटफ़ॉर्म का उपयोग संशोधित शर्तों की स्वीकृति है।",
          ],
        },
      ],
    },
    privacy: {
      title: "गोपनीयता नीति",
      updated: "17 जुलाई, 2026",
      sections: [
        {
          title: "1. हम कौन सी जानकारी एकत्र करते हैं",
          body: [
            "पंजीकरण पर हम नाम, ईमेल, फ़ोन और शहर जैसी खाता जानकारी एकत्र करते हैं।",
            "प्रोफेशनल प्रोफ़ाइल फ़ोटो, पोर्टफ़ोलियो और सत्यापन दस्तावेज़ अपलोड कर सकते हैं।",
          ],
        },
        {
          title: "2. जानकारी का उपयोग",
          body: [
            "हम आपका डेटा बुकिंग, भुगतान, सूचनाएँ और ग्राहक सहायता के लिए उपयोग करते हैं।",
          ],
        },
        {
          title: "3. साझाकरण",
          body: [
            "बुकिंग विवरण ग्राहक और प्रोफेशनल के बीच साझा किए जाते हैं।",
            "हम व्यक्तिगत जानकारी विज्ञापनदाताओं को नहीं बेचते।",
          ],
        },
        {
          title: "4. डेटा प्रतिधारण और सुरक्षा",
          body: [
            "हम सेवाएँ प्रदान करने और कानूनी दायित्वों के लिए आवश्यकतानुसार डेटा रखते हैं।",
          ],
        },
        {
          title: "5. आपके अधिकार",
          body: [
            "आप सहायता के माध्यम से अपने व्यक्तिगत डेटा तक पहुँच, सुधार या हटाने का अनुरोध कर सकते हैं।",
          ],
        },
        {
          title: "6. संपर्क",
          body: [
            "गोपनीयता प्रश्नों के लिए अपने डैशबोर्ड में Support पेज के माध्यम से संपर्क करें।",
          ],
        },
      ],
    },
  },
};
