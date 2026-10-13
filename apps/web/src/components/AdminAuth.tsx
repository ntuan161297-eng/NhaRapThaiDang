// apps/web/src/components/AdminAuth.tsx
import React, { useState } from 'react';
import { ArrowLeft, User, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { appStore } from '../services/store';
import { toast } from '../services/notification';
import { getOfficialContactHotline } from '../config/contact';

interface AdminAuthProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ onBack, onSuccess }) => {
  // Bỏ tài khoản demo hiển thị trên màn hình - Bắt đầu bằng ô trống
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!username.trim() || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    const res = appStore.loginWithCredentials(username.trim(), password);
    if (res.success) {
      toast.success('Đăng nhập hệ thống thành công!');
      onSuccess();
    } else {
      setErrorMessage(res.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#fbf9f5] relative overflow-hidden">
      {/* Họa tiết thực vật trang nhã ở các góc (Chuẩn Ảnh 4) */}
      <div className="absolute top-0 right-0 w-80 h-80 pointer-events-none opacity-40">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
          <path d="M190 20 C150 50 130 90 140 140 C150 100 175 60 190 20Z" fill="#3b7a57" opacity="0.5"/>
          <path d="M200 70 C160 90 145 130 155 170 C165 130 185 100 200 70Z" fill="#52b788" opacity="0.4"/>
          <path d="M150 30 C130 65 120 105 130 135 C140 95 160 65 150 30Z" fill="#74c69d" opacity="0.3"/>
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 w-80 h-80 pointer-events-none opacity-40">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
          <path d="M10 180 C50 150 70 110 60 60 C50 100 25 140 10 180Z" fill="#3b7a57" opacity="0.5"/>
          <path d="M0 130 C40 110 55 70 45 30 C35 70 15 100 0 130Z" fill="#52b788" opacity="0.4"/>
          <path d="M50 170 C70 135 80 95 70 65 C60 105 40 135 50 170Z" fill="#74c69d" opacity="0.3"/>
        </svg>
      </div>

      {/* Card Form Đăng Nhập Quản Trị (Chuẩn Ảnh 4) */}
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-stone-200/80 p-8 sm:p-10 relative z-10 animate-fade-in">
        
        {/* Nút quay về website góc trên bên trái card */}
        <div className="mb-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0e4b44] hover:text-[#176d63] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về website</span>
          </button>
        </div>

        {/* Logo & Tiêu đề đăng nhập chuẩn Ảnh 4 */}
        <div className="text-center space-y-1.5 mb-6">
          <img 
            src="/logo_thai_dang.png" 
            alt="Nhà Rạp Thái Đăng" 
            className="h-16 mx-auto object-contain drop-shadow-2xs mb-2" 
          />
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0e4b44] tracking-tight">
            Đăng nhập quản trị
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            Nhà rạp Thái Đăng • Hệ thống quản lý
          </p>

          {/* Dấu chấm phẩy / biểu tượng kim cương trang trí vàng gold */}
          <div className="flex items-center justify-center gap-2 pt-2 text-[#c59b4c] text-xs">
            <span className="w-8 h-[1px] bg-[#eedcc2]"></span>
            <span>◆</span>
            <span className="w-8 h-[1px] bg-[#eedcc2]"></span>
          </div>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed animate-shake">
            {errorMessage}
          </div>
        )}

        {/* Form nhập tài khoản admin của người dùng (Không in tài khoản, mật khẩu) */}
        <form onSubmit={handleCredentialLogin} className="space-y-4 text-xs">
          
          {/* Ô nhập Tên đăng nhập hoặc Email */}
          <div>
            <label className="block font-bold text-stone-800 mb-1.5">
              Tên đăng nhập hoặc Email *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                autoFocus
                placeholder="Nhập tên đăng nhập hoặc email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-white font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0e4b44] transition-all text-xs"
              />
            </div>
          </div>

          {/* Ô nhập Mật khẩu kèm icon ẩn/hiện */}
          <div>
            <label className="block font-bold text-stone-800 mb-1.5">
              Mật khẩu *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 bg-white font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0e4b44] transition-all text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-stone-400 hover:text-stone-700 transition-colors p-0.5"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Quên mật khẩu link */}
            <div className="text-right mt-1.5">
              <button
                type="button"
                onClick={() => toast.info(`Vui lòng liên hệ quản trị viên chính hoặc gọi Hotline ${getOfficialContactHotline()} để cấp lại quyền truy cập.`)}
                className="text-[11px] font-semibold text-[#0e4b44] hover:underline cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>
          </div>

          {/* Nút ĐĂNG NHẬP màu cam đỏ chuẩn Ảnh 4 */}
          <button
            type="submit"
            className="w-full mt-4 py-3.5 rounded-xl bg-[#f06148] hover:bg-[#e05038] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
          >
            <KeyRound className="w-4 h-4" />
            <span>ĐĂNG NHẬP</span>
          </button>
        </form>

      </div>
    </div>
  );
};
