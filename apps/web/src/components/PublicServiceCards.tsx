import { ArrowUpRight, Heart, Home, Mail, Sparkles } from 'lucide-react';
import type { EventService } from '@thai-dang/shared';
import { PublicImage } from './PublicImage';
import { navigatePublicLink } from '../utils/publicSite';

const services = [
  { id: 'dam_cuoi', name: 'Tiệc cưới', description: 'Rạp cưới, bàn tiệc và không gian đón khách đồng bộ.', image: '/public-wedding-hero.jpg', icon: Sparkles, target: '#dat-lich' },
  { id: 'dam_hoi', name: 'Lễ ăn hỏi', description: 'Trang trọng nghi lễ, tinh tế trong từng chi tiết.', image: '/public-engagement.jpg', icon: Heart, target: '#dat-lich' },
  { id: 'nha_moi', name: 'Tiệc tân gia', description: 'Không gian ấm cúng cho một khởi đầu nhiều niềm vui.', image: '/public-housewarming.jpg', icon: Home, target: '#dat-lich' },
  { id: 'thiep_cuoi', name: 'Thiệp cưới online', description: 'Tìm hiểu thiệp cưới số và tiện ích dành cho cặp đôi.', image: '/public-invitation.jpg', icon: Mail, target: '#thiep-cuoi' },
];

export function PublicServiceCards({ onSelect }: { onSelect: (service: EventService) => void }) {
  return <div className="public-service-grid">
    {services.map(({ id, name, description, image, icon: Icon, target }, index) => (
      <article className="public-service-card" key={id}>
        <a href={target} onClick={event => {
          event.preventDefault();
          if (id !== 'thiep_cuoi') onSelect(id as EventService);
          navigatePublicLink(target);
        }}>
          <div className="public-service-photo"><PublicImage src={image} alt={`Gợi ý phong cách ${name.toLowerCase()}`} width={450} height={300} /><span>0{index + 1}</span></div>
          <div className="public-service-copy">
            <div className="public-service-title"><Icon aria-hidden="true" /><h3>{name}</h3><ArrowUpRight aria-hidden="true" /></div>
            <p>{description}</p>
          </div>
        </a>
      </article>
    ))}
  </div>;
}
