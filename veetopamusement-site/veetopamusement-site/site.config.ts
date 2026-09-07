/**
 * ============================================================================
 * VEETOP 独立站 —— 站点唯一配置
 * ============================================================================
 * 品牌、域名、联系方式、公司事实、FAQ 等"占位/可编辑内容"全部集中在本文件。
 *
 * 上线前请按以下步骤替换：
 *   1) 全局搜索 "REPLACE:" 标记，逐项替换为真实内容；
 *   2) 域名：site.domain 换成真实解析到 Vercel 的域名；
 *   3) 表单：site.contact.formEndpoint 填入 Formspree / Web3Forms 等端点地址；
 *   4) 同步修改 .env.example（NEXT_PUBLIC_SITE_URL / NEXT_PUBLIC_CDN_URL）。
 *
 * 数字唯一来源：本文件的 companyFacts 被首页/About/layout JSON-LD/llms.txt
 * 共同引用 —— 修改只在"这一处"改，禁止在页面里硬编码数字（防口径矛盾）。
 * ============================================================================
 */

export interface CategoryLink {
  label: string;
  href: string;
}

export interface NavLink {
  label: string;
  href: string;
}

/** FAQ 问答对（站级/品类级/产品级三层共用结构） */
export interface FaqItem {
  q: string;
  a: string;
}

const site = {
  /* ------------------------------------------------------------------ */
  /* 品牌与站点                                                        */
  /* ------------------------------------------------------------------ */
  brand: {
    name: "VEETOP", // REPLACE: 品牌名
    suffix: "AMUSEMENT", // 商标下方的小字，可改
    legalName: "Guangzhou VEETOP Amusement Equipment Co., Ltd.", // REPLACE: 公司法定全称
    // REPLACE: 正式域名（含协议，无结尾斜杠）
    domain: "https://www.veetopamusement.com",
  },

  /* 默认 meta / OG 文案 */
  seo: {
    title: "VEETOP Amusement | Game & Amusement Equipment Manufacturer",
    description:
      "VEETOP is a B2B manufacturer of arcade video games, redemption machines, claw cranes, kiddie rides, sports & skill games and prize merchandisers. Factory-direct pricing, OEM/ODM supported, CE & UL certified. Request a quote today.",
    keywords: [
      "arcade game manufacturer",
      "amusement equipment supplier",
      "redemption machine",
      "claw crane machine",
      "kiddie ride",
      "prize merchandiser",
      "OEM ODM arcade",
      "VEETOP amusement",
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 联系方式 —— REPLACE: 全部为占位数据                               */
  /* ------------------------------------------------------------------ */
  contact: {
    email: "sales@veetopamusement.com", // REPLACE: 真实询盘邮箱（mailto 与表单都引用这里）
    whatsapp: {
      // REPLACE: 仅数字、含国家码，不含 "+" 或空格（用于 wa.me 跳转）
      number: "8613800000000",
      // REPLACE: 展示用文案
      label: "+86 138 0000 0000",
      // REPLACE: 全站悬浮 WhatsApp 按钮的默认预填话术（可覆盖为多语言/带品牌名）
      message:
        "Hello VEETOP, I'd like a quote for arcade & amusement machines. Please contact me.",
    },
    phone: {
      // REPLACE: tel: 链接用，仅数字含国家码
      tel: "+862000000000",
      // REPLACE: 展示用文案
      label: "+86 20 0000 0000",
    },
    address: {
      // REPLACE: 工厂/公司地址
      line1: "No. 88 Innovation Road, Panyu District",
      line2: "Guangzhou, Guangdong 511400, China",
      // REPLACE: 可选经纬度（本地 SEO / Organization JSON-LD geo）。
      // 填上数字后会自动输出到结构化数据；留空 "" 则忽略该字段。
      geo: {
        latitude: "",
        longitude: "",
      },
    },
    hours: "Mon-Sat 9:00-18:00 (GMT+8)",
    // REPLACE: 询盘表单真实提交端点。
    // 示例：Formspree -> "https://formspree.io/f/xxxxxxx"
    //       Web3Forms -> "https://api.web3forms.com/submit"（需配 access_key 隐藏域）
    // 留空（""）时表单在浏览器端生成一封 mailto 邮件作为占位方案，可正常演示。
    formEndpoint: "",
    formNote:
      "Samples & factory visits are welcome. Usually replies within 24 hours on business days.",
  },

  /* ------------------------------------------------------------------ */
  /* 企业数据声明（示例占位，替换为真实数字 —— 数字唯一来源）         */
  /* ------------------------------------------------------------------ */
  companyFacts: {
    // REPLACE: 全部示例数据；以下每项被多处引用，只在本处修改
    yearFounded: "2008", // 展示用（hero/About/llms 年份）
    foundingDate: "2008-06-18", // REPLACE: ISO 日期（Organization JSON-LD），年份须与 yearFounded 一致
    factoryArea: "18,000 m²", // REPLACE
    exportCountries: "60+ countries", // REPLACE
    employees: "150+", // REPLACE: Organization numberOfEmployees / llms.txt
    monthlyCapacity: "3,000+ units", // REPLACE: llms.txt
    warrantyMonths: 12, // REPLACE: 保修月数（About 数字卡 / FAQ 口径）
    oemOdmNote:
      "OEM / ODM services with private-label cabinet design, artwork & software support.", // REPLACE
    certifications: ["ISO 9001", "CE", "UL", "RoHS", "SAA"], // REPLACE
  },

  /* ------------------------------------------------------------------ */
  /* 社媒（占位 —— Organization sameAs 只输出非空项）                 */
  /* ------------------------------------------------------------------ */
  socials: {
    // REPLACE: 逐项填真实主页 URL；留空 "" 则该平台不会出现在结构化数据里
    facebook: "", // REPLACE: https://www.facebook.com/yourpage
    instagram: "", // REPLACE: https://www.instagram.com/yourpage
    youtube: "", // REPLACE: https://www.youtube.com/@yourchannel
    linkedin: "", // REPLACE: https://www.linkedin.com/company/yourcompany
  },

  /* ------------------------------------------------------------------ */
  /* FAQ 三层分工                                                      */
  /*   站级贸易条款  ->  site.faqs（/faq/ 页 + llms.txt）             */
  /*   品类级 FAQ    ->  data/categories.json[].faqs（品类着陆页）     */
  /*   产品级 FAQ    ->  data/products/*.json[].faqs（产品详情页）     */
  /*   产品未填时    ->  site.defaultProductFaqs（5 问通用模板回退）   */
  /* ------------------------------------------------------------------ */
  faqs: [
    {
      q: "What is your MOQ?",
      a: "MOQ is 1 unit for most standard models (2 units for mini/tabletop units). Full-container orders get better pricing.",
    },
    {
      q: "What payment terms do you accept?",
      a: "T/T (30% deposit, 70% before shipment), L/C and Western Union. PayPal is accepted for sample orders.",
    },
    {
      q: "How long is production and delivery?",
      a: "Typically 15-30 days after deposit for standard models; larger rides and full-container orders take 25-40 days. Sea, air and express shipping are available.",
    },
    {
      q: "Do you provide warranty and after-sales support?",
      a: "Yes - a 12-month warranty against non-artificial defects, plus spare-parts dispatch and online/video technical guidance. Remote diagnostics are available for software issues.",
    },
    {
      q: "Can you customize machines (OEM/ODM)?",
      a: "Yes - cabinet artwork, brand logo, color scheme, software languages, voltage, plugs and payment systems can all be customized to your market.",
    },
    {
      q: "Do you offer samples before a bulk order?",
      a: "Yes, sample orders are welcome and are shipped by express (DHL/FedEx/UPS). The sample cost is confirmed in your quotation.",
    },
    {
      q: "What voltage and plug do your machines use?",
      a: "Machines run on AC 110-240V 50/60Hz and we configure the plug for your destination country at no extra charge.",
    },
    {
      q: "Which certifications do your products have?",
      a: "CE & RoHS are standard across the range. UL, FCC or SAA are available depending on model and target market - confirmed in the quotation.",
    },
    {
      q: "How do you pack machines for export?",
      a: "Each machine is protected with foam corner guards, stretch film and a strong carton or plywood case, then loaded for sea freight or handed to express couriers for small orders.",
    },
    {
      q: "Can you ship to my country and handle customs?",
      a: "We export worldwide and prepare full shipping documents. For DDP or door-to-door delivery, our logistics team will quote the total landed cost.",
    },
    {
      q: "What information do you need for a quotation?",
      a: "Model or product interest, quantity, destination port/country and your voltage/payment preferences. With that we reply within 24 business hours.",
    },
    {
      q: "Can I visit your factory?",
      a: "Yes, factory visits are welcome by appointment. We are based in Guangzhou, China - contact us to arrange a visit and see the production line.",
    },
  ] as FaqItem[],

  /* 产品详情页 FAQ 未配置时的默认 5 问模板（与贸易卡/站级口径一致） */
  defaultProductFaqs: [
    {
      q: "What is the MOQ for this model?",
      a: "MOQ is 1 unit for standard models. Sample orders and mixed-container orders are both supported.",
    },
    {
      q: "How long is production and delivery?",
      a: "Lead time is typically 15-30 days after deposit depending on the model and order size. Sea, air and express shipping are available.",
    },
    {
      q: "What is the warranty and after-sales support?",
      a: "12-month warranty against non-artificial defects, with spare-parts dispatch and online/video technical guidance.",
    },
    {
      q: "Can the machine be customized for my brand?",
      a: "Yes - OEM/ODM customization covers cabinet artwork, logo, software languages, voltage, plugs and payment systems.",
    },
    {
      q: "What voltage and certifications apply?",
      a: "AC 110-240V 50/60Hz with plug adapted to your market. CE & RoHS are standard; UL, FCC or SAA per model and destination - confirmed in your quotation.",
    },
  ] as FaqItem[],

  /* ------------------------------------------------------------------ */
  /* 导航                                                              */
  /* ------------------------------------------------------------------ */
  nav: {
    links: [
      { label: "Home", href: "/" },
      { label: "Products", href: "/products/" },
      { label: "OEM / ODM", href: "/about/#oem-odm" },
      { label: "About Us", href: "/about/" },
      { label: "FAQ", href: "/faq/" },
      { label: "Contact", href: "/contact/" },
    ] as NavLink[],
  },

  /** 首页"示例网站"提示条（整体上线前可删除本字段及对应组件） */
  isDemoSite: true,
};

export type SiteConfig = typeof site;

export default site;
