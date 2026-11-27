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
  onAddToCart: (book: Book) => void;
}

const BookCard: React.FC<{ book: Book; onOpen: () => void; onAdd: () => void }> = ({ book, onOpen, onAdd }) => (
  <article className="bookshop-card group">
    <button type="button" className="bookshop-cover" onClick={onOpen} aria-label={`View ${book.title}`}>
      <img src={book.cover_image || '/covers/computational-mathematics.webp'} alt={`Cover of ${book.title}`} loading="lazy" />
    </button>
    <div className="bookshop-card-copy">
      <p className="bookshop-author">{book.authors?.map((a) => a.name).join(', ') || 'Dotcom Publications'}</p>
      <button type="button" onClick={onOpen} className="bookshop-title">{book.title}</button>
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
  books, categories, landingContent, siteSettings, currentPath, onNavigate, onOpenBook, onAddToCart,
}) => {
  const isBookstore = currentPath === '/books';
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

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [isBookstore, books.length]);

  const cardGrid = (items: Book[]) => items.length ? (
    <div className="bookshop-grid">{items.map((book) => <BookCard key={book.id} book={book} onOpen={() => onOpenBook(book)} onAdd={() => onAddToCart(book)} />)}</div>
  ) : <p className="bookshop-empty">New titles will appear here as they are added to the catalogue.</p>;

  return <div className="storefront editorial-storefront">
    {!isBookstore ? <>
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
      {results.length ? <div className="bookshop-grid">{results.map((book) => <BookCard key={book.id} book={book} onOpen={() => onOpenBook(book)} onAdd={() => onAddToCart(book)} />)}</div> : <p className="bookshop-empty">No books match these filters. Try another search or subject.</p>}
    </section>}

    <footer className="editorial-footer" id="contact"><div className="editorial-footer-brand"><a href="/" onClick={(event) => { event.preventDefault(); onNavigate('/'); }}>Dotcom Publications</a><p>{siteSettings?.description || 'Academic publishing for a curious world.'}</p></div><div><h3>Explore</h3><a href="/books" onClick={(event) => { event.preventDefault(); onNavigate('/books'); }}>Bookstore</a><a href="/#about" onClick={(event) => { event.preventDefault(); onNavigate('/#about'); }}>About the press</a></div><div><h3>Contact</h3><p>{landingContent?.contact_email || siteSettings?.contact_email || 'Contact the publishing team'}</p><p>{landingContent?.contact_phone || siteSettings?.phone || ''}</p><p>{landingContent?.contact_address || ''}</p></div><div className="editorial-copyright">© {new Date().getFullYear()} Dotcom Publications. {landingContent?.footer_text || 'All rights reserved.'}</div></footer>
  </div>;
};
