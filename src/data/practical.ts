export interface PracticalStep {
  id: string;
  text: string;
  hint?: string;
}

export interface PracticalSection {
  id: string;
  numberBn: string;
  title: string;
  marks: number;
  fileNameRule?: string;
  description: string;
  excelPreview?: {
    headers: string[];
    rows: (string | number)[][];
    formulas: { label: string; formula: string; result: string }[];
  };
  steps: PracticalStep[];
}

export const PRACTICAL_EXAM_META = {
  title: 'Computer Literacy Practical Examination',
  subtitle: 'যুব উন্নয়ন অধিদপ্তর — ১ম ব্যাচ ব্যবহারিক পরীক্ষা',
  fullMarks: 10,
  durationMinutes: 30,
  instructions: [
    'সকল কাজ কম্পিউটারে সম্পন্ন করতে হবে।',
    'প্রতিটি ফাইল নির্ধারিত নামে সংরক্ষণ (Save) করতে হবে।',
    'পরীক্ষা শেষে সকল ফাইল নির্ধারিত ফোল্ডারে জমা দিতে হবে।',
  ],
};

export const PRACTICAL_SECTIONS: PracticalSection[] = [
  {
    id: 'prac_windows',
    numberBn: 'প্রশ্ন-১',
    title: 'Windows ও File Management',
    marks: 2,
    description: 'Desktop-এ মূল ফোল্ডার ও তার ভেতরে ৪টি সাব-ফোল্ডার তৈরি করুন।',
    steps: [
      {
        id: 'p1_folder_main',
        text: 'Desktop-এ AI_Practical_Exam নামে একটি মূল Folder তৈরি করুন',
        hint: 'Desktop-এ Right Click → New → Folder → নাম দিন AI_Practical_Exam',
      },
      {
        id: 'p1_sub_docs',
        text: 'মূল ফোল্ডারের ভেতরে Documents সাব-ফোল্ডার তৈরি করুন',
        hint: 'AI_Practical_Exam ফোল্ডার খুলে Ctrl + Shift + N চাপুন',
      },
      {
        id: 'p1_sub_excel',
        text: 'ভেতরে Excel সাব-ফোল্ডার তৈরি করুন',
      },
      {
        id: 'p1_sub_ppt',
        text: 'ভেতরে Presentation সাব-ফোল্ডার তৈরি করুন',
      },
      {
        id: 'p1_sub_img',
        text: 'ভেতরে Images সাব-ফোল্ডার তৈরি করুন',
      },
    ],
  },
  {
    id: 'prac_word',
    numberBn: 'প্রশ্ন-২',
    title: 'MS Word — ৫০ শব্দের প্রতিবেদন',
    marks: 3,
    fileNameRule: 'Word_YourName_Roll Number.docx',
    description: '"Artificial Intelligence in Daily Life" শিরোনামে ৫০ শব্দের একটি প্রতিবেদন তৈরি করুন।',
    steps: [
      {
        id: 'p2_heading',
        text: 'Title-কে Heading 1 স্টাইল দিন ("Artificial Intelligence in Daily Life")',
        hint: 'Home ট্যাব → Styles → Heading 1 নির্বাচন করুন',
      },
      {
        id: 'p2_text',
        text: 'অন্তত ৫০ শব্দের পরিচ্ছন্ন অনুচ্ছেদ লিখুন',
        hint: 'নিচের Status Bar-এ Word Count দেখে ৫০+ শব্দ নিশ্চিত করুন',
      },
      {
        id: 'p2_pagenum',
        text: 'ডকুমেন্টে Page Number যুক্ত করুন',
        hint: 'Insert ট্যাব → Page Number → Bottom of Page',
      },
      {
        id: 'p2_justify',
        text: 'মূল লেখায় Justify Alignment প্রয়োগ করুন',
        hint: 'লেখা সিলেক্ট করে Ctrl + J চাপুন',
      },
      {
        id: 'p2_fontsize',
        text: 'বডি টেক্সটের Font Size 12 সেট করুন',
      },
      {
        id: 'p2_linespace',
        text: 'Line Spacing 1.5 নির্ধারণ করুন',
        hint: 'Home → Paragraph → Line and Paragraph Spacing → 1.5',
      },
      {
        id: 'p2_picture',
        text: 'ডকুমেন্টে একটি প্রাসঙ্গিক Picture সংযুক্ত করুন',
        hint: 'Insert → Pictures → This Device',
      },
      {
        id: 'p2_save',
        text: 'Documents ফোল্ডারে Word_YourName_Roll Number.docx নামে সেভ করুন',
      },
    ],
  },
  {
    id: 'prac_excel',
    numberBn: 'প্রশ্ন-৩',
    title: 'MS Excel — Worksheet ও Formula',
    marks: 3,
    fileNameRule: 'Excel_YourName_Roll Number.xlsx',
    description: 'নিচের তথ্য ব্যবহার করে Worksheet তৈরি করুন এবং ফর্মুলা দিয়ে মান বের করুন।',
    excelPreview: {
      headers: ['Name', 'Assignment', 'Viva', 'Total'],
      rows: [
        ['Rahim', 75, 90, '=SUM(B2:C2) → ১৬৫'],
        ['Karim', 80, 88, '=SUM(B3:C3) → ১৬৮'],
        ['Salma', 92, 85, '=SUM(B4:C4) → ১৭৭'],
      ],
      formulas: [
        { label: 'Total Marks', formula: '=SUM(B2:B4) বা =SUM(B2:C2)', result: 'মোট যোগফল' },
        { label: 'Average', formula: '=AVERAGE(B2:B4)', result: 'গড় নম্বর' },
        { label: 'Highest Mark', formula: '=MAX(B2:B4)', result: 'সর্বোচ্চ নম্বর (৯২)' },
        { label: 'Lowest Marks', formula: '=MIN(B2:B4)', result: 'সর্বনিম্ন নম্বর (৭৫)' },
      ],
    },
    steps: [
      {
        id: 'p3_table',
        text: 'Rahim (75, 90), Karim (80, 88), Salma (92, 85) ডেটা দিয়ে টেবিল তৈরি করুন',
      },
      {
        id: 'p3_total',
        text: 'SUM ফর্মুলা ব্যবহার করে Total Marks বের করুন',
        hint: '=SUM(B2:C2) অথবা কলামের জন্য =SUM(B2:B4)',
      },
      {
        id: 'p3_avg',
        text: 'AVERAGE ফর্মুলা ব্যবহার করে Average বের করুন',
        hint: '=AVERAGE(B2:B4) এবং =AVERAGE(C2:C4)',
      },
      {
        id: 'p3_max',
        text: 'MAX ফর্মুলা ব্যবহার করে Highest Mark বের করুন',
        hint: '=MAX(B2:B4)',
      },
      {
        id: 'p3_min',
        text: 'MIN ফর্মুলা ব্যবহার করে Lowest Marks বের করুন',
        hint: '=MIN(B2:B4)',
      },
      {
        id: 'p3_save',
        text: 'Excel ফোল্ডারে Excel_YourName_Roll Number.xlsx নামে সেভ করুন',
      },
    ],
  },
  {
    id: 'prac_ppt',
    numberBn: 'প্রশ্ন-৪',
    title: 'MS PowerPoint — ৫টি স্লাইড',
    marks: 2,
    fileNameRule: 'PPT_YourName_Roll Number.pptx',
    description: '"Introduction to Artificial Intelligence" বিষয়ের উপর ৫টি সুন্দর স্লাইড তৈরি করুন।',
    steps: [
      {
        id: 'p4_slide1',
        text: 'স্লাইড ১: Title Slide ("Introduction to Artificial Intelligence" + আপনার নাম ও রোল)',
      },
      {
        id: 'p4_slide2',
        text: 'স্লাইড ২: AI Definition (কৃত্রিম বুদ্ধিমত্তার সংজ্ঞা)',
      },
      {
        id: 'p4_slide3',
        text: 'স্লাইড ৩: AI Applications (শিক্ষা, স্বাস্থ্য, ডিজাইন ও দৈনন্দিন ব্যবহার)',
      },
      {
        id: 'p4_slide4',
        text: 'স্লাইড ৪: Advantages & Challenges (সুবিধা ও সীমাবদ্ধতা)',
      },
      {
        id: 'p4_slide5',
        text: 'স্লাইড ৫: Thank You স্লাইড',
      },
      {
        id: 'p4_save',
        text: 'Presentation ফোল্ডারে PPT_YourName_Roll Number.pptx নামে সেভ করুন',
      },
    ],
  },
];
