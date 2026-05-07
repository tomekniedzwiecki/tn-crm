/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REVIEWS WIDGET v1.0
 * Dynamiczne ładowanie i renderowanie opinii klientów (z AliExpress)
 * dla landing page TN-CRM.
 *
 * Użycie:
 *   ReviewsWidget.init({
 *     workflowId: 'b6b4402e-...',
 *     containerId: 'reviews-grid',
 *     statsContainerId: 'reviews-stats',
 *     fallback: true   // pokaż istniejące fake'i jeśli baza pusta
 *   });
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  const SUPABASE_URL = 'https://yxmavwkwnfuphjqbelws.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bWF2d2t3bmZ1cGhqcWJlbHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjQyNTUsImV4cCI6MjA4NDM0MDI1NX0.XeR0Fc7OFn6YbNJrOKTBEj36JtmLISZTM87y4ai9340';
  const CACHE_KEY_PREFIX = 'tn_reviews_';
  const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h
  const INITIAL_RENDER_COUNT = 9;
  const STAR_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s]);
  }
  function escapeAttr(str) {
    if (!str) return '';
    return String(str).replace(/"/g, '&quot;');
  }

  function avatarInitials(name) {
    if (!name) return '?';
    const cleaned = name.replace(/\*/g, '');
    const letters = cleaned.match(/[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/g) || [];
    if (letters.length === 0) return '?';
    return letters.slice(0, 2).join('').toUpperCase();
  }

  function getCached(workflowId) {
    try {
      const raw = localStorage.getItem(CACHE_KEY_PREFIX + workflowId);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed.ts || Date.now() - parsed.ts > CACHE_TTL_MS) return null;
      return parsed.data;
    } catch (e) { return null; }
  }
  function setCached(workflowId, data) {
    try {
      localStorage.setItem(CACHE_KEY_PREFIX + workflowId, JSON.stringify({ ts: Date.now(), data }));
    } catch (e) {}
  }

  async function fetchReviews(workflowId) {
    const cached = getCached(workflowId);
    if (cached) return cached;

    const reviewsUrl = `${SUPABASE_URL}/rest/v1/workflow_reviews?workflow_id=eq.${workflowId}&hidden=eq.false&order=sort_order.asc&select=id,rating,content_pl,author_name,review_date,image_urls,sort_order`;
    const optUrl = `${SUPABASE_URL}/rest/v1/workflow_optimization?workflow_id=eq.${workflowId}&select=reviews_count,reviews_total_ratings,reviews_avg_star,reviews_positive_pct`;
    const headers = { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + SUPABASE_ANON_KEY };

    const [reviewsRes, optRes] = await Promise.all([
      fetch(reviewsUrl, { headers }),
      fetch(optUrl, { headers })
    ]);
    if (!reviewsRes.ok) throw new Error(`reviews fetch failed: ${reviewsRes.status}`);

    const reviews = await reviewsRes.json();
    const optArr = optRes.ok ? await optRes.json() : [];
    const stats = (Array.isArray(optArr) && optArr.length > 0) ? optArr[0] : null;

    const data = { reviews, stats };
    // Cache tylko gdy mamy realne opinie — pusty stan zawsze refetchuje
    if (reviews && reviews.length > 0) {
      setCached(workflowId, data);
    }
    return data;
  }

  function renderStars(count) {
    return Array(count).fill(STAR_SVG).join('');
  }

  function renderCard(review, index) {
    const images = Array.isArray(review.image_urls) ? review.image_urls : [];
    const hasImages = images.length > 0;
    const initials = avatarInitials(review.author_name);
    const author = escapeHtml(review.author_name || 'Klient');

    return `
      <div class="review-card" data-review-id="${escapeAttr(review.id)}" data-index="${index}">
        <div class="review-stars">${renderStars(review.rating || 5)}</div>
        ${hasImages ? `
          <div class="review-images" data-count="${images.length}">
            ${images.slice(0, 4).map((url, i) => `
              <button type="button" class="review-image-btn" data-review-idx="${index}" data-img-idx="${i}" aria-label="Zobacz zdjęcie ${i + 1}">
                <img src="${escapeAttr(url)}" alt="Zdjęcie od klienta ${i + 1}" loading="lazy" referrerpolicy="no-referrer">
              </button>
            `).join('')}
            ${images.length > 4 ? `<button type="button" class="review-image-more" data-review-idx="${index}" data-img-idx="0">+${images.length - 4}</button>` : ''}
          </div>
        ` : ''}
        <p class="review-text">${escapeHtml(review.content_pl || '')}</p>
        <div class="review-author">
          <div class="review-avatar">${initials}</div>
          <div class="review-author-info">
            <div class="review-name">${author}</div>
            <div class="review-verified">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
              Zweryfikowany zakup
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderSkeleton(count = 6) {
    return Array(count).fill(0).map(() => `
      <div class="review-card review-skeleton">
        <div class="review-stars-skel"></div>
        <div class="review-images-skel"></div>
        <div class="review-text-skel"></div>
        <div class="review-text-skel" style="width: 80%"></div>
        <div class="review-text-skel" style="width: 60%"></div>
      </div>
    `).join('');
  }

  function renderStats(stats, container) {
    if (!container || !stats) return;
    const { reviews_total_ratings, reviews_avg_star, reviews_positive_pct } = stats;
    if (!reviews_total_ratings) return;

    // "Ponad 6 500" — round down to nearest 500
    const total = parseInt(reviews_total_ratings, 10) || 0;
    const rounded = total >= 1000 ? Math.floor(total / 500) * 500 : total;
    const avg = reviews_avg_star ? parseFloat(reviews_avg_star).toFixed(1) : null;
    const positive = reviews_positive_pct ? Math.round(parseFloat(reviews_positive_pct)) : null;

    container.innerHTML = `
      <div class="reviews-meta-stat">
        <div class="reviews-meta-value">${total >= 1000 ? 'Ponad ' + rounded.toLocaleString('pl-PL') : rounded.toLocaleString('pl-PL')}</div>
        <div class="reviews-meta-label">zadowolonych klientów</div>
      </div>
      ${avg ? `
        <div class="reviews-meta-stat">
          <div class="reviews-meta-value reviews-meta-yellow">${avg}<span style="opacity:.5">/5</span></div>
          <div class="reviews-meta-label">średnia ocena</div>
        </div>
      ` : ''}
      ${positive !== null ? `
        <div class="reviews-meta-stat">
          <div class="reviews-meta-value reviews-meta-green">${positive}%</div>
          <div class="reviews-meta-label">pozytywnych opinii</div>
        </div>
      ` : ''}
    `;
    container.classList.add('reviews-stats-loaded');
  }

  // ═══ LIGHTBOX ═══
  let lightboxState = null;
  function openLightbox(images, currentIdx) {
    closeLightbox();
    const overlay = document.createElement('div');
    overlay.className = 'review-lightbox';
    overlay.innerHTML = `
      <button class="review-lightbox-close" aria-label="Zamknij">&times;</button>
      <button class="review-lightbox-prev" aria-label="Poprzednie">‹</button>
      <button class="review-lightbox-next" aria-label="Następne">›</button>
      <div class="review-lightbox-content">
        <img src="${escapeAttr(images[currentIdx])}" alt="" referrerpolicy="no-referrer">
      </div>
      <div class="review-lightbox-counter">${currentIdx + 1} / ${images.length}</div>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    lightboxState = { overlay, images, idx: currentIdx };

    overlay.querySelector('.review-lightbox-close').onclick = closeLightbox;
    overlay.onclick = (e) => { if (e.target === overlay) closeLightbox(); };
    overlay.querySelector('.review-lightbox-prev').onclick = () => navigate(-1);
    overlay.querySelector('.review-lightbox-next').onclick = () => navigate(1);
    document.addEventListener('keydown', onKey);
  }
  function navigate(dir) {
    if (!lightboxState) return;
    lightboxState.idx = (lightboxState.idx + dir + lightboxState.images.length) % lightboxState.images.length;
    const img = lightboxState.overlay.querySelector('.review-lightbox-content img');
    const counter = lightboxState.overlay.querySelector('.review-lightbox-counter');
    img.src = lightboxState.images[lightboxState.idx];
    counter.textContent = `${lightboxState.idx + 1} / ${lightboxState.images.length}`;
  }
  function closeLightbox() {
    if (!lightboxState) return;
    lightboxState.overlay.remove();
    document.removeEventListener('keydown', onKey);
    document.body.style.overflow = '';
    lightboxState = null;
  }
  function onKey(e) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  }

  // ═══ STYLES ═══
  function injectStyles() {
    if (document.getElementById('reviews-widget-styles')) return;
    const style = document.createElement('style');
    style.id = 'reviews-widget-styles';
    style.textContent = `
      .reviews-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 24px;
        max-width: 720px;
        margin: 0 auto 48px;
        padding: 28px 32px;
        background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        opacity: 0;
        transition: opacity 0.4s ease;
      }
      .reviews-stats.reviews-stats-loaded { opacity: 1; }
      .reviews-meta-stat { text-align: center; }
      .reviews-meta-value {
        font-size: 32px;
        font-weight: 700;
        color: var(--ct-primary, currentColor);
        line-height: 1;
        margin-bottom: 8px;
      }
      .reviews-meta-yellow { color: #FFC107; }
      .reviews-meta-green { color: #10b981; }
      .reviews-meta-label {
        font-size: 13px;
        color: rgba(255,255,255,0.6);
        font-weight: 500;
        line-height: 1.3;
      }

      .reviews-grid-xl {
        column-count: 1;
        column-gap: 20px;
      }
      @media (min-width: 720px) {
        .reviews-grid-xl { column-count: 2; }
      }
      @media (min-width: 1080px) {
        .reviews-grid-xl { column-count: 3; }
      }
      @media (min-width: 1440px) {
        .reviews-grid-xl { column-count: 4; }
      }

      .review-card {
        break-inside: avoid;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 20px;
        animation: review-fade-in 0.5s ease;
        display: inline-block;
        width: 100%;
      }
      @keyframes review-fade-in {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .review-stars {
        display: flex;
        gap: 2px;
        margin-bottom: 12px;
        color: #FFC107;
      }
      .review-stars svg {
        width: 16px;
        height: 16px;
      }

      .review-images {
        display: grid;
        gap: 6px;
        margin-bottom: 14px;
        grid-template-columns: repeat(2, 1fr);
      }
      .review-images[data-count="1"] {
        grid-template-columns: 1fr;
      }
      .review-image-btn,
      .review-image-more {
        position: relative;
        aspect-ratio: 1;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.03);
        padding: 0;
        cursor: pointer;
        transition: transform 0.2s ease, border-color 0.2s ease;
      }
      .review-image-btn:hover,
      .review-image-more:hover {
        transform: scale(1.02);
        border-color: rgba(255,255,255,0.2);
      }
      .review-image-btn img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .review-image-more {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: 600;
        color: rgba(255,255,255,0.7);
      }

      .review-text {
        font-size: 14px;
        line-height: 1.6;
        color: rgba(255,255,255,0.85);
        margin: 0 0 16px;
      }

      .review-author {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-top: 14px;
        border-top: 1px solid rgba(255,255,255,0.06);
      }
      .review-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--ct-primary, #6b7280), rgba(255,255,255,0.2));
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .review-author-info { min-width: 0; }
      .review-name {
        font-size: 13px;
        font-weight: 600;
        color: rgba(255,255,255,0.9);
      }
      .review-verified {
        font-size: 11px;
        color: #10b981;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-top: 1px;
      }

      /* Skeleton */
      .review-skeleton { animation: skel-pulse 1.4s infinite; }
      @keyframes skel-pulse { 0%,100% { opacity: .4; } 50% { opacity: .8; } }
      .review-stars-skel,
      .review-images-skel,
      .review-text-skel {
        background: rgba(255,255,255,0.06);
        border-radius: 4px;
      }
      .review-stars-skel { width: 100px; height: 14px; margin-bottom: 12px; }
      .review-images-skel { width: 100%; height: 120px; margin-bottom: 14px; border-radius: 10px; }
      .review-text-skel { width: 100%; height: 12px; margin-bottom: 8px; }

      /* Lightbox */
      .review-lightbox {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.92);
        backdrop-filter: blur(8px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: review-fade-in 0.2s ease;
      }
      .review-lightbox-content {
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .review-lightbox-content img {
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
        border-radius: 8px;
      }
      .review-lightbox-close,
      .review-lightbox-prev,
      .review-lightbox-next {
        position: absolute;
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.15);
        color: #fff;
        font-size: 32px;
        cursor: pointer;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s ease;
      }
      .review-lightbox-close:hover,
      .review-lightbox-prev:hover,
      .review-lightbox-next:hover {
        background: rgba(255,255,255,0.2);
      }
      .review-lightbox-close { top: 24px; right: 24px; font-size: 28px; }
      .review-lightbox-prev { left: 24px; top: 50%; transform: translateY(-50%); }
      .review-lightbox-next { right: 24px; top: 50%; transform: translateY(-50%); }
      .review-lightbox-counter {
        position: absolute;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        color: rgba(255,255,255,0.7);
        font-size: 14px;
        background: rgba(0,0,0,0.6);
        padding: 6px 14px;
        border-radius: 20px;
      }

      @media (max-width: 720px) {
        .review-lightbox-prev, .review-lightbox-next { width: 40px; height: 40px; font-size: 24px; }
        .review-lightbox-close { width: 40px; height: 40px; top: 16px; right: 16px; }
      }
    `;
    document.head.appendChild(style);
  }

  // ═══ MAIN ═══
  const ReviewsWidget = {
    version: '1.0.0',
    state: {
      reviews: [],
      stats: null,
      renderedCount: 0,
      container: null,
      observer: null
    },

    async init(options = {}) {
      const { workflowId, containerId, statsContainerId, fallback = false } = options;
      if (!workflowId || !containerId) {
        console.warn('[ReviewsWidget] workflowId and containerId required');
        return;
      }
      injectStyles();

      const container = document.getElementById(containerId);
      const statsContainer = statsContainerId ? document.getElementById(statsContainerId) : null;
      if (!container) return;

      this.state.container = container;

      // Skeleton during fetch
      container.innerHTML = renderSkeleton(6);

      try {
        const data = await fetchReviews(workflowId);
        this.state.reviews = data.reviews || [];
        this.state.stats = data.stats || null;
      } catch (err) {
        console.warn('[ReviewsWidget] fetch failed:', err);
        if (fallback) {
          // Leave existing fallback content if any (caller responsible for hiding skeleton)
          return;
        }
        container.innerHTML = '';
        return;
      }

      if (this.state.reviews.length === 0) {
        if (fallback) {
          container.innerHTML = '';
          // Caller can leave its own fallback section visible
        } else {
          container.innerHTML = '';
        }
        return;
      }

      this.render(statsContainer);
      this.attachLightbox();
      this.setupLazyLoad();
    },

    render(statsContainer) {
      const { reviews, container } = this.state;
      const initial = reviews.slice(0, INITIAL_RENDER_COUNT);
      container.classList.add('reviews-grid-xl');
      container.innerHTML = initial.map((r, i) => renderCard(r, i)).join('');
      this.state.renderedCount = initial.length;

      if (statsContainer && this.state.stats) {
        statsContainer.classList.add('reviews-stats');
        renderStats(this.state.stats, statsContainer);
      }
    },

    setupLazyLoad() {
      const { reviews, container } = this.state;
      if (this.state.renderedCount >= reviews.length) return;

      const sentinel = document.createElement('div');
      sentinel.style.cssText = 'width:100%;height:1px;';
      container.parentNode.insertBefore(sentinel, container.nextSibling);

      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this.loadMore();
          if (this.state.renderedCount >= reviews.length) {
            observer.disconnect();
            sentinel.remove();
          }
        }
      }, { rootMargin: '300px' });
      observer.observe(sentinel);
      this.state.observer = observer;
    },

    loadMore() {
      const { reviews, container, renderedCount } = this.state;
      const next = reviews.slice(renderedCount, renderedCount + 6);
      const fragment = document.createElement('div');
      fragment.innerHTML = next.map((r, i) => renderCard(r, renderedCount + i)).join('');
      while (fragment.firstChild) container.appendChild(fragment.firstChild);
      this.state.renderedCount += next.length;
      this.attachLightbox();
    },

    attachLightbox() {
      const { reviews, container } = this.state;
      container.querySelectorAll('.review-image-btn, .review-image-more').forEach(el => {
        if (el._reviewBound) return;
        el._reviewBound = true;
        el.addEventListener('click', () => {
          const reviewIdx = parseInt(el.dataset.reviewIdx, 10);
          const imgIdx = parseInt(el.dataset.imgIdx, 10);
          const review = reviews[reviewIdx];
          if (!review) return;
          const images = Array.isArray(review.image_urls) ? review.image_urls : [];
          if (images.length === 0) return;
          openLightbox(images, imgIdx);
        });
      });
    }
  };

  window.ReviewsWidget = ReviewsWidget;
})();
