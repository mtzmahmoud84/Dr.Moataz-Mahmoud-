const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');
const navLinks = document.querySelectorAll('.nav-link');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'إغلاق القائمة' : 'فتح القائمة');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'فتح القائمة');
    });
  });
}

const sections = document.querySelectorAll('main section[id]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
sections.forEach((section) => observer.observe(section));

const form = document.querySelector('#appointment-form');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.querySelector('#name').value.trim();
    const phone = document.querySelector('#phone').value.trim();
    const service = document.querySelector('#service').value;
    const message = document.querySelector('#message').value.trim();

    const text = [
      'السلام عليكم دكتور معتز محمود رياض،',
      '',
      `أرغب في حجز موعد.`,
      `الاسم: ${name}`,
      `رقم الهاتف: ${phone}`,
      `الخدمة المطلوبة: ${service}`,
      message ? `وصف مختصر للحالة: ${message}` : '',
      '',
      'أرجو التواصل لتأكيد الموعد. شكرًا.'
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/201554764748?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
}

document.querySelector('#year').textContent = new Date().getFullYear();
