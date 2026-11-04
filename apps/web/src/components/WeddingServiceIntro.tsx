import { Heart, ArrowRight } from 'lucide-react';
export function WeddingServiceIntro() {
  return <section id="thiep-cuoi" className="wedding-service-intro"><div><span className="public-eyebrow">THIỆP MỜI CỦA HAI BẠN</span><h2>Gửi lời mời.<br />Đón lời chúc yêu thương.</h2><p>Thông tin hai gia đình, lịch buổi lễ, album cưới và mã QR mừng cưới nhà trai, nhà gái. Khách mời xác nhận tham dự và gửi lời chúc ngay trên thiệp.</p><a href="#tai-khoan/thiep-online" className="event-primary"><Heart size={17} />Quản lý thiệp trong tài khoản<ArrowRight size={16} /></a><small>Cô dâu và chú rể có thể cùng quản lý khách mời bằng tài khoản riêng.</small></div><img src="/public-invitation.jpg" alt="Minh họa thiệp mời cưới và thiệp số" loading="lazy" /></section>;
}
