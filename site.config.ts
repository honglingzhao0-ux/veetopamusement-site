/**
 * ============================================================================
 * VEETOP 独立站 —— 站点唯一配置（真实内容版）
 * ============================================================================
 * 品牌、域名、联系方式、公司事实、FAQ 等内容集中在本文件。
 * 以下内容均已按公司提供资料核实（画册第 1-2 页 + 用户提供联系方式）；
 * 如需变更，请只在本文件修改（首页 / About / JSON-LD / llms.txt 均引用此处）。
 *
 * 仍待补充项（上线前可选）：socials 主页 URL、地图 geo 坐标、表单 endpoint。
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
    name: "VEETOP",
    suffix: "AMUSEMENT",
    // 公司法定全称（画册封面）
    legalName: "Guangzhou Veetop Amusement Technology Co., Ltd.",
    // 正式域名（含协议，无结尾斜杠）
    domain: "https://www.veetopamusement.com",
  },

  /* 默认 meta / OG 文案 */
  seo: {
    title: "VEETOP Amusement | Game & Amusement Equipment Manufacturer",
    description:
      "Guangzhou Veetop Amusement Technology Co., Ltd. is a CE-certified manufacturer of arcade game machines, redemption machines, claw cranes, kiddie rides and amusement equipment. 21+ years in the industry, exports to 150+ countries, OEM/ODM cooperation available.",
    keywords: [
      "arcade game machine manufacturer",
      "amusement game machine supplier",
      "redemption machine",
      "claw crane machine",
      "kiddie ride",
      "coin pusher",
      "OEM ODM amusement equipment",
      "VEETOP amusement",
    ],
  },

  /* ------------------------------------------------------------------ */
  /* 联系方式（公司提供）                                               */
  /* ------------------------------------------------------------------ */
  contact: {
    email: "Sales@veetopamusement.com",
    whatsapp: {
      // 仅数字、含国家码（用于 wa.me 跳转）
      number: "8618824175545",
      // 展示用文案
      label: "+86 188 2417 5545",
      // 全站悬浮 WhatsApp 按钮的默认预填话术
      message:
        "Hello VEETOP, I would like a quotation for amusement machines. Please contact me.",
    },
    phone: {
      // tel: 链接用
      tel: "+8618824175545",
      // 展示用文案
      label: "+86 188 2417 5545",
    },
    address: {
      // 工厂/公司地址（用户提供：广州番禺区新水坑）
      line1: "Xinshuikeng, Panyu District",
      line2: "Guangzhou, Guangdong, China",
      // 可选经纬度（本地 SEO / Organization JSON-LD geo）。
      // 填上数字后会自动输出到结构化数据；留空 "" 则忽略。
      geo: {
        latitude: "",
        longitude: "",
      },
    },
    // 询盘表单提交端点：Formspree -> "https://formspree.io/f/xxxxxxx"
    // Web3Forms -> "https://api.web3forms.com/submit"（需配 access_key 隐藏域）
    // 当前已配置 Formspree 端点：表单直接 POST，收件邮箱为 Formspree 后台绑定邮箱
    formEndpoint: "https://formspree.io/f/xnpqgnoz",
    formNote:
      "For a quotation please tell us the model, quantity, destination port and country. Our export team will confirm price and delivery details.",
  },

  /* ------------------------------------------------------------------ */
  /* 企业数据声明（画册第 2 页，可核实）—— 数字唯一来源                */
  /* ------------------------------------------------------------------ */
  companyFacts: {
    // 深耕行业年限
    yearsInBusiness: "21+",
    // 出口国家/地区数
    exportCountries: "150+",
    // 市场份额（画册口径）
    marketShare: "15%+",
    oemOdmNote:
      "VEETOP owns the brands VEETOP and VEETOP Amusement and also cooperates with world-class brands on OEM/ODM projects.",
    // 认证（画册第 2 页：Certified by CE）
    certifications: ["CE"],
  },

  /* ------------------------------------------------------------------ */
  /* 社媒（Organization sameAs 只输出非空项；上线后如有主页在此填入 URL） */
  /* ------------------------------------------------------------------ */
  socials: {
    facebook: "https://www.facebook.com/VeetopAmusementLucia",
    instagram: "",
    youtube: "",
    linkedin: "https://www.linkedin.com/in/arcadegameslucia",
  },

  /* ------------------------------------------------------------------ */
  /* FAQ 三层分工                                                       */
  /*   站级贸易条款  ->  site.faqs（/faq/ 页 + llms.txt）               */
  /*   品类级 FAQ    ->  data/categories.json[].faqs（品类着陆页）       */
  /*   产品级 FAQ    ->  data/products/*.json[].faqs（产品详情页）       */
  /*   产品未填时    ->  site.defaultProductFaqs（5 问通用模板回退）     */
  /* 注：具体 MOQ/交期/价格等因型号与订单而异，一律引导向报价确认，      */
  /*     不在站内给出未经核实的数字。                                    */
  /* ------------------------------------------------------------------ */
  faqs: [
    {
      q: "Are you a manufacturer or a trading company?",
      a: "We are a manufacturer based in Guangzhou, China, integrating R&D, production and sales of amusement game machines. We hold the VEETOP and VEETOP Amusement brands and provide OEM/ODM cooperation.",
    },
    {
      q: "Which markets do you export to?",
      a: "We export to 150+ countries and regions around the world, including Thailand, Brazil, the United States, Japan and many more. All our products are exported worldwide.",
    },
    {
      q: "What is the minimum order quantity?",
      a: "Minimum quantity depends on the model and is confirmed together with the quotation. Sample orders and container orders can both be discussed with our sales team.",
    },
    {
      q: "How do I get a quotation?",
      a: "Send us the model name or number, your quantity, destination port/country and any customization needs. Our export team will confirm price, lead time and shipping terms.",
    },
    {
      q: "What payment terms do you accept?",
      a: "Payment terms are agreed per order and confirmed in the quotation and contract. Bank transfer is commonly used for export orders.",
    },
    {
      q: "What is the production and delivery lead time?",
      a: "Lead time depends on the model, stock status and order size. We confirm the exact schedule in the quotation before you place the order.",
    },
    {
      q: "Do you provide after-sales support?",
      a: "After-sales service and warranty terms are provided with every order. Details are confirmed in the quotation and contract, and our team supports customers with technical guidance.",
    },
    {
      q: "Are your products certified?",
      a: "VEETOP is certified by CE. Certificate and compliance documents for the relevant market can be requested from our sales team.",
    },
    {
      q: "Can you customize machines for my brand (OEM/ODM)?",
      a: "Yes. We have OEM/ODM cooperation with world-class brands, covering branding, cabinet design, artwork, software content and other customization agreed per project.",
    },
    {
      q: "Do you support sample orders?",
      a: "Sample orders can be discussed with our sales team - please ask for sample availability and terms in your inquiry.",
    },
    {
      q: "What should I prepare before sending an inquiry?",
      a: "The model(s) you are interested in, quantity, destination country/port and any specific requirements (voltage, plug, artwork) help us reply faster and more accurately.",
    },
    {
      q: "Can I visit your factory?",
      a: "Factory visits are welcome by appointment. We are located in Xinshuikeng, Panyu District, Guangzhou, China - contact us to arrange a visit.",
    },
  ] as FaqItem[],

  /* 产品详情页 FAQ 未配置时的默认 5 问模板（与站级口径一致，不含未核实数字） */
  defaultProductFaqs: [
    {
      q: "How do I get a quotation for this model?",
      a: "Send us the model number, your quantity and destination port/country. Our export team will confirm price, lead time and shipping terms in the quotation.",
    },
    {
      q: "What is the minimum order quantity?",
      a: "Minimum quantity depends on the model and order type - please ask our sales team and it will be confirmed with the quotation.",
    },
    {
      q: "What is the delivery lead time?",
      a: "Lead time depends on stock status and order size and is confirmed in the quotation before you place the order.",
    },
    {
      q: "Can this machine be customized for my market?",
      a: "We support OEM/ODM projects covering branding, cabinet design, artwork and software content. Tell us your requirements and we will advise what is possible.",
    },
    {
      q: "Is this machine certified?",
      a: "VEETOP is certified by CE. Request the certificate or compliance documents for your market from our sales team.",
    },
  ] as FaqItem[],

  /* ------------------------------------------------------------------ */
  /* 导航                                                               */
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
};

export type SiteConfig = typeof site;

export default site;
