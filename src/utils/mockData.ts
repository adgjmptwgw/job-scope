export const mockJobs = [
  { 
    id: '1', 
    title: 'フロントエンドエンジニア', 
    company: 'Tech Corp', 
    description: 'React, TypeScriptを使用した開発', 
    score: 4.5, 
    location: '東京都', 
    salary: '1200-1600万円', 
    salaryMinInt: 1200,
    requirements: 'React経験3年以上', 
    languages: ['TypeScript', 'JavaScript'],
    frameworks: ['React', 'Next.js'],
    infrastructure: ['AWS', 'Vercel'],
    workStyles: ['Remote', 'Flex'],
    evaluationItems: [
      { category: '残業時間', links: ['https://example.com/tech-corp/overtime'] },
      { category: '社員同士の仲', links: ['https://example.com/tech-corp/culture-1'] }
    ],
    aiReason: '技術スタックとワークライフバランスの評価が高い。'
  },
  { 
    id: '2', 
    title: 'バックエンドエンジニア', 
    company: 'Innovate Inc', 
    description: 'Node.js, TypeScript, PostgreSQLを使用した開発', 
    score: 4.2, 
    location: '大阪府', 
    salary: '500-900万円', 
    salaryMinInt: 500,
    requirements: 'Node.js経験2年以上', 
    languages: ['TypeScript', 'Node.js', 'Go'],
    frameworks: ['Express', 'Prisma'],
    infrastructure: ['GCP', 'Docker', 'Kubernetes'],
    workStyles: ['Full Remote', 'Full Flex'],
    evaluationItems: [
      { category: '残業時間', links: ['https://example.com/innovate/overtime'] }
    ],
    aiReason: 'パフォーマンスとスケーラビリティに対する貢献度が高い。'
  },
  { 
    id: '3', 
    title: 'SREエンジニア', 
    company: 'Cloud Solutions', 
    description: 'AWS, Docker, Kubernetesを用いたSRE業務', 
    score: 4.8, 
    location: '福岡県', 
    salary: '1000-1400万円', 
    salaryMinInt: 1000,
    requirements: 'AWS実務経験1年以上', 
    languages: ['Go', 'Python', 'Terraform'],
    frameworks: [],
    infrastructure: ['AWS', 'Docker', 'Kubernetes', 'CircleCI'],
    workStyles: ['Remote', 'Flex'],
    evaluationItems: [
      { category: '安定性', links: ['https://example.com/cloud-sl/benefits'] }
    ],
    aiReason: 'インフラの信頼性と効率化に対する評価が高い。'
  },
  { 
    id: '4', 
    title: 'AIエンジニア / データサイエンティスト', 
    company: 'Future AI', 
    description: '生成AIモデルの構築と最適化', 
    score: 4.9, 
    location: '東京都', 
    salary: '1500-2000万円', 
    salaryMinInt: 1500,
    requirements: 'PyTorch, TensorFlow経験', 
    languages: ['Python', 'C++'],
    frameworks: ['PyTorch', 'TensorFlow'],
    infrastructure: ['AWS', 'GCP'],
    workStyles: ['Full Remote'],
    evaluationItems: [],
    aiReason: '最先端技術への取り組みが非常に高い評価。'
  },
  { 
    id: '5', 
    title: 'モバイルアプリエンジニア', 
    company: 'App Works', 
    description: 'Flutterを用いたクロスプラットフォーム開発', 
    score: 3.8, 
    location: '東京都', 
    salary: '600-900万円', 
    salaryMinInt: 600,
    requirements: 'Flutter経験1年以上', 
    languages: ['Dart', 'Swift', 'Kotlin'],
    frameworks: ['Flutter'],
    infrastructure: ['Firebase'],
    workStyles: ['Remote'],
    evaluationItems: [],
    aiReason: 'モダンなモバイル開発環境が整っている。'
  },
  { 
    id: '6', 
    title: 'Goバックエンドエンジニア', 
    company: 'FinTech Lab', 
    description: '大規模金融システムのマイクロサービス化', 
    score: 4.6, 
    location: '東京都', 
    salary: '1000-1500万円', 
    salaryMinInt: 1000,
    requirements: 'Go言語での開発経験', 
    languages: ['Go', 'SQL'],
    frameworks: ['Gin', 'Echo'],
    infrastructure: ['AWS', 'Docker'],
    workStyles: ['Flex'],
    evaluationItems: [],
    aiReason: '堅牢なシステム設計と高い技術力が魅力。'
  },
  { 
    id: '7', 
    title: 'UI/UXデザイナー', 
    company: 'Creative Studio', 
    description: 'ウェブ・アプリのデザインシステム構築', 
    score: 4.0, 
    location: '神奈川県', 
    salary: '500-800万円', 
    salaryMinInt: 500,
    requirements: 'Figma実務経験', 
    languages: [],
    frameworks: [],
    infrastructure: [],
    workStyles: ['Remote', 'Flex'],
    evaluationItems: [],
    aiReason: 'デザイン文化が根付いており、働きやすい環境。'
  },
  { 
    id: '8', 
    title: 'フルスタックエンジニア', 
    company: 'Startup X', 
    description: '新規事業の立ち上げ、0->1開発', 
    score: 3.5, 
    location: '東京都', 
    salary: '600-1000万円', 
    salaryMinInt: 600,
    requirements: 'Webアプリ開発経験一通り', 
    languages: ['TypeScript', 'Ruby'],
    frameworks: ['Next.js', 'Rails'],
    infrastructure: ['Heroku', 'Vercel'],
    workStyles: ['Full Flex'],
    evaluationItems: [],
    aiReason: '裁量が大きく、幅広い経験が積める。'
  },
  { 
    id: '9', 
    title: 'QAエンジニア', 
    company: 'Quality First', 
    description: '自動テスト基盤の構築と運用', 
    score: 4.1, 
    location: '東京都', 
    salary: '700-1000万円', 
    salaryMinInt: 700,
    requirements: 'E2Eテスト構築経験', 
    languages: ['JavaScript', 'Python'],
    frameworks: ['Playwright', 'Selenium'],
    infrastructure: ['CircleCI', 'Jenkins'],
    workStyles: ['Remote'],
    evaluationItems: [],
    aiReason: '品質へのこだわりが強く、エンジニアリング組織も成熟している。'
  },
  { 
    id: '10', 
    title: 'PM / プロダクトマネージャー', 
    company: 'Global Tech', 
    description: 'グローバル展開するSaaSのプロダクトマネジメント', 
    score: 4.4, 
    location: '東京都', 
    salary: '1200-1800万円', 
    salaryMinInt: 1200,
    requirements: 'SaaSプロダクトのPM経験', 
    languages: [],
    frameworks: [],
    infrastructure: [],
    workStyles: ['Remote', 'Flex'],
    evaluationItems: [],
    aiReason: 'グローバルな視点でプロダクト成長に関われる。'
  },
  { 
    id: '11', 
    title: 'セキュリティエンジニア', 
    company: 'Secure Core', 
    description: '脆弱性診断とセキュリティ対策の立案', 
    score: 4.7, 
    location: 'フルリモート', 
    salary: '1100-1500万円', 
    salaryMinInt: 1100,
    requirements: 'セキュリティ診断経験', 
    languages: ['Python', 'Shell'],
    frameworks: [],
    infrastructure: [],
    workStyles: ['Full Remote'],
    evaluationItems: [],
    aiReason: '高い専門性が求められるが、待遇と環境は最高水準。'
  },
  { 
    id: '12', 
    title: '社内SE', 
    company: 'Legacy Corp', 
    description: '社内システムの保守運用・DX推進', 
    score: 3.2, 
    location: '愛知県', 
    salary: '400-600万円', 
    salaryMinInt: 400,
    requirements: '社内SE経験', 
    languages: ['Java', 'C#'],
    frameworks: [],
    infrastructure: ['On-premise'],
    workStyles: [],
    evaluationItems: [],
    aiReason: '安定した環境だが、技術的な挑戦は限定的かもしれない。'
  }
];

export let selectedJobForDetail: any = null; // 選択された求人詳細を保持
export const setSelectedJobForDetail = (job: any) => { selectedJobForDetail = job; };

// お気に入り機能のロジック
export let favoriteJobIds: string[] = [];

export const toggleFavorite = (jobId: string) => {
  if (favoriteJobIds.includes(jobId)) {
    favoriteJobIds = favoriteJobIds.filter(id => id !== jobId);
  } else {
    favoriteJobIds.push(jobId);
  }
};

export const isFavorite = (jobId: string) => favoriteJobIds.includes(jobId);

export const getFavoriteJobs = () => {
  return mockJobs.filter(job => favoriteJobIds.includes(job.id));
};

export const TECH_STACK_SUGGESTIONS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Go', 'Python', 'Java', 'PHP', 'Ruby',
  'Vue.js', 'Angular', 'Svelte', 'Flutter', 'React Native', 'Swift', 'Kotlin',
  'Express', 'Prisma', 'NestJS', 'Laravel', 'Rails', 'Spring Boot', 'Django', 'FastAPI',
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'Serverless', 'CircleCI', 'GitHub Actions',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Firebase', 'Supabase'
];

export const LOCATION_SUGGESTIONS = [
  // 都道府県
  { name: '北海道', reading: 'ほっかいどう' }, { name: '青森県', reading: 'あおもりけん' },
  { name: '岩手県', reading: 'いわてけん' }, { name: '宮城県', reading: 'みやぎけん' },
  { name: '秋田県', reading: 'あきたけん' }, { name: '山形県', reading: 'やまがたけん' },
  { name: '福島県', reading: 'ふくしまけん' }, { name: '茨城県', reading: 'いわてけん' },
  { name: '栃木県', reading: 'とちぎけん' }, { name: '群馬県', reading: 'ぐんまけん' },
  { name: '埼玉県', reading: 'さいたまけん' }, { name: '千葉県', reading: 'ちばけん' },
  { name: '東京都', reading: 'とうきょうと' }, { name: '神奈川県', reading: 'かながわけん' },
  { name: '新潟県', reading: 'にいがたけん' }, { name: '富山県', reading: 'とやまけん' },
  { name: '石川県', reading: 'いしかわけん' }, { name: '福井県', reading: 'ふくいけん' },
  { name: '山梨県', reading: 'やまなしけん' }, { name: '長野県', reading: 'ながのけん' },
  { name: '岐阜県', reading: 'ぎふけん' }, { name: '静岡県', reading: 'しずおかけん' },
  { name: '愛知県', reading: 'あいちけん' }, { name: '三重県', reading: 'みえけん' },
  { name: '滋賀県', reading: 'しがけん' }, { name: '京都府', reading: 'きょうとふ' },
  { name: '大阪府', reading: 'おおさかふ' }, { name: '兵庫県', reading: 'ひょうごけん' },
  { name: '奈良県', reading: 'ならけん' }, { name: '和歌山県', reading: 'わかやまけん' },
  { name: '鳥取県', reading: 'とっとりけん' }, { name: '島根県', reading: 'しまねけん' },
  { name: '岡山県', reading: 'おかやまけん' }, { name: '広島県', reading: 'ひろしまけん' },
  { name: '山口県', reading: 'やまぐちけん' }, { name: '徳島県', reading: 'とくしまけん' },
  { name: '香川県', reading: 'かがわけん' }, { name: '愛媛県', reading: 'えひめけん' },
  { name: '高知県', reading: 'こうちけん' }, { name: '福岡県', reading: 'ふくおかけん' },
  { name: '佐賀県', reading: 'さがけん' }, { name: '長崎県', reading: 'ながさきけん' },
  { name: '熊本県', reading: 'くまもとけん' }, { name: '大分県', reading: 'おおいたけん' },
  { name: '宮崎県', reading: 'みやざきけん' }, { name: '鹿児島県', reading: 'かごしまけん' },
  { name: '沖縄県', reading: 'おきなわけん' },
  // 政令指定都市・主要都市
  { name: '札幌市', reading: 'さっぽろし' }, { name: '仙台市', reading: 'せんだいし' },
  { name: 'さいたま市', reading: 'さいたまし' }, { name: '千葉市', reading: 'ちばし' },
  { name: '横浜市', reading: 'よこはまし' }, { name: '川崎市', reading: 'かわさきし' },
  { name: '相模原市', reading: 'さがみはらし' }, { name: '新潟市', reading: 'にいがたし' },
  { name: '静岡市', reading: 'しずおかし' }, { name: '浜松市', reading: 'はままつし' },
  { name: '名古屋市', reading: 'なごやし' }, { name: '京都市', reading: 'きょうとし' },
  { name: '大阪市', reading: 'おおさかし' }, { name: '堺市', reading: 'さかいし' },
  { name: '神戸市', reading: 'こうべし' }, { name: '岡山市', reading: 'おかやまし' },
  { name: '広島市', reading: 'ひろしまし' }, { name: '北九州市', reading: 'きたきゅうしゅうし' },
  { name: '福岡市', reading: 'ふくおかし' }, { name: '熊本市', reading: 'くまもとし' }
];
