// apps/web/src/components/DragonPhoenixBackground.tsx
import React from 'react';

/**
 * HỌA TIẾT HOA VĂN RỒNG PHƯỢNG CHÌM (DRAGON & PHOENIX LUXURY WATERMARK)
 * Nét đẹp văn hóa truyền thống cưới hỏi "Long Phụng Sum Vầy",
 * Họa tiết nét vẽ màu trắng tinh tế ẩn chìm dưới nền, không cản trở nội dung,
 * loại bỏ cảm giác đơn điệu của màu nền phẳng mà không gây rối mắt.
 */
export const DragonPhoenixBackground: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. HỌA TIẾT RỒNG UỐN LƯỢN (HOÀNG LONG) BÊN GÓC TRÁI TRÊN */}
      <svg
        className="absolute -left-16 sm:-left-6 top-28 sm:top-36 w-[340px] sm:w-[500px] lg:w-[680px] h-auto opacity-70 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        viewBox="0 0 500 500"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Thân rồng uốn lượn mây ngũ sắc */}
        <path d="M 50,150 Q 120,80 200,140 T 320,120 T 420,200 T 350,300 T 220,280 T 130,380 T 60,320" />
        <path d="M 70,165 Q 130,105 200,160 T 310,140 T 400,210 T 335,285 T 225,265 T 145,360 T 80,310" strokeDasharray="4,4" />
        {/* Đầu rồng & râu rồng vờn mây */}
        <path d="M 420,200 C 450,180 480,195 470,225 C 460,250 430,240 410,230" />
        <path d="M 465,190 Q 490,160 485,130" />
        <path d="M 460,200 Q 495,195 500,180" />
        <path d="M 445,230 Q 475,260 460,280" />
        <circle cx="445" cy="205" r="3" fill="currentColor" />
        {/* Móng rồng & Vảy rồng cách điệu */}
        <path d="M 280,135 Q 270,100 250,110 M 275,135 Q 260,110 245,125" />
        <path d="M 360,230 Q 380,260 400,250 M 355,240 Q 370,270 385,270" />
        <path d="M 180,300 Q 160,330 140,320 M 185,310 Q 170,340 155,340" />
        {/* Đám mây hoa văn hoàng gia uốn lượn quanh rồng */}
        <path d="M 90,90 Q 120,60 145,90 T 190,100 T 170,130 T 120,120 Z" />
        <path d="M 30,240 Q 60,210 90,230 T 120,270 T 80,290 Z" />
        <path d="M 260,340 Q 300,310 330,330 T 360,370 T 310,390 Z" />
      </svg>

      {/* 2. HỌA TIẾT PHƯỢNG HOÀNG (KIM PHỤNG) BÊN GÓC PHẢI */}
      <svg
        className="absolute -right-20 sm:-right-8 top-[380px] sm:top-[460px] lg:top-[520px] w-[360px] sm:w-[520px] lg:w-[700px] h-auto opacity-70 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        viewBox="0 0 500 500"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Thân & đầu phượng hoàng vươn cao */}
        <path d="M 220,180 C 200,140 230,90 260,100 C 285,110 275,150 250,170" />
        {/* Mỏ & vương miện lông vũ của phượng */}
        <path d="M 260,100 L 285,95 L 268,110" />
        <path d="M 255,90 Q 260,60 280,65" />
        <path d="M 250,92 Q 240,65 255,55" />
        <circle cx="255" cy="108" r="2.5" fill="currentColor" />
        {/* Đôi cánh phượng hoàng xòe rộng hoa mỹ */}
        <path d="M 245,160 Q 320,110 420,140 C 370,165 310,185 240,200" />
        <path d="M 260,150 Q 340,95 440,115 C 380,145 315,170 245,185" strokeDasharray="4,3" />
        <path d="M 215,185 Q 150,130 60,150 C 110,180 170,210 215,225" />
        <path d="M 205,175 Q 130,115 40,130 C 95,165 160,195 210,210" strokeDasharray="4,3" />
        {/* Dải đuôi lông vũ phượng uốn lượn thướt tha */}
        <path d="M 230,220 Q 210,310 280,390 Q 330,440 310,490" />
        <path d="M 225,235 Q 180,320 210,410 Q 230,470 200,495" />
        <path d="M 240,230 Q 270,300 260,380 Q 250,450 280,485" strokeDasharray="5,4" />
        {/* Hạt ngọc đuôi phượng */}
        <ellipse cx="310" cy="490" rx="6" ry="10" />
        <ellipse cx="200" cy="495" rx="6" ry="10" />
        <ellipse cx="280" cy="485" rx="5" ry="9" />
        {/* Mây ngũ sắc vờn quanh cánh phượng */}
        <path d="M 360,190 Q 400,160 430,180 T 470,220 T 420,240 Z" />
        <path d="M 110,230 Q 140,200 170,220 T 200,260 T 150,280 Z" />
      </svg>

      {/* 3. HOA VĂN MÂY CUNG ĐÌNH & CHỮ HỶ GÓC DƯỚI TRÁI */}
      <svg
        className="absolute -left-10 bottom-16 sm:bottom-28 w-60 sm:w-80 h-auto opacity-65 text-white hidden md:block drop-shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="100" cy="100" r="75" strokeDasharray="3,3" />
        <circle cx="100" cy="100" r="65" />
        {/* Hoa văn mây 4 hướng */}
        <path d="M 100,35 Q 120,20 135,35 T 150,55 T 130,70 T 100,55 Z" />
        <path d="M 100,165 Q 80,180 65,165 T 50,145 T 70,130 T 100,145 Z" />
        <path d="M 35,100 Q 20,80 35,65 T 55,50 T 70,70 T 55,100 Z" />
        <path d="M 165,100 Q 180,120 165,135 T 145,150 T 130,130 T 145,100 Z" />
        {/* Hoa sen / Tâm hỷ sự */}
        <path d="M 90,95 Q 100,75 110,95 Q 100,115 90,95 Z" fill="currentColor" fillOpacity="0.4" />
      </svg>

      {/* 4. HOA VĂN GÓC CUNG ĐÌNH TRÊN GÓC PHẢI TRÊN */}
      <svg
        className="absolute right-2 top-20 w-44 sm:w-56 h-auto opacity-60 text-white hidden sm:block drop-shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        viewBox="0 0 160 160"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M 10,10 L 150,10 L 150,150" />
        <path d="M 25,25 L 135,25 L 135,135" strokeDasharray="3,3" />
        <path d="M 150,10 C 120,30 130,70 100,80 C 80,90 70,120 50,150" />
        <circle cx="110" cy="50" r="8" />
        <circle cx="70" cy="90" r="6" />
      </svg>
    </div>
  );
};
