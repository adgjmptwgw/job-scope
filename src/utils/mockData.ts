export const mockJobs = [
  { 
    id: '1', 
    title: 'フロントエンドエンジニア', 
    company: '株式会社メルカリ', 
    description: 'メルカリのWebフロントエンド開発。React/TypeScriptを使用したプロダクト開発、パフォーマンス最適化、アクセシビリティ向上に取り組みます。', 
    score: 4.5, 
    location: '東京都港区', 
    salary: '800-1500万円', 
    salaryMinInt: 800,
    requirements: 'React/TypeScript経験3年以上、Webパフォーマンス最適化経験', 
    languages: ['TypeScript', 'JavaScript'],
    frameworks: ['React', 'Next.js'],
    infrastructure: ['GCP', 'Kubernetes'],
    workStyles: ['リモート可', 'フレックス'],
    evaluationItems: [
      { 
        category: '残業時間', 
        score: 4.0,
        summary: '月平均20〜30時間程度。裁量労働制で柔軟な働き方が可能。',
        links: ['https://www.openwork.jp/company.php?m_id=a0910000000FrPG'] 
      },
      { 
        category: '社員同士の仲', 
        score: 4.3,
        summary: 'フラットな組織文化。多国籍なチームで英語を使う機会も多い。',
        links: ['https://engineering.mercari.com/blog/entry/20231219-mercari-advent-calendar-2023-day19/'] 
      },
      { 
        category: '成長環境', 
        score: 4.5,
        summary: '技術カンファレンス参加支援、書籍購入制度あり。社内勉強会が活発。',
        links: ['https://mercan.mercari.com/articles/39584/'] 
      }
    ],
    aiReason: 'モダンな技術スタックとグローバルな環境が魅力。成長機会が豊富。',
    sourceUrl: 'https://careers.mercari.com/'
  },
  { 
    id: '2', 
    title: 'バックエンドエンジニア', 
    company: '株式会社サイバーエージェント', 
    description: 'ABEMAやAmebaなど大規模サービスのバックエンド開発。Go/Java/Scalaを使用した高トラフィックシステムの設計・実装。', 
    score: 4.2, 
    location: '東京都渋谷区', 
    salary: '500-1200万円', 
    salaryMinInt: 500,
    requirements: 'バックエンド開発経験3年以上、Go/Java/Scala経験', 
    languages: ['Go', 'Java', 'Scala'],
    frameworks: ['Spring Boot', 'gRPC'],
    infrastructure: ['AWS', 'GCP', 'Kubernetes'],
    workStyles: ['リモート可', 'フレックス'],
    evaluationItems: [
      { 
        category: '残業時間', 
        score: 3.5,
        summary: '部署による差あり。メディア事業は繁忙期が多い傾向。',
        links: ['https://www.openwork.jp/company.php?m_id=a0910000000FrQk'] 
      },
      { 
        category: '給与水準', 
        score: 4.2,
        summary: '業界水準より高め。グレード制で明確な評価基準。',
        links: ['https://developers.cyberagent.co.jp/blog/archives/47764/'] 
      }
    ],
    aiReason: '大規模サービス開発経験を積める環境。若手の裁量が大きい。',
    sourceUrl: 'https://www.cyberagent.co.jp/careers/'
  },
  { 
    id: '3', 
    title: 'SREエンジニア', 
    company: '株式会社SmartHR', 
    description: 'クラウド人事労務ソフト「SmartHR」のインフラ基盤の設計・構築・運用。可用性とセキュリティの向上に取り組みます。', 
    score: 4.8, 
    location: '東京都港区', 
    salary: '700-1200万円', 
    salaryMinInt: 700,
    requirements: 'AWS/GCP経験、Terraform/Kubernetes経験', 
    languages: ['Go', 'Ruby', 'Terraform'],
    frameworks: ['Ruby on Rails'],
    infrastructure: ['AWS', 'Docker', 'Kubernetes', 'Datadog'],
    workStyles: ['フルリモート', 'フレックス'],
    evaluationItems: [
      { 
        category: '安定性', 
        score: 4.6,
        summary: 'SaaS市場でトップシェア。ARR成長率も高く事業基盤は安定。',
        links: ['https://www.openwork.jp/company.php?m_id=a0C10000019qFXv'] 
      },
      { 
        category: '技術力', 
        score: 4.7,
        summary: 'テックブログ発信が活発。OSSへの貢献も積極的。',
        links: ['https://tech.smarthr.jp/entry/2023/12/25/090000'] 
      }
    ],
    aiReason: 'フルリモート可能で働きやすい。技術力の高いチーム。',
    sourceUrl: 'https://smarthr.co.jp/recruit/'
  },
  { 
    id: '4', 
    title: '機械学習エンジニア', 
    company: '株式会社Preferred Networks', 
    description: '深層学習フレームワークの開発、大規模言語モデルの研究開発。世界トップクラスのAI研究環境。', 
    score: 4.9, 
    location: '東京都千代田区', 
    salary: '800-2000万円', 
    salaryMinInt: 800,
    requirements: 'PyTorch/TensorFlow経験、機械学習の論文実装経験', 
    languages: ['Python', 'C++', 'CUDA'],
    frameworks: ['PyTorch', 'JAX'],
    infrastructure: ['AWS', 'GCP', 'オンプレGPUクラスタ'],
    workStyles: ['リモート可', 'フレックス'],
    evaluationItems: [
      { 
        category: '技術力', 
        score: 4.9,
        summary: '世界トップレベルのAI研究。国際学会での発表実績多数。',
        links: ['https://www.openwork.jp/company.php?m_id=a0C1000000xF8Fr'] 
      },
      { 
        category: '成長環境', 
        score: 4.8,
        summary: '研究者と直接議論できる環境。学会参加・論文投稿を強力支援。',
        links: ['https://tech.preferred.jp/ja/blog/'] 
      }
    ],
    aiReason: '最先端AI研究に携われる日本屈指の環境。',
    sourceUrl: 'https://www.preferred.jp/ja/careers/'
  },
  { 
    id: '5', 
    title: 'iOSエンジニア', 
    company: 'LINEヤフー株式会社', 
    description: 'LINEアプリのiOS開発。Swift/Objective-Cを使用した大規模アプリ開発、新機能実装。', 
    score: 4.3, 
    location: '東京都新宿区', 
    salary: '600-1200万円', 
    salaryMinInt: 600,
    requirements: 'iOS開発経験3年以上、Swift経験必須', 
    languages: ['Swift', 'Objective-C'],
    frameworks: ['UIKit', 'SwiftUI'],
    infrastructure: ['AWS', 'Verda'],
    workStyles: ['リモート可', 'フレックス'],
    evaluationItems: [
      { 
        category: '技術力', 
        score: 4.5,
        summary: '大規模アプリ開発のノウハウが豊富。社内勉強会も活発。',
        links: ['https://www.openwork.jp/company.php?m_id=a0910000000FrT3'] 
      },
      { 
        category: '給与水準', 
        score: 4.0,
        summary: '業界水準並み。グレード制で透明性のある評価。',
        links: ['https://engineering.linecorp.com/ja/blog/line-developer-career-document'] 
      }
    ],
    aiReason: '国内最大級のユーザー基盤を持つプロダクト開発に携われる。',
    sourceUrl: 'https://www.lycorp.co.jp/ja/recruit/'
  },
  { 
    id: '6', 
    title: 'バックエンドエンジニア（FinTech）', 
    company: '株式会社マネーフォワード', 
    description: '家計簿アプリ・法人向けSaaSのバックエンド開発。Ruby/Goを使用したAPI開発。', 
    score: 4.4, 
    location: '東京都港区', 
    salary: '600-1100万円', 
    salaryMinInt: 600,
    requirements: 'Ruby/Go経験、API設計経験', 
    languages: ['Ruby', 'Go'],
    frameworks: ['Ruby on Rails', 'Gin'],
    infrastructure: ['AWS', 'Docker', 'Kubernetes'],
    workStyles: ['リモート可', 'フレックス'],
    evaluationItems: [
      { 
        category: '成長環境', 
        score: 4.5,
        summary: 'エンジニア主導の技術選定。カンファレンス登壇も奨励。',
        links: ['https://www.openwork.jp/company.php?m_id=a0C10000005kHJh'] 
      },
      { 
        category: '社員同士の仲', 
        score: 4.3,
        summary: 'バリューを大切にする文化。オープンなコミュニケーション。',
        links: ['https://note.com/moneyforward/n/nc25329e4867d'] 
      }
    ],
    aiReason: 'FinTech領域でのプロダクト開発経験が積める成長企業。',
    sourceUrl: 'https://recruit.moneyforward.com/'
  },
  { 
    id: '7', 
    title: 'プロダクトデザイナー', 
    company: 'freee株式会社', 
    description: 'クラウド会計ソフト「freee」のUI/UXデザイン。ユーザーリサーチからUIデザインまで。', 
    score: 4.2, 
    location: '東京都品川区', 
    salary: '550-900万円', 
    salaryMinInt: 550,
    requirements: 'Figma実務経験、プロダクトデザイン経験3年以上', 
    languages: [],
    frameworks: [],
    infrastructure: [],
    workStyles: ['リモート可', 'フレックス'],
    evaluationItems: [
      { 
        category: '残業時間', 
        score: 4.0,
        summary: '平均20時間程度。フレックス活用で柔軟な働き方が可能。',
        links: ['https://www.openwork.jp/company.php?m_id=a0C10000009YCWQ'] 
      },
      { 
        category: '成長環境', 
        score: 4.2,
        summary: 'デザインシステム構築に注力。デザイナー同士の交流が活発。',
        links: ['https://developers.freee.co.jp/entry/freee-design-system'] 
      }
    ],
    aiReason: 'デザインドリブンな組織文化。ユーザー起点のものづくり。',
    sourceUrl: 'https://jobs.freee.co.jp/'
  },
  { 
    id: '8', 
    title: 'ブロックチェーンエンジニア', 
    company: '株式会社LayerX', 
    description: 'ブロックチェーン技術を活用したプロダクト開発。Ethereum/Solidity開発。', 
    score: 4.6, 
    location: '東京都中央区', 
    salary: '700-1400万円', 
    salaryMinInt: 700,
    requirements: 'Solidity経験、スマートコントラクト開発経験', 
    languages: ['Solidity', 'Go', 'TypeScript'],
    frameworks: ['Hardhat', 'Foundry'],
    infrastructure: ['AWS', 'GCP'],
    workStyles: ['フルリモート', 'フレックス'],
    evaluationItems: [
      { 
        category: '技術力', 
        score: 4.7,
        summary: 'ブロックチェーン技術の最先端を走る。論文執筆・OSS貢献も活発。',
        links: ['https://www.openwork.jp/company.php?m_id=a0C1000001IFxGs'] 
      },
      { 
        category: '成長環境', 
        score: 4.5,
        summary: '経営陣がエンジニア出身。技術投資に積極的。',
        links: ['https://tech.layerx.co.jp/entry/2023/12/25/000000'] 
      }
    ],
    aiReason: 'Web3領域の最先端技術に携われる希少な環境。',
    sourceUrl: 'https://layerx.co.jp/jobs/'
  },
  { 
    id: '9', 
    title: 'QAエンジニア', 
    company: '株式会社DeNA', 
    description: 'ゲーム・エンターテインメント事業のQA基盤構築。自動テストの設計・実装。', 
    score: 4.1, 
    location: '東京都渋谷区', 
    salary: '600-1000万円', 
    salaryMinInt: 600,
    requirements: 'E2Eテスト構築経験、CI/CD経験', 
    languages: ['JavaScript', 'Python'],
    frameworks: ['Playwright', 'Selenium'],
    infrastructure: ['AWS', 'CircleCI'],
    workStyles: ['リモート可', 'フレックス'],
    evaluationItems: [
      { 
        category: '技術力', 
        score: 4.3,
        summary: 'ゲーム開発で培った高い技術力。社内ツール開発も活発。',
        links: ['https://www.openwork.jp/company.php?m_id=a0910000000FrU3'] 
      },
      { 
        category: '給与水準', 
        score: 4.0,
        summary: '業界水準より高め。成果に応じたインセンティブあり。',
        links: ['https://engineering.dena.com/blog/2023/12/'] 
      }
    ],
    aiReason: 'エンターテインメント領域での品質管理経験を積める。',
    sourceUrl: 'https://dena.com/jp/recruit/'
  },
  { 
    id: '10', 
    title: 'プロダクトマネージャー', 
    company: 'ウォンテッドリー株式会社', 
    description: 'ビジネスSNS「Wantedly」のプロダクトマネジメント。ユーザーインタビューから機能設計まで。', 
    score: 4.4, 
    location: '東京都港区', 
    salary: '700-1200万円', 
    salaryMinInt: 700,
    requirements: 'プロダクトマネジメント経験3年以上', 
    languages: [],
    frameworks: [],
    infrastructure: [],
    workStyles: ['リモート可', 'フレックス'],
    evaluationItems: [
      { 
        category: '成長環境', 
        score: 4.5,
        summary: 'ユーザードリブンな開発文化。データ分析基盤も充実。',
        links: ['https://www.openwork.jp/company.php?m_id=a0C10000005rVlh'] 
      },
      { 
        category: '社員同士の仲', 
        score: 4.4,
        summary: '「シゴトでココロオドル」を体現する組織文化。',
        links: ['https://www.wantedly.com/companies/wantedly/stories'] 
      }
    ],
    aiReason: 'プロダクト起点の組織で裁量を持って働ける。',
    sourceUrl: 'https://www.wantedly.com/companies/wantedly/'
  },
  { 
    id: '11', 
    title: 'データエンジニア', 
    company: '株式会社ZOZO', 
    description: 'ZOZOTOWNのデータ基盤構築。BigQuery/Sparkを使用した大規模データパイプライン開発。', 
    score: 4.5, 
    location: '千葉県', 
    salary: '700-1200万円', 
    salaryMinInt: 700,
    requirements: 'データエンジニアリング経験、SQL/Python経験', 
    languages: ['Python', 'SQL'],
    frameworks: ['dbt', 'Airflow'],
    infrastructure: ['GCP', 'BigQuery', 'Dataflow'],
    workStyles: ['リモート可', 'フレックス'],
    evaluationItems: [
      { 
        category: '技術力', 
        score: 4.4,
        summary: '大規模ECデータを扱う技術力。MLOps基盤も整備。',
        links: ['https://www.openwork.jp/company.php?m_id=a0910000002Pd7p'] 
      },
      { 
        category: '残業時間', 
        score: 4.2,
        summary: '平均20時間程度。メリハリのある働き方が可能。',
        links: ['https://techblog.zozo.com/entry/zozo-data-engineer-team'] 
      }
    ],
    aiReason: '日本最大級のファッションECのデータ基盤に携われる。',
    sourceUrl: 'https://corp.zozo.com/recruit/'
  },
  { 
    id: '12', 
    title: 'Androidエンジニア', 
    company: '楽天グループ株式会社', 
    description: '楽天市場・楽天ペイなどのAndroidアプリ開発。Kotlin/Javaを使用。', 
    score: 4.0, 
    location: '東京都世田谷区', 
    salary: '600-1100万円', 
    salaryMinInt: 600,
    requirements: 'Android開発経験3年以上、Kotlin経験', 
    languages: ['Kotlin', 'Java'],
    frameworks: ['Jetpack Compose', 'Dagger'],
    infrastructure: ['AWS', 'GCP'],
    workStyles: ['リモート可', 'フレックス'],
    evaluationItems: [
      { 
        category: '安定性', 
        score: 4.5,
        summary: '日本最大級のEC企業。多角的な事業展開で安定基盤。',
        links: ['https://www.openwork.jp/company.php?m_id=a0910000000Frps'] 
      },
      { 
        category: '成長環境', 
        score: 3.8,
        summary: '英語公用語化など独自の文化。グローバル経験が積める。',
        links: ['https://rakuten.today/blog/how-rakuten-made-english-its-business-language.html'] 
      }
    ],
    aiReason: '大規模サービスのモバイル開発経験を積める安定企業。',
    sourceUrl: 'https://corp.rakuten.co.jp/careers/'
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
