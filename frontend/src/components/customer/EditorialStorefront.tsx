import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Search, ShoppingBag } from 'lucide-react';
import { Book, Category, LandingPageContent, SiteSettings } from '../../types';

const HERO_PHOTO = 'https://images.unsplash.com/photo-1760166699654-5d0e10f51994?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=82&w=2400';
const READING_ROOM_PHOTO = 'https://images.unsplash.com/photo-1789052085265-cee095d15979?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=82&w=1400';

interface Props {
  books: Book[];
  categories: Category[];
  landingContent: LandingPageContent | null;
  siteSettings: SiteSettings | null;
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenBook: (book: Book) => void;
  onBookDetails: (book: Book) => void;
  onAddToCart: (book: Book) => void;
}

const BookCard: React.FC<{ book: Book; onOpen: () => void; onDetails: () => void; onAdd: () => void }> = ({ book, onOpen, onDetails, onAdd }) => (
  <article className="bookshop-card group">
    <button type="button" className="bookshop-cover" onClick={onOpen} aria-label={`View ${book.title}`}>
      <img src={book.cover_image || '/covers/computational-mathematics.webp'} alt={`Cover of ${book.title}`} loading="lazy" />
    </button>
    <div className="bookshop-card-copy">
      <p className="bookshop-author">{book.authors?.map((a) => a.name).join(', ') || 'Dotcom Publications'}</p>
      <button type="button" onClick={onOpen} className="bookshop-title">{book.title}</button>
      <button type="button" onClick={onDetails} className="bookshop-details">Book details <ArrowRight size={13} /></button>
      <div className="bookshop-card-bottom">
        <span className="bookshop-price">₹{book.selling_price.toLocaleString('en-IN')}</span>
        <button type="button" onClick={onAdd} className="bookshop-add" aria-label={`Add ${book.title} to cart`}>
          <ShoppingBag size={16} />
        </button>
      </div>
    </div>
  </article>
);

export const EditorialStorefront: React.FC<Props> = ({
  books, categories, landingContent, siteSettings, currentPath, onNavigate, onOpenBook, onBookDetails, onAddToCart,
}) => {
  const isBookstore = currentPath === '/books';
  const isAboutPage = currentPath === '/about';
  const isContactPage = currentPath === '/contact';
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const published = useMemo(() => books.filter((book) => !book.is_draft), [books]);
  const featured = useMemo(() => {
    const ids = landingContent?.featured_book_ids || [];
    const preferred = ids.map((id) => published.find((book) => book.id === id)).filter(Boolean) as Book[];
    return [...preferred, ...published.filter((book) => book.is_featured && !preferred.some((p) => p.id === book.id))].slice(0, 4);
  }, [landingContent, published]);
  const latest = useMemo(() => {
    const ids = landingContent?.latest_publications || [];
    const preferred = ids.map((id) => published.find((book) => book.id === id)).filter(Boolean) as Book[];
    const remainder = [...published].sort((a, b) => (b.publication_year || 0) - (a.publication_year || 0) || b.id - a.id);
    const combined = [...preferred, ...remainder.filter((book) => !preferred.some((p) => p.id === book.id))];
    const featuredIds = new Set(featured.map((book) => book.id));
    return combined.filter((book) => !featuredIds.has(book.id)).slice(0, 4);
  }, [featured, landingContent, published]);
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matching = published.filter((book) => {
      const categoryMatch = category === 'all' || String(book.category_id || '') === category || String(book.subcategory_id || '') === category;
      const searchMatch = !normalized || [book.title, book.subject || '', ...(book.authors || []).map((author) => author.name)].join(' ').toLowerCase().includes(normalized);
      return categoryMatch && searchMatch;
    });
    if (sort === 'title') matching.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'price-low') matching.sort((a, b) => a.selling_price - b.selling_price);
    if (sort === 'price-high') matching.sort((a, b) => b.selling_price - a.selling_price);
    if (sort === 'newest') matching.sort((a, b) => (b.publication_year || 0) - (a.publication_year || 0) || b.id - a.id);
    return matching;
  }, [category, published, query, sort]);
  const aboutCopy = landingContent?.about_description || 'Dotcom Publications brings together academic textbooks, research monographs and educational works for readers, scholars and institutions.';
  const heroHeading = landingContent?.hero_heading || 'Books for teaching and research';
  const heroImage = landingContent?.hero_image || HERO_PHOTO;

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.editorial-reveal'));
    if (!elements.length) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    let previousScrollY = window.scrollY;
    const observer = new IntersectionObserver((entries) => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY < previousScrollY ? 'up' : 'down';
      previousScrollY = currentScrollY;

      entries.forEach((entry) => {
        const element = entry.target as HTMLElement;
        element.style.setProperty('--reveal-offset', direction === 'up' ? '-40px' : '40px');
        element.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { threshold: 0.18, rootMargin: '-48px 0px -48px 0px' });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [isBookstore, books.length]);

  const cardGrid = (items: Book[]) => items.length ? (
    <div className="bookshop-grid">{items.map((book) => <BookCard key={book.id} book={book} onOpen={() => onOpenBook(book)} onDetails={() => onBookDetails(book)} onAdd={() => onAddToCart(book)} />)}</div>
  ) : <p className="bookshop-empty">New titles will appear here as they are added to the catalogue.</p>;

  return <div className="storefront editorial-storefront">
    {isAboutPage ? <main className="editorial-info-page">
      <section className="editorial-info-hero">
        <p className="editorial-kicker editorial-kicker-dark">About the press</p>
        <h1>{landingContent?.about_title || 'Books made for a life of learning'}</h1>
        <p>{aboutCopy}</p>
      </section>
      <section className="editorial-info-section">
        <div className="editorial-info-image"><img src={READING_ROOM_PHOTO} alt="A quiet reading room lined with books" loading="lazy" /></div>
        <div className="editorial-info-copy">
          <p className="editorial-kicker editorial-kicker-dark">Our purpose</p>
          <h2>Publishing for classrooms, libraries and research</h2>
          <p>We work with educators and scholars to make rigorous ideas useful to the people who teach, study and build on them. Our catalogue brings textbooks, specialist monographs and learning resources together under one academic publishing house.</p>
          <button className="editorial-button editorial-button-green" onClick={() => onNavigate('/books')}>Explore the catalogue <ArrowRight size={16} /></button>
        </div>
      </section>
      <section className="editorial-info-principle">
        <p className="editorial-kicker editorial-kicker-dark">How we publish</p>
        <h2>Careful editorial work, lasting reference</h2>
        <p>Each title is shaped around its subject and readers, with attention to clear teaching, sound research and dependable use in academic settings.</p>
      </section>
    </main> : isContactPage ? <main className="editorial-info-page editorial-contact-page">
      <section className="editorial-info-hero">
        <p className="editorial-kicker editorial-kicker-dark">Contact</p>
        <h1>Talk with our publishing team</h1>
        <p>For course adoption, institutional orders, author enquiries or help finding a title, reach us using the details below.</p>
      </section>
      <section className="editorial-contact-details">
        <article><span>Email</span><h2>{landingContent?.contact_email || siteSettings?.contact_email || 'editor@dotcompublications.com'}</h2><a href={`mailto:${landingContent?.contact_email || siteSettings?.contact_email || 'editor@dotcompublications.com'}`}>Write to the team <ArrowRight size={15} /></a></article>
        <article><span>Telephone</span><h2>{landingContent?.contact_phone || siteSettings?.phone || '+91 11 4567 8900'}</h2><a href={`tel:${(landingContent?.contact_phone || siteSettings?.phone || '+91 11 4567 8900').replace(/[^+\d]/g, '')}`}>Call the office <ArrowRight size={15} /></a></article>
        <article><span>Office</span><h2>{landingContent?.contact_address || 'Knowledge Park III, Institutional Area, Greater Noida, Delhi NCR, India'}</h2><p>Academic and institutional publishing enquiries are welcome.</p></article>
      </section>
      <section className="editorial-info-principle">
        <h2>Looking for a course text?</h2><p>Browse the catalogue by title, author or subject.</p>
        <button className="editorial-button editorial-button-green" onClick={() => onNavigate('/books')}>Visit the bookstore <ArrowRight size={16} /></button>
      </section>
    </main> : !isBookstore ? <>
      <section className="editorial-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(37, 24, 28, .78) 0%, rgba(37, 24, 28, .56) 48%, rgba(37, 24, 28, .18) 100%), url("${heroImage}")` }}>
        <div className="editorial-hero-content">
          <p className="editorial-kicker">Independent academic publishing</p>
          <h1>{heroHeading}</h1>
          <p className="editorial-hero-description">{landingContent?.hero_description || 'Peer-reviewed textbooks and research monographs for students, faculty and institutional libraries.'}</p>
          <button className="editorial-button editorial-button-green" onClick={() => onNavigate('/books')}>Browse academic books <ArrowRight size={16} /></button>
        </div>
        <span className="photo-credit">Library photograph · Unsplash</span>
      </section>

      <section className="editorial-section editorial-reveal" id="featured-books">
        <div className="editorial-section-heading"><h2>Featured books</h2><button className="editorial-text-link" onClick={() => onNavigate('/books')}>View all titles <ArrowRight size={16} /></button></div>
        {cardGrid(featured)}
      </section>

      <section className="editorial-about editorial-reveal" id="about">
        <div className="editorial-about-image"><img src={READING_ROOM_PHOTO} alt="Books displayed on a library shelf" loading="lazy" /><span className="photo-credit">Library photograph · Unsplash</span></div>
        <div className="editorial-about-copy"><h2>{landingContent?.about_title || 'Books made for a life of learning'}</h2><p>{aboutCopy}</p><button className="editorial-button editorial-button-green" onClick={() => document.getElementById('editorial-statement')?.scrollIntoView({ behavior: 'smooth' })}>How we publish <ArrowRight size={16} /></button></div>
      </section>

      <section id="editorial-statement" className="editorial-statement editorial-reveal">
        <h2>Made for the work of teaching and research</h2>
        <p>Our catalogue brings faculty research into the classroom through considered textbooks, specialist monographs and learning resources.</p>
      </section>

      <section className="editorial-section editorial-releases editorial-reveal" id="new-releases">
        <div className="editorial-section-heading"><h2>New releases</h2><button className="editorial-text-link" onClick={() => onNavigate('/books')}>Browse recent titles <ArrowRight size={16} /></button></div>
        {cardGrid(latest)}
      </section>

      <section className="editorial-testimonials editorial-reveal"><h2>For classrooms and libraries</h2><p>Find course texts, research monographs and educational works selected for students, faculty and institutional collections.</p><button className="editorial-text-link" onClick={() => onNavigate('/books')}>Find books by subject <ArrowRight size={16} /></button></section>

      <section className="editorial-newsletter editorial-reveal"><div><h2>Course texts and research titles</h2><p>Browse the catalogue by subject, author or title.</p></div><button className="editorial-button editorial-button-light" onClick={() => onNavigate('/books')}>Browse the catalogue <ArrowRight size={16} /></button></section>
    </> : <section className="bookstore-page">
      <p className="editorial-kicker editorial-kicker-dark">Dotcom Publications</p><h1>Bookstore</h1><p className="bookstore-intro">Explore our academic books, research monographs and learning resources.</p>
      <div className="bookstore-controls"><label className="bookstore-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search books or authors" aria-label="Search books or authors" /></label>
        <label className="bookstore-filter"><span>Subject</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All subjects</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="bookstore-filter"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Recommended</option><option value="newest">Newest</option><option value="title">Title A–Z</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
      </div>
      <div className="bookstore-result-count">Showing {results.length} {results.length === 1 ? 'book' : 'books'}</div>
      {results.length ? <div className="bookshop-grid">{results.map((book) => <BookCard key={book.id} book={book} onOpen={() => onOpenBook(book)} onDetails={() => onBookDetails(book)} onAdd={() => onAddToCart(book)} />)}</div> : <p className="bookshop-empty">No books match these filters. Try another search or subject.</p>}
    </section>}

    <footer className="editorial-footer" id="contact"><div className="editorial-footer-brand"><a href="/" onClick={(event) => { event.preventDefault(); onNavigate('/'); }}>Dotcom Publications</a><p>{siteSettings?.description || 'Academic publishing for a curious world.'}</p></div><div><h3>Explore</h3><a href="/books" onClick={(event) => { event.preventDefault(); onNavigate('/books'); }}>Bookstore</a><a href="/about" onClick={(event) => { event.preventDefault(); onNavigate('/about'); }}>About us</a></div><div><h3>Contact</h3><a href="/contact" onClick={(event) => { event.preventDefault(); onNavigate('/contact'); }}>Contact the publishing team</a><p>{landingContent?.contact_phone || siteSettings?.phone || ''}</p></div><div className="editorial-copyright">© {new Date().getFullYear()} Dotcom Publications. {landingContent?.footer_text || 'All rights reserved.'}</div></footer>
  </div>;
};
