// apps/web/src/components/UnifiedAuth.tsx
import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  KeyRound, 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  X,
  CheckCircle2
} from 'lucide-react';
import { appStore, INITIAL_CUSTOMERS } from '../services/store';

interface UnifiedAuthProps {
  onBack: () => void;
  onSuccess: (role: 'admin' | 'customer') => void;
}

export const UnifiedAuth: React.FC<UnifiedAuthProps> = ({ onBack, onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Fields cho form Đăng Nhập chung
  const [identifier, setIdentifier] = useState(''); // Có thể là Username, Email hoặc SĐT
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Fields cho form Đăng Ký Khách Hàng
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Modal Google / Facebook
  const [socialModal, setSocialModal] = useState<'google' | 'facebook' | null>(null);
  const [socialName, setSocialName] = useState('');
  const [socialEmail, setSocialEmail] = useState('');
  const [socialPhone, setSocialPhone] = useState('');

  const handleUnifiedLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMessage('Vui lòng nhập Tên đăng nhập, Email hoặc Số điện thoại.');
      return;
    }

    // 1. Nếu có mật khẩu hoặc username có dạng admin / email / tên nhân viên -> Ưu tiên thử đăng nhập Quản Trị
    if (password.trim() || cleanId.toLowerCase() === 'admin' || cleanId.includes('@')) {
      const adminRes = appStore.loginWithCredentials(cleanId, password.trim());
      if (adminRes.success) {
        onSuccess('admin');
        return;
      }
    }

    // 2. Thử đăng nhập Khách Hàng bằng số điện thoại
    const custRes = appStore.loginCustomer(cleanId);
    if (custRes.success) {
      onSuccess('customer');
      return;
    }

    // 3. Nếu cả 2 đều không khớp
    if (password.trim()) {
      setErrorMessage('Thông tin đăng nhập không chính xác. Quản trị viên vui lòng kiểm tra lại mật khẩu, hoặc khách hàng vui lòng nhập đúng số điện thoại.');
    } else {
      setErrorMessage('Số điện thoại chưa có trên hệ thống. Quý khách vui lòng chuyển sang tab "Đăng Ký Mới" hoặc đăng nhập nhanh bằng Google / Facebook!');
    }
  };

  const handleRegisterCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = appStore.registerCustomer({
      fullName: regFullName,
      phone: regPhone,
      email: regEmail,
      address: regAddress,
    });
    if (res.success) {
      onSuccess('customer');
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleOpenSocialModal = (provider: 'google' | 'facebook') => {
    setSocialModal(provider);
    if (provider === 'google') {
      setSocialName('Nguyễn Văn An');
      setSocialEmail('an.nguyen@gmail.com');
      setSocialPhone('0912 888 999');
    } else {
      setSocialName('Trần Mai Lan');
      setSocialEmail('mailan@facebook.com');
      setSocialPhone('0988 777 666');
    }
  };

  const handleConfirmSocial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialModal) return;
    const res = appStore.loginCustomerWithOAuth(socialModal, {
      name: socialName.trim(),
      email: socialEmail.trim(),
      phone: socialPhone.trim(),
    });
    setSocialModal(null);
    if (res.success) {
      onSuccess('customer');
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleInstantSocial = (provider: 'google' | 'facebook') => {
    const profile = provider === 'google'
      ? { name: 'Khách Hàng Google (Gmail)', email: 'khachhang.gmail@gmail.com', phone: '0912 333 444' }
      : { name: 'Khách Hàng Facebook', email: 'khachhang.fb@facebook.com', phone: '0988 222 333' };
    const res = appStore.loginCustomerWithOAuth(provider, profile);
    if (res.success) {
      onSuccess('customer');
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleQuickAdminLogin = () => {
    const res = appStore.loginWithCredentials('admin', '123456');
    if (res.success) onSuccess('admin');
  };

  const handleQuickCustomerLogin = (phoneNum: string) => {
    const res = appStore.loginCustomer(phoneNum);
    if (res.success) onSuccess('customer');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#fbf9f5] relative overflow-hidden">
      
      {/* Họa tiết trang nhã góc trên và dưới */}
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

      {/* Card Đăng Nhập Gộp Chung Hoàn Chỉnh */}
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden relative z-10 animate-fade-in">
        
        {/* Header trên card: Chuyển bề mặt sang màu trung tính sáng trang nhã, tương phản cao */}
        <div className="bg-stone-50 border-b border-stone-200/90 p-6 sm:p-7 text-center relative">
          <button
            type="button"
            onClick={onBack}
            className="absolute left-4 top-4 text-stone-500 hover:text-stone-900 flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về website</span>
          </button>

          <img 
            src="/logo_thai_dang.png" 
            alt="Nhà Rạp Thái Đăng" 
            className="h-14 mx-auto object-contain mb-2.5" 
          />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0e4b44] uppercase">
            HỆ THỐNG ĐĂNG NHẬP
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 font-medium">
            Dành cho Khách hàng &amp; Quản trị viên Nhà Rạp Thái Đăng
          </p>
        </div>

        {/* Tab Chuyển đổi: Đăng Nhập vs Đăng Ký Mới */}
        <div className="flex border-b border-stone-200 text-xs font-bold uppercase tracking-wider bg-stone-100/60">
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMessage(''); }}
            className={`flex-1 py-3.5 text-center transition-all cursor-pointer ${
              tab === 'login'
                ? 'border-b-2 border-[#0e4b44] text-[#0e4b44] bg-white font-extrabold shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMessage(''); }}
            className={`flex-1 py-3.5 text-center transition-all cursor-pointer ${
              tab === 'register'
                ? 'border-b-2 border-[#0e4b44] text-[#0e4b44] bg-white font-extrabold shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Đăng Ký Khách Hàng
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium animate-shake">
              {errorMessage}
            </div>
          )}

          {successNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
              {successNotice}
            </div>
          )}

          {tab === 'login' ? (
            <div className="space-y-4">
              
              {/* CỤM ĐĂNG NHẬP GOOGLE / GMAIL & FACEBOOK */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider text-center">
                  Đăng nhập nhanh mạng xã hội (Khách hàng)
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenSocialModal('google')}
                    className="py-2.5 px-3 rounded-xl border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenSocialModal('facebook')}
                    className="py-2.5 px-3 rounded-xl border border-[#1877F2]/30 bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Facebook</span>
                  </button>
                </div>
              </div>

              {/* Đường kẻ phân cách */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-stone-200"></div>
                <span className="flex-shrink mx-3 text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                  Hoặc nhập tài khoản / số điện thoại
                </span>
                <div className="flex-grow border-t border-stone-200"></div>
              </div>

              {/* FORM NHẬP TÀI KHOẢN */}
              <form onSubmit={handleUnifiedLogin} className="space-y-4 text-sm">
                
                <div>
                  <label className="block font-semibold text-stone-800 mb-1.5 text-sm">
                    Tên đăng nhập, Email hoặc Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Tên đăng nhập, email hoặc số điện thoại"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0e4b44] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-stone-800 text-sm">
                      Mật khẩu <span className="font-normal text-stone-500 text-xs">(Quản trị viên)</span>
                    </label>
                    <span className="text-xs text-stone-500 font-normal">
                      Khách hàng để trống
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu quản trị viên"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0e4b44] text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#ee5a45] hover:bg-[#e04530] text-white font-bold text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>ĐĂNG NHẬP VÀO HỆ THỐNG</span>
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleRegisterCustomer} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-stone-800 mb-1.5 text-sm">
                  Họ và tên gia đình / đại diện <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Anh Nam & Chị Lan"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0e4b44] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1.5 text-sm">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="0988 123 456"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0e4b44] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1.5 text-sm">Email (tùy chọn)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    placeholder="khachhang@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0e4b44] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1.5 text-sm">Địa chỉ (Thôn, Xã, Tỉnh)</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Ví dụ: Cổ Lễ, Trực Ninh, Nam Định"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0e4b44] text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#ee5a45] hover:bg-[#e04530] text-white font-bold text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer mt-3"
              >
                Đăng Ký Tài Khoản Khách Hàng
              </button>
            </form>
          )}

        </div>
      </div>

      {/* MODAL LIÊN KẾT GOOGLE / FACEBOOK */}
      {socialModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 p-6 sm:p-7 relative animate-fade-in text-stone-800">
            <button
              onClick={() => setSocialModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-3 shadow-sm bg-stone-50 border border-stone-100">
                {socialModal === 'google' ? (
                  <svg className="w-7 h-7" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                )}
              </div>
              <h3 className="font-bold text-lg text-stone-900">
                {socialModal === 'google' ? 'Đăng nhập với tài khoản Google' : 'Đăng nhập với tài khoản Facebook'}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Liên kết tài khoản khách hàng để quản lý và tra cứu tiến độ sự kiện
              </p>
            </div>

            <form onSubmit={handleConfirmSocial} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Họ tên hiển thị *</label>
                <input
                  type="text"
                  required
                  value={socialName}
                  onChange={(e) => setSocialName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-800"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-800"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Số điện thoại liên hệ *</label>
                <input
                  type="tel"
                  required
                  value={socialPhone}
                  onChange={(e) => setSocialPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-800"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleInstantSocial(socialModal)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold cursor-pointer"
                >
                  Đăng nhập 1-chạm
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl font-bold text-white shadow-md cursor-pointer ${
                    socialModal === 'google' ? 'bg-[#4285F4] hover:bg-[#3367d6]' : 'bg-[#1877F2] hover:bg-[#166fe5]'
                  }`}
                >
                  Xác nhận & Vào
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
