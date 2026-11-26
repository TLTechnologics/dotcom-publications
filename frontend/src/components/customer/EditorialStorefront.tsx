import React, { useMemo, useState } from 'react';
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
  const heroHeading = landingContent?.hero_heading || 'Ideas that move knowledge forward';

  const cardGrid = (items: Book[]) => items.length ? (
    <div className="bookshop-grid">{items.map((book) => <BookCard key={book.id} book={book} onOpen={() => onOpenBook(book)} onAdd={() => onAddToCart(book)} />)}</div>
  ) : <p className="bookshop-empty">New titles will appear here as they are added to the catalogue.</p>;

  return <div className="storefront editorial-storefront">
    {!isBookstore ? <>
      <section className="editorial-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(20,30,22,.66), rgba(20,30,22,.12)), url("${landingContent?.hero_image || HERO_PHOTO}")` }}>
        <div className="editorial-hero-content">
          <p className="editorial-kicker">Dotcom Publications · Independent academic publishing</p>
          <h1>{heroHeading}</h1>
          <p className="editorial-hero-description">{landingContent?.hero_description || 'Thoughtful books for curious minds, classrooms and the work of discovery.'}</p>
          <button className="editorial-button editorial-button-light" onClick={() => onNavigate('/books')}>Explore the bookstore <ArrowRight size={16} /></button>
        </div>
        <span className="photo-credit">Library photograph by Fer Troulik · Unsplash</span>
      </section>

      <section className="editorial-section" id="featured-books">
        <div className="editorial-section-heading"><div><p className="editorial-kicker editorial-kicker-dark">Selected for you</p><h2>Featured books</h2></div><button className="editorial-text-link" onClick={() => onNavigate('/books')}>Explore all books <ArrowRight size={16} /></button></div>
        {cardGrid(featured)}
      </section>

      <section className="editorial-about" id="about">
        <div className="editorial-about-image"><img src={READING_ROOM_PHOTO} alt="Books displayed on a library shelf" loading="lazy" /><span className="photo-credit">Library photograph · Unsplash</span></div>
        <div className="editorial-about-copy"><p className="editorial-kicker editorial-kicker-dark">The publishing house</p><h2>{landingContent?.about_title || 'Books made for a life of learning'}</h2><p>{aboutCopy}</p><button className="editorial-button editorial-button-green" onClick={() => document.getElementById('editorial-statement')?.scrollIntoView({ behavior: 'smooth' })}>Our approach <ArrowRight size={16} /></button></div>
      </section>

      <section id="editorial-statement" className="editorial-statement"><p className="editorial-kicker editorial-kicker-dark">A note on publishing</p><p className="editorial-quote">“A good book makes room for <em>the next question.</em>”</p><span className="editorial-rule" /></section>

      <section className="editorial-section editorial-releases" id="new-releases">
        <div className="editorial-section-heading"><div><p className="editorial-kicker editorial-kicker-dark">Recently published</p><h2>New releases</h2></div><button className="editorial-text-link" onClick={() => onNavigate('/books')}>Browse the catalogue <ArrowRight size={16} /></button></div>
        {cardGrid(latest)}
      </section>

      <section className="editorial-testimonials"><p className="editorial-kicker editorial-kicker-dark">From our readers</p><h2>Words from the community</h2><p>Reader recommendations will be shared here once verified feedback is available.</p></section>

      <section className="editorial-newsletter"><p className="editorial-kicker">Notes from the press</p><h2>Stay close to new ideas.</h2><p>We’re preparing a newsletter for new titles and publishing news.</p><button className="editorial-button editorial-button-light" disabled title="Newsletter sign-up will be enabled when a subscription service is connected">Newsletter sign-up coming soon</button></section>
    </> : <section className="bookstore-page">
      <p className="editorial-kicker editorial-kicker-dark">Dotcom Publications</p><h1>Bookstore</h1><p className="bookstore-intro">Explore our academic books, research monographs and learning resources.</p>
      <div className="bookstore-controls"><label className="bookstore-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search books or authors" aria-label="Search books or authors" /></label>
        <label className="bookstore-filter"><span>Subject</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All subjects</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="bookstore-filter"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Recommended</option><option value="newest">Newest</option><option value="title">Title A–Z</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
      </div>
      <div className="bookstore-result-count">{results.length} {results.length === 1 ? 'book' : 'books'}</div>
      {results.length ? <div className="bookshop-grid">{results.map((book) => <BookCard key={book.id} book={book} onOpen={() => onOpenBook(book)} onAdd={() => onAddToCart(book)} />)}</div> : <p className="bookshop-empty">No books match these filters. Try another search or subject.</p>}
    </section>}

    <footer className="editorial-footer" id="contact"><div className="editorial-footer-brand"><a href="/" onClick={(event) => { event.preventDefault(); onNavigate('/'); }}>Dotcom Publications</a><p>{siteSettings?.description || 'Academic publishing for a curious world.'}</p></div><div><h3>Explore</h3><a href="/books" onClick={(event) => { event.preventDefault(); onNavigate('/books'); }}>Bookstore</a><a href="/#about" onClick={(event) => { event.preventDefault(); onNavigate('/#about'); }}>About the press</a></div><div><h3>Contact</h3><p>{landingContent?.contact_email || siteSettings?.contact_email || 'Contact the publishing team'}</p><p>{landingContent?.contact_phone || siteSettings?.phone || ''}</p><p>{landingContent?.contact_address || ''}</p></div><div className="editorial-copyright">© {new Date().getFullYear()} Dotcom Publications. {landingContent?.footer_text || 'All rights reserved.'}</div></footer>
  </div>;
};
