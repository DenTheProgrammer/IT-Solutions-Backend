import type { Prisma } from '../../src/generated/prisma/client';
import { LinkKind, SkillCategory } from '../../src/generated/prisma/enums';

type CandidateExperience = Omit<
  Prisma.ExperienceCreateWithoutProfileInput,
  'achievements'
> & {
  achievements: Prisma.AchievementCreateWithoutExperienceInput[];
};

interface CandidateData {
  profile: Pick<
    Prisma.ProfileCreateInput,
    'slug' | 'fullName' | 'headline' | 'summary' | 'location' | 'workFormat'
  >;
  links: Prisma.ProfileLinkCreateWithoutProfileInput[];
  skills: Prisma.SkillCreateWithoutProfileInput[];
  experiences: CandidateExperience[];
  projects: Prisma.ProjectCreateWithoutProfileInput[];
}

// Sources: resume/Mozhayskiy_Denis_Software_Automation_RU.md and PROJECTS.md.
export const candidateData = {
  profile: {
    slug: 'denis-mozhayskiy',
    fullName: 'Можайский Денис Олегович',
    headline: 'Разработчик ПО и инженер по автоматизации',
    summary:
      'Разрабатываю программное обеспечение, веб-сервисы и инструменты автоматизации. Работал над Java backend в Сбере, игровыми системами в Saber Interactive и интерактивными приложениями на C#/Unity. В собственных проектах реализую клиентскую и серверную части, API-интеграции, авторизацию, биллинг и развёртывание. Разбираюсь в существующем коде, исправляю ошибки и проверяю результат.',
    location: 'Москва',
    workFormat: 'Полностью удалённая работа | Полная занятость',
  },
  links: [
    {
      kind: LinkKind.GITHUB,
      label: 'GitHub',
      url: 'https://github.com/DenTheProgrammer',
      sortOrder: 0,
    },
    {
      kind: LinkKind.TELEGRAM,
      label: 'Telegram',
      url: 'https://t.me/Denis_Mozhayskiy',
      sortOrder: 1,
    },
    {
      kind: LinkKind.EMAIL,
      label: 'Email',
      url: 'mailto:mozhayskiyd@gmail.com',
      sortOrder: 2,
    },
    {
      kind: LinkKind.PHONE,
      label: '+7 (964) 634-35-76',
      url: 'tel:+79646343576',
      sortOrder: 3,
    },
    {
      kind: LinkKind.PROFI_RU,
      label: 'Отзывы клиентов на Profi.ru',
      url: 'https://profi.ru/profile/MozhayskiyDO/#reviews-tab',
      sortOrder: 4,
    },
    {
      kind: LinkKind.YOUTUBE,
      label: 'YouTube',
      url: 'https://www.youtube.com/channel/UCssiwcfOEVqWSDHdUn6PU7Q',
      sortOrder: 5,
    },
    {
      kind: LinkKind.BEHANCE,
      label: 'Behance / Showreel',
      url: 'https://www.behance.net/gallery/248075733/Denis-Mozhayskiy-Showreel',
      sortOrder: 6,
    },
  ],
  skills: [
    ...[
      'C#',
      'Unity',
      'Java',
      'TypeScript',
      'JavaScript',
      'React',
      'Vite',
      'Node.js',
      'Express',
      'SQL',
      'PostgreSQL',
      'Docker',
      'Git',
      'Python',
    ].map((name, sortOrder) => ({
      name,
      category: SkillCategory.DEVELOPMENT,
      details:
        name === 'Python'
          ? 'Telegram-боты, обучение нейросетей, небольшие скрипты и проекты.'
          : null,
      sortOrder,
    })),
    ...[
      'API',
      'OAuth',
      'Платёжные интеграции',
      'Клиент-серверное взаимодействие',
      'VPS-деплой',
      'Cloudflare Workers',
      'Cloudflare R2',
      'Cloudflare CDN',
      'HTTP Range',
      'CORS',
      'Кэширование',
    ].map((name, sortOrder) => ({
      name,
      category: SkillCategory.INTEGRATIONS_OPERATIONS,
      sortOrder: 14 + sortOrder,
    })),
    ...[
      'Отладка',
      'Регрессия',
      'Автотесты',
      'Оптимизация производительности',
      'Codex',
      'GitHub Copilot',
      'ChatGPT',
      'LLM',
      'Jev (TypeSafe AI)',
    ].map((name, sortOrder) => ({
      name,
      category: SkillCategory.QUALITY_AUTOMATION,
      sortOrder: 25 + sortOrder,
    })),
  ],
  experiences: [
    {
      company: '8Vision',
      position: 'Программист, проектная работа',
      startDate: new Date('2025-10-01T00:00:00.000Z'),
      endDate: null,
      sortOrder: 0,
      achievements: [
        {
          text: 'Интерактивные Unity-приложения для музеев и выставочных пространств: прототипы, логика сцен, поведение объектов, интеграционные сценарии и удалённая отладка.',
          sortOrder: 0,
        },
      ],
    },
    {
      company: 'Фриланс и Profi.ru',
      position: 'Фриланс-разработчик, автоматизация и инструменты',
      startDate: new Date('2025-10-01T00:00:00.000Z'),
      endDate: null,
      sortOrder: 1,
      achievements: [
        {
          text: 'Клиентская разработка, прототипирование, автоматизация и технический разбор проблем.',
          sortOrder: 0,
        },
        {
          text: 'Использую ИИ-инструменты для разработки и проверки решений.',
          sortOrder: 1,
        },
      ],
    },
    {
      company: 'Saber Interactive',
      position: 'Программист',
      startDate: new Date('2022-12-01T00:00:00.000Z'),
      endDate: new Date('2025-08-01T00:00:00.000Z'),
      sortOrder: 2,
      achievements: [
        {
          text: 'Игровые системы и поведение персонажей на проприетарном движке с кастомным скриптовым языком.',
          sortOrder: 0,
        },
        {
          text: 'Отладка большой кодовой базы, исправления стабильности и производительности, автотесты.',
          sortOrder: 1,
        },
        {
          text: 'Совместная работа с дизайнерами, техническими аниматорами и продюсерами.',
          sortOrder: 2,
        },
      ],
    },
    {
      company: 'Midjourney',
      position: 'Модератор Discord и специалист поддержки',
      startDate: new Date('2022-08-01T00:00:00.000Z'),
      endDate: new Date('2022-11-01T00:00:00.000Z'),
      sortOrder: 3,
      achievements: [
        {
          text: 'Помогал пользователям с функциями платформы, промптами и подписками.',
          sortOrder: 0,
        },
        {
          text: 'Создавал технические текстовые и видео-гайды, разбирал сложные обращения.',
          sortOrder: 1,
        },
      ],
    },
    {
      company: 'OwlStudio',
      position: 'Unity-разработчик',
      startDate: new Date('2022-02-01T00:00:00.000Z'),
      endDate: new Date('2022-07-01T00:00:00.000Z'),
      sortOrder: 4,
      achievements: [
        {
          text: 'Разрабатывал игровые механики и UI, исправлял баги, поддерживал прототипы.',
          sortOrder: 0,
        },
      ],
    },
    {
      company: 'Частная школа и Алгоритмика',
      position: 'Преподаватель программирования',
      startDate: new Date('2021-09-01T00:00:00.000Z'),
      endDate: new Date('2022-02-01T00:00:00.000Z'),
      sortOrder: 5,
      achievements: [
        {
          text: 'Программирование и геймдизайн для детей 8-15 лет: Scratch, Roblox, интерактивные материалы и сопровождение учебных проектов.',
          sortOrder: 0,
        },
      ],
    },
    {
      company: 'Сбер',
      position: 'Старший разработчик ПО',
      startDate: new Date('2018-11-01T00:00:00.000Z'),
      endDate: new Date('2020-10-01T00:00:00.000Z'),
      sortOrder: 6,
      achievements: [
        {
          text: 'Backend-разработка на Java, реляционные базы данных и высоконагруженная архитектура; Git и Agile-командная разработка.',
          sortOrder: 0,
        },
      ],
    },
  ],
  projects: [
    {
      name: 'JustPlayWeb',
      description:
        'Собственная платформа браузерных игр. Разработал и запустил первую версию за 1-2 дня: каталог 170+ игр, поиск и категории, оконный интерфейс в стиле Windows 98 и встроенные приложения. Реализовал статическую генерацию страниц, автоматизированный деплой на Cloudflare Workers, доставку ресурсов через R2/CDN, многоуровневое и браузерное кэширование. Текущие хостинг и раздача ресурсов обходятся бесплатно. За наблюдаемые 7 дней: более 200 тыс. посещений, 600 тыс. просмотров и 50 ТБ трафика (Cloudflare, 03.11.2026). В предыдущем наблюдении число обращений к хранилищу сократилось примерно в 500 раз. Настроил техническое SEO и подключил Adsterra.',
      url: 'https://justplayweb.com/',
      technologies: ['Cloudflare Workers', 'Cloudflare R2', 'CDN'],
      sortOrder: 0,
    },
    {
      name: 'Sarafan',
      description:
        'За одну ночь разработал первую версию full-stack платформы управления ботами и публикациями в Telegram, ВКонтакте и MAX: единый кабинет, кросспостинг, отложенные посты, рассылки и JS-виджеты. Реализованы очередь доставки в PostgreSQL и песочница виджетов QuickJS/WebAssembly. Проект на стадии пилота; репозиторий приватный.',
      url: 'https://sarafanchat.ru/',
      isRepositoryPrivate: true,
      technologies: [
        'TypeScript',
        'Node.js',
        'React',
        'Vite',
        'PostgreSQL',
        'Drizzle',
        'Docker',
        'QuickJS',
        'WebAssembly',
      ],
      sortOrder: 1,
    },
    {
      name: 'ChipAI',
      description:
        'Собственный full-stack сервис генерации AI-медиа: интеграции Segmind/Replicate, OAuth, кошелёк и биллинг, YooKassa, развёртывание на VPS. Репозиторий приватный.',
      url: 'https://neuro-chip.ru/',
      isRepositoryPrivate: true,
      technologies: [
        'React',
        'Vite',
        'Node.js',
        'Express',
        'PostgreSQL',
        'Docker',
        'OAuth',
        'Segmind',
        'Replicate',
        'YooKassa',
      ],
      sortOrder: 2,
    },
    {
      name: 'Восстановление и перенос приложений',
      description:
        'Декомпиляция, восстановление кода, ресурсов и Unity-проектов, анализ бинарных файлов и адаптация платформенных зависимостей (Hollow Knight, Subnautica, FlatOut 2, Need for Speed: Most Wanted). Использую ИИ-агентов и проверяю результат.',
      technologies: ['ILSpy', 'AssetRipper', 'UnityPy', 'Ghidra'],
      sortOrder: 3,
    },
    {
      name: 'Delay Lama',
      description:
        'Перенёс оригинальный Windows VST2-плагин в браузер по цепочке x86 → C → WebAssembly на базе recomp-kit/Emscripten; адаптация Win32/GDI, GUI, MIDI и AudioWorklet.',
      url: 'https://justplayweb.com/game/delay-lama/',
      technologies: [
        'VST2',
        'x86',
        'C',
        'WebAssembly',
        'recomp-kit',
        'Emscripten',
        'Win32/GDI',
        'MIDI',
        'AudioWorklet',
      ],
      sortOrder: 4,
    },
    {
      name: 'Worms: Open Warfare 2 — веб-порт',
      description: 'Личный веб-порт; примерно 1-2 дня на порт.',
      url: 'https://justplayweb.com/game/worms-ow2/',
      technologies: [],
      sortOrder: 5,
    },
    {
      name: 'Need for Speed: Most Wanted — веб-порт',
      description: 'Личный веб-порт; примерно 1-2 дня на порт.',
      url: 'https://justplayweb.com/game/nfs-most-wanted/',
      technologies: [],
      sortOrder: 6,
    },
    {
      name: 'FlatOut 2 — веб-порт',
      description: 'Личный веб-порт; примерно 1-2 дня на порт.',
      url: 'https://justplayweb.com/game/flatout-2/',
      technologies: [],
      sortOrder: 7,
    },
    {
      name: 'Hollow Knight — веб-порт',
      description: 'Личный веб-порт; примерно 1-2 дня на порт.',
      url: 'https://justplayweb.com/game/hollow-knight/',
      technologies: [],
      sortOrder: 8,
    },
    {
      name: 'MINI·MINO',
      description: 'Игровой прототип (GMTK 2026).',
      technologies: [],
      sortOrder: 9,
    },
    {
      name: 'Gumball Gamble',
      description: 'Игровой прототип.',
      technologies: [],
      sortOrder: 10,
    },
    {
      name: 'Infinite LoopHole',
      description: 'Игровой прототип.',
      technologies: [],
      sortOrder: 11,
    },
    ...['Brackeys2025.2', 'GMTK2025', 'MelonJam2025', 'Jamsepticeye'].map(
      (name, sortOrder) => ({
        name,
        description: null,
        repositoryUrl: `https://github.com/DenTheProgrammer/${name}`,
        technologies: [],
        sortOrder: 12 + sortOrder,
      }),
    ),
  ],
} satisfies CandidateData;
