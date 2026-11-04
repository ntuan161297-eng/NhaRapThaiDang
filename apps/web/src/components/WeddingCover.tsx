import React from 'react';
import { Heart } from 'lucide-react';
import type { WeddingContent } from '@thai-dang/shared';
import { weddingStyles } from '../utils/weddingDesign';
import { formatEventDate, lunarForDay, solarDay } from '../utils/eventDates';

/** Original vector ornament inspired by the traditional fans, lotus and dress of Quan họ. */
function QuanHoArt() {
  return <svg viewBox="0 0 460 240" className="quan-ho-art" aria-hidden="true"><defs><linearGradient id="lotus-leaf" x2="1" y2="1"><stop stopColor="#4d8d69" /><stop offset="1" stopColor="#154e40" /></linearGradient></defs><path d="M30 205Q110 135 210 215Q310 150 430 205" fill="none" stroke="#c6ac6a" strokeWidth="1" /><g fill="url(#lotus-leaf)" stroke="#baa56b" strokeWidth=".8"><path d="M52 218Q-1 174 23 147Q60 155 65 185Q68 133 108 146Q115 184 72 215Z"/><path d="M385 219Q339 175 364 148Q399 158 398 184Q415 139 446 155Q439 195 398 218Z"/></g><g fill="#f5dfc0" stroke="#bca06a" strokeWidth="1"><path d="M86 202Q52 181 63 163Q87 164 95 187Q91 151 111 141Q132 161 111 191Q137 169 151 184Q138 207 103 207Z"/><path d="M352 205Q320 182 335 166Q357 169 363 189Q358 155 379 146Q400 166 379 191Q405 172 419 188Q402 210 370 210Z"/></g><g><path d="M142 219L157 110Q179 99 200 117L220 220Z" fill="#161f2b"/><path d="M155 135L153 214M194 135L202 216" stroke="#b59b66" strokeWidth="1"/><ellipse cx="176" cy="81" rx="19" ry="24" fill="#e6b794"/><path d="M155 75Q153 45 177 46Q202 48 198 77L187 65L158 72Z" fill="#17252a"/><path d="M150 56Q174 42 201 55L199 67L154 67Z" fill="#14252a"/><path d="M167 106L177 118L187 106" fill="#f4e7d1"/><path d="M201 136Q229 162 211 184L182 155" fill="#1a2830"/><path d="M169 159L203 135Q218 144 220 161L172 170Z" fill="#d7ba7b" stroke="#a28855"/><path d="M174 164L205 139M175 166L214 149M176 168L216 158" stroke="#9d8555" strokeWidth=".8"/></g><g><path d="M244 220L258 115Q281 104 300 118L324 220Z" fill="#18272d"/><path d="M270 119L259 218L294 218L286 120" fill="#3b8865"/><path d="M276 123L274 220L287 220L283 124" fill="#b54c3d"/><ellipse cx="278" cy="87" rx="18" ry="24" fill="#e9bf9e"/><path d="M260 86Q249 58 273 56Q302 55 299 91L290 75L264 79Z" fill="#18272b"/><path d="M246 76Q262 41 283 44Q307 48 311 76Q288 66 269 76Z" fill="#18272b"/><path d="M260 112L269 149L279 124L286 149L296 113" fill="#a75343"/><ellipse cx="321" cy="161" rx="34" ry="46" transform="rotate(-23 321 161)" fill="#d8bd83" stroke="#aa8d53" strokeWidth="3"/><ellipse cx="321" cy="161" rx="23" ry="34" transform="rotate(-23 321 161)" fill="none" stroke="#c5a56b"/><path d="M295 152L308 153" stroke="#eac2a2" strokeWidth="9" strokeLinecap="round"/></g><g fill="none" stroke="#a7bd99" strokeWidth=".8" opacity=".6"><path d="M81 124V93L100 82L119 93V124M76 94L100 72L124 94M335 122V94L355 82L376 94V122M330 94L355 71L381 94"/><path d="M16 134H444" strokeDasharray="2 9"/></g></svg>;
}

export function WeddingCover({ content, compact = false }: { content: WeddingContent; compact?: boolean }) {
  const style = weddingStyles.find(style => style.id === content.style) || weddingStyles[3];
  const ceremony = content.ceremonies[0];
  return <section className={`wedding-paper-hero wedding-cover wedding-style-${style.id}${compact ? ' wedding-cover-compact' : ''}${content.coverImage ? ' wedding-cover-photo' : ''}`} style={content.coverImage ? { backgroundImage: `linear-gradient(#081f1955,#081f19a6),url("${content.coverImage.replaceAll('"', '%22')}")` } : undefined}>
    <div className="wedding-cover-frame" aria-hidden="true" /><span className="wedding-cover-monogram" aria-hidden="true">{style.mark}</span>
    <span className="wedding-overline">{content.title || 'Trân trọng kính mời'}</span>
    <p className="wedding-cover-guest">{content.guestSalutation || 'Quý khách'}{content.guestName ? ` ${content.guestName}` : ''}</p>
    <h1>{content.groom.name || 'Chú rể'}<span>&amp;</span>{content.bride.name || 'Cô dâu'}</h1>
    <p className="wedding-cover-message">{content.invitationText}</p>
    {ceremony?.at && <div className="wedding-cover-date"><strong>{formatEventDate(ceremony.at)}</strong><span>{lunarForDay(solarDay(ceremony.at)).lunarDateStr}</span></div>}
    {style.id === 'quan_ho' && !content.coverImage && <QuanHoArt />}
    {!compact && <a href="#rsvp" onClick={event => { event.preventDefault(); document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' }); }} className="event-primary"><Heart size={16} />Xác nhận tham dự</a>}
  </section>;
}
