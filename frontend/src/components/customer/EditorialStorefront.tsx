import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Home, Info, Mail, Search, ShoppingBag } from 'lucide-react';
import type { Book, Category, LandingPageContent, SiteSettings } from '../../types';
import { Leaves, ProductCover, useBookInput, useMedia, useTurns } from './BookMechanics';
import { AnimatedHeading } from './AnimatedHeading';
import './textbook.css';

interface Props {
  books: Book[];
  categories: Category[];
  landingContent: LandingPageContent | null;
  siteSettings: SiteSettings | null;
  currentPath: string;
  onNavigate: (path: string) => void;
  onBookDetails: (book: Book) => void;
  active: boolean;
  onArrived: () => void;
  cartCount: number;
  onCart: () => void;
}
const chapters = [
  'Opening spread',
  'Featured books',
  'About the press',
  'Editorial statement',
  'New releases',
  'Reader voices',
  'Newsletter',
  'Publisher information',
];
const dock = [
  { path: '/', name: 'Home', icon: Home },
  { path: '/books', name: 'Book Store', icon: BookOpen },
  { path: '/about', name: 'About Us', icon: Info },
  { path: '/contact', name: 'Contact Us', icon: Mail },
  { path: '/search', name: 'Search', icon: Search },
  { path: '/cart', name: 'Cart', icon: ShoppingBag },
];
const money = (b: Book) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: b.currency || 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(b.selling_price);
const authors = (b: Book) => b.authors?.map((a) => a.name).join(', ');
const clamp = (n: number) => Math.min(1, Math.max(0, n));
const even = (n: number) => Math.max(2, 2 * Math.ceil(n / 2));
function PrintedBook({
  book,
  choose,
  large = false,
}: {
  book: Book;
  choose: (b: Book) => void;
  large?: boolean;
}) {
  return (
    <button
      type="button"
      className={'tb-entry' + (large ? ' large' : '')}
      onClick={(e) => {
        e.currentTarget.focus({ preventScroll: true });
        choose(book);
      }}
    >
      <ProductCover src={book.cover_image} title={book.title} />
      <span className="tb-entry-copy">
        <strong>{book.title}</strong>
        {authors(book) && <small>{authors(book)}</small>}
        <span className="tb-entry-price">
          {money(book)} <ArrowRight size={15} />
        </span>
      </span>
    </button>
  );
}
export function EditorialStorefront({
  books,
  categories,
  landingContent: content,
  siteSettings: settings,
  currentPath,
  onNavigate,
  onBookDetails,
  active,
  onArrived,
  cartCount,
  onCart,
}: Props) {
  const single = useMedia('(max-width: 820px), (max-width: 960px) and (max-height: 480px)');
  const short = useMedia('(max-height: 520px), (max-width: 820px) and (max-height: 665px)');
  const roomy = useMedia('(min-height: 850px) and (min-width: 1100px)');
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const stride = single ? 1 : 2;
  const perPage = short ? 1 : roomy ? 3 : 2;
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('featured');
  const [filter, setFilter] = useState('');
  const [query, setQuery] = useState('');
  const [newsletter, setNewsletter] = useState('');
  const [letter, setLetter] = useState({ name: '', email: '', subject: '', message: '' });
  const root = useRef<HTMLElement>(null);
  const catalogue = useMemo(() => {
    const list = books.filter(
      (b) =>
        (!category || [b.category_id, b.subcategory_id].some((id) => String(id) === category)) &&
        matches(b, filter),
    );
    if (sort === 'title') list.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'low' || sort === 'high')
      list.sort((a, b) => (a.selling_price - b.selling_price) * (sort === 'low' ? 1 : -1));
    if (sort === 'new')
      list.sort((a, b) => (b.publication_year || 0) - (a.publication_year || 0) || b.id - a.id);
    if (sort === 'featured') list.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
    return list;
  }, [books, category, filter, sort]);
  const found = useMemo(() => (query.trim() ? books.filter((b) => matches(b, query)) : []), [books, query]);
  const featured = useMemo(
    () =>
      preferred(
        content?.featured_book_ids,
        [...books].sort((a, b) => Number(b.is_featured) - Number(a.is_featured)),
      ),
    [books, content],
  );
  const releases = useMemo(
    () =>
      preferred(
        content?.latest_publications,
        [...books].sort((a, b) => (b.publication_year || 0) - (a.publication_year || 0) || b.id - a.id),
      ),
    [books, content],
  );
  const searchStart = 16 + even(Math.ceil(catalogue.length / perPage));
  const contactStart = searchStart + even(Math.ceil(found.length / perPage));
  const pathAt = (p: number) =>
    p >= contactStart
      ? '/contact'
      : p >= searchStart
        ? '/search'
        : p >= 16
          ? '/books'
          : p >= 4 && p <= 5
            ? '/about'
            : '/';
  const anchor = (path: string) =>
    path === '/about'
      ? 4
      : path === '/books'
        ? 16
        : path === '/search'
          ? searchStart
          : path === '/contact'
            ? contactStart
            : 0;
  const [intro, setIntro] = useState(reduced ? 1 : 0);
  const introRef = useRef(intro);
  const updateIntro = (v: number) => {
    introRef.current = clamp(v);
    setIntro(introRef.current);
  };
  const { at, position, turn, travel, busy, stop } = useTurns(
    reduced ? anchor(currentPath) : 0,
    stride,
    contactStart + 1,
    reduced,
  );
  const pending = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cancelIntro = () => {
    pending.current.forEach(clearTimeout);
    pending.current = [];
  };
  const stateLocation = (path: string) => {
    const saved = history.state?.publicationPage;
    if (saved?.path === path) return anchor(path) + saved.offset;
    if (path === '/')
      return location.hash === '#new-releases'
        ? 8
        : location.hash === '#editorial-statement'
          ? 6
          : location.hash === '#contact'
            ? 14
            : 0;
    return anchor(path);
  };
  const seek = (page: number, fast = true) => {
    cancelIntro();
    if (introRef.current < 1 && !reduced && fast) {
      stop();
      [0.25, 0.68, 1]
        .filter((n) => n > introRef.current)
        .forEach((n, i) => pending.current.push(setTimeout(() => updateIntro(n), i * 190)));
      pending.current.push(setTimeout(() => travel(page, true), 590));
    } else {
      updateIntro(1);
      travel(page, fast);
    }
  };
  const lastRoute = useRef(currentPath);
  const pop = useRef(false);
  useEffect(() => {
    const back = () => {
      pop.current = true;
      if (location.pathname === lastRoute.current && active) {
        seek(stateLocation(location.pathname));
        pop.current = false;
      }
    };
    window.addEventListener('popstate', back);
    return () => window.removeEventListener('popstate', back);
  });
  useEffect(() => () => cancelIntro(), []);
  useLayoutEffect(() => {
    if (!active) {
      cancelIntro();
      stop();
    }
  }, [active]);
  useLayoutEffect(() => {
    if (lastRoute.current === currentPath) return;
    const previous = lastRoute.current;
    lastRoute.current = currentPath;
    if (!active) {
      cancelIntro();
      stop();
      return;
    }
    if (
      !dock.some((d) => d.path === previous && d.path !== '/cart') &&
      !pop.current &&
      pathAt(position.current) === currentPath
    )
      return;
    pop.current = false;
    seek(stateLocation(currentPath));
  }, [currentPath, active]);
  useEffect(() => {
    if (active && (currentPath !== '/' || location.hash)) seek(stateLocation(currentPath));
  }, []);
  useEffect(() => {
    if (intro === 1 && !turn && pathAt(at) === currentPath) onArrived();
  }, [at, intro, turn, currentPath, onArrived]);
  // Remap a logical leaf when filters, catalogue size or the viewport change.
  const prior = useRef({ searchStart, contactStart, perPage, stride });
  useLayoutEffect(() => {
    const old = prior.current;
    prior.current = { searchStart, contactStart, perPage, stride };
    const p = position.current;
    let dest = p;
    if (p >= old.contactStart) dest = contactStart + p - old.contactStart;
    else if (p >= old.searchStart)
      dest = Math.min(
        contactStart - 1,
        searchStart + Math.floor(((p - old.searchStart) * old.perPage) / perPage),
      );
    else if (p >= 16) dest = Math.min(searchStart - 1, 16 + Math.floor(((p - 16) * old.perPage) / perPage));
    if (dest !== p || old.stride !== stride) travel(dest, false, true);
  }, [searchStart, contactStart, perPage, stride]);
  const jump = (path: string) => {
    if (path === '/cart') {
      onCart();
      return;
    }
    const dest = anchor(path);
    if (currentPath === path) {
      history.replaceState({ ...history.state, publicationPage: { path, offset: 0 } }, '');
      seek(dest);
    } else onNavigate(path);
  };
  // Gestures stay within the current destination. Links may cross these boundaries.
  const bounds = (page: number) => {
    if (page < 16) return [0, 15];
    if (page < searchStart) return [16, searchStart - 1];
    if (page < contactStart) return [searchStart, contactStart - 1];
    return [contactStart, contactStart + 1];
  };
  const [firstPage, lastPage] = bounds(at);
  const step = (dir: number) => {
    cancelIntro();
    if (introRef.current < 1 || (position.current === 0 && dir < 0)) {
      if (reduced) updateIntro(1);
      else updateIntro(introRef.current + dir * 0.25);
      return;
    }
    const target = position.current + dir * stride;
    const [first, last] = bounds(position.current);
    if (target < first || target > last || !travel(target)) return;
    const path = pathAt(target);
    if (path !== currentPath) {
      lastRoute.current = path;
      onNavigate(path);
    }
    history.replaceState({ ...history.state, publicationPage: { path, offset: target - anchor(path) } }, '');
  };
  useBookInput(root, active, step, (delta) => {
    if (reduced || busy.current || (introRef.current === 1 && (position.current !== 0 || delta >= 0)))
      return false;
    cancelIntro();
    updateIntro(introRef.current + Math.max(-240, Math.min(240, delta)) / 800);
    return true;
  });
  const changeList = (path: string, change: () => void) => {
    change();
    travel(anchor(path), false, true);
    history.replaceState({ ...history.state, publicationPage: { path, offset: 0 } }, '');
  };
  const email = content?.contact_email || settings?.contact_email;
  const phone = content?.contact_phone || settings?.phone;
  const address = content?.contact_address || settings?.address;
  const brand = settings?.company_name || 'Dotcom Publications';
  const logo = settings?.logo_url || '/logo.jpg';
  const action = (label: string, path: string) => (
    <button className="tb-link" onClick={() => jump(path)}>
      {label}
      <ArrowRight size={17} />
    </button>
  );
  const contact = (
    <address>
      {address && <p>{address}</p>}
      {email && <a href={'mailto:' + email}>{email}</a>}
      {phone && <a href={'tel:' + phone.replace(/[^+\d]/g, '')}>{phone}</a>}
    </address>
  );
  const rows = (items: Book[], large = false) => (
    <div className="tb-entries">
      {items.map((b) => (
        <PrintedBook key={b.id} book={b} choose={onBookDetails} large={large} />
      ))}
    </div>
  );
  const header = (text: string) => <h2>{text}</h2>;
  const heroImage = content?.hero_image || '/reading-room/library.jpg';
  const image = (url: string, alt: string, caption: string) => (
    <figure className="tb-figure">
      <img
        src={url}
        alt={alt}
        draggable={false}
        onError={(e) => {
          if (!e.currentTarget.src.endsWith('/reading-room/library.jpg'))
            e.currentTarget.src = '/reading-room/library.jpg';
        }}
      />
      <figcaption>{caption}</figcaption>
    </figure>
  );
  const homeLeaf = (p: number): ReactNode => {
    switch (p) {
      case 0:
        return image(heroImage, 'Shelves in a sunlit academic library', 'The reading room');
      case 1:
        return (
          <div className="tb-prose tb-hero">
            <AnimatedHeading as="h1" text={content?.hero_heading || 'Books for teaching and research'} />
            <p>
              {content?.hero_description ||
                'Academic textbooks, research monographs and educational resources.'}
            </p>
            {action('Browse academic books', '/books')}
          </div>
        );
      case 2:
      case 3:
        return (
          <>
            {header(p === 2 ? 'Featured books' : 'In the collection')}
            {rows(featured.slice((p - 2) * perPage, (p - 1) * perPage))}
            {p === 3 && action('View all books', '/books')}
          </>
        );
      case 4:
        return (
          <>
            {image('/reading-room/study.jpg', 'A reading space lined with books', 'Inside the reading room')}
            {!!content?.about_stats?.length && (
              <dl className="tb-highlights">
                {content.about_stats.slice(0, 2).map((stat) => (
                  <div key={stat.label}>
                    <dt>{stat.label}</dt>
                    <dd>{stat.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </>
        );
      case 5:
        return (
          <div className="tb-prose">
            {header(content?.about_title || 'About the publishing house')}
            <p className="tb-drop">
              {content?.about_description ||
                'Dotcom Publications brings together academic textbooks, research monographs and educational works for readers, scholars and institutions.'}
            </p>
            {action('Contact the press', '/contact')}
          </div>
        );
      case 6:
        return (
          <div className="tb-prose tb-statement">{header('Made for the work of teaching and research')}</div>
        );
      case 7:
        return (
          <div className="tb-prose">
            {header('How we publish')}
            <p>
              Our catalogue brings faculty research into the classroom through considered textbooks,
              specialist monographs and learning resources.
            </p>
            {action('Explore the catalogue', '/books')}
          </div>
        );
      case 8:
      case 9:
        return (
          <>
            {header(p === 8 ? 'New releases' : 'Recently published')}
            {rows(releases.slice(p - 8, p - 7), true)}
            {p === 9 && action('Browse recent titles', '/books')}
          </>
        );
      case 10:
        return (
          <div className="tb-prose">
            {header('Reader voices')}
            <p>No reader testimonials have been published yet.</p>
          </div>
        );
      case 11:
        return (
          <div className="tb-prose">
            {header('For classrooms and libraries')}
            <p>
              Find course texts, research monographs and educational works selected for students, faculty and
              institutional collections.
            </p>
            {action('Find books by subject', '/books')}
          </div>
        );
      case 12:
        return (
          <div className="tb-news-art" aria-label="An illustration of stacked printed pages" role="img">
            {[0, 1, 2, 3, 4].map((i) => (
              <i key={i} style={{ '--i': i } as CSSProperties} />
            ))}
          </div>
        );
      case 13:
        return (
          <div className="tb-prose">
            {header('Newsletter')}
            <p>Request updates on course texts and research titles by email.</p>
            <form
              className="tb-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (email)
                  location.href =
                    'mailto:' +
                    email +
                    '?subject=Newsletter%20request&body=' +
                    encodeURIComponent('Please send publication updates to ' + newsletter + '.');
              }}
            >
              <label>
                Email address
                <input
                  type="email"
                  required
                  value={newsletter}
                  onChange={(e) => setNewsletter(e.target.value)}
                />
              </label>
              <button className="tb-button" disabled={!email}>
                Prepare email request <ArrowRight size={15} />
              </button>
              <small>
                {email
                  ? 'Opens your email app so you can send the request.'
                  : 'Newsletter requests are currently unavailable.'}
              </small>
            </form>
          </div>
        );
      case 14:
        return (
          <div className="tb-prose">
            <img className="tb-logo" src={logo} alt="" />
            {header(brand)}
            {contact}
          </div>
        );
      default:
        return (
          <div className="tb-prose">
            {header('Directory')}
            <div className="tb-directory">
              {dock.slice(1, 5).map((d) => (
                <a
                  key={d.path}
                  href={d.path}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    e.preventDefault();
                    jump(d.path);
                  }}
                >
                  {d.name}
                  <ArrowRight size={16} />
                </a>
              ))}
              {settings?.catalogue_download_url && (
                <a href={settings.catalogue_download_url}>Download catalogue</a>
              )}
              <div className="tb-socials">
                {Object.entries(settings?.social_links || {})
                  .filter(([, url]) => url && /^https?:\/\//i.test(url))
                  .map(([name, url]) => (
                    <a key={name} href={url}>
                      {name}
                    </a>
                  ))}
              </div>
            </div>
            <small>{content?.footer_text || '© ' + new Date().getFullYear() + ' ' + brand}</small>
          </div>
        );
    }
  };
  const listLeaf = (p: number, search: boolean) => {
    const n = p - (search ? searchStart : 16),
      list = search ? found : catalogue,
      first = n === 0;
    return (
      <div className="tb-list-page">
        {header(
          first ? (search ? 'Search the catalogue' : 'Book Store') : search ? 'Search results' : 'Catalogue',
        )}
        {first && (
          <div className="tb-filters">
            <label className="tb-query">
              <Search size={16} />
              <input
                type="search"
                aria-label={search ? 'Search titles, authors, ISBN or subject' : 'Filter catalogue'}
                placeholder="Title, author, ISBN or subject"
                value={search ? query : filter}
                onChange={(e) =>
                  changeList(search ? '/search' : '/books', () =>
                    search ? setQuery(e.target.value) : setFilter(e.target.value),
                  )
                }
              />
            </label>
            {!search && (
              <div className="tb-selects">
                <select
                  aria-label="Subject"
                  value={category}
                  onChange={(e) => changeList('/books', () => setCategory(e.target.value))}
                >
                  <option value="">All subjects</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Sort books"
                  value={sort}
                  onChange={(e) => changeList('/books', () => setSort(e.target.value))}
                >
                  <option value="featured">Recommended</option>
                  <option value="new">Newest</option>
                  <option value="title">Title A–Z</option>
                  <option value="low">Price ↑</option>
                  <option value="high">Price ↓</option>
                </select>
              </div>
            )}
          </div>
        )}
        {list.length > 0 ? (
          <>
            <small className="tb-count">
              {n * perPage < list.length
                ? `Titles ${n * perPage + 1}–${Math.min(list.length, (n + 1) * perPage)} of ${list.length}`
                : 'End of results'}
            </small>
            {rows(list.slice(n * perPage, (n + 1) * perPage))}
          </>
        ) : (
          <p>
            {search && !query.trim()
              ? 'Enter a title, author, ISBN or subject.'
              : 'No matching titles. Try another search or subject.'}
          </p>
        )}
      </div>
    );
  };
  const render = (p: number) => {
    const name =
      p < 16
        ? chapters[Math.floor(p / 2)]
        : p < searchStart
          ? 'Book Store'
          : p < contactStart
            ? 'Catalogue search'
            : 'Contact the press';
    const body =
      p < 16 ? (
        homeLeaf(p)
      ) : p < contactStart ? (
        listLeaf(p, p >= searchStart)
      ) : p === contactStart ? (
        <div className="tb-prose">
          {header('Contact the press')}
          {contact}
        </div>
      ) : (
        <form
          className="tb-form tb-contact"
          onSubmit={(e) => {
            e.preventDefault();
            if (email)
              location.href =
                'mailto:' +
                email +
                '?subject=' +
                encodeURIComponent(letter.subject) +
                '&body=' +
                encodeURIComponent(letter.message + '\n\n' + letter.name + '\n' + letter.email);
          }}
        >
          {header('Write to us')}
          {(['name', 'email', 'subject'] as const).map((k) => (
            <label key={k}>
              {k === 'name' ? 'Full name' : k === 'email' ? 'Email address' : 'Subject'}
              <input
                required
                type={k === 'email' ? 'email' : 'text'}
                value={letter[k]}
                onChange={(e) => setLetter({ ...letter, [k]: e.target.value })}
              />
            </label>
          ))}
          <label>
            Message
            <textarea
              required
              rows={3}
              value={letter.message}
              onChange={(e) => setLetter({ ...letter, message: e.target.value })}
            />
          </label>
          <button className="tb-button" disabled={!email}>
            Prepare email <ArrowRight size={15} />
          </button>
          <small>
            {email ? 'Send your message from your email app.' : 'A contact email is currently unavailable.'}
          </small>
        </form>
      );
    return (
      <article className={'tb-page ' + (p === 0 || p === 4 ? 'photo' : '')}>
        <header>{p === 1 ? 'Independent academic publishing' : p % 2 === 0 ? brand : name}</header>
        <div className="tb-body">{body}</div>
        <footer>
          <span>{name}</span>
          <b>{String(p + 1).padStart(2, '0')}</b>
        </footer>
      </article>
    );
  };
  const opening = clamp((intro - 0.22) / 0.42),
    zoom = clamp((intro - 0.7) / 0.3),
    approach = clamp(intro / 0.22);
  const scale = (single ? 0.67 : 0.55) + approach * 0.07 + zoom * (single ? 0.26 : 0.38);
  const css = {
    '--expand': zoom,
    '--cover-tilt': -2.2 * (1 - opening) + 'deg',
    '--open': opening,
    '--angle': -179 * opening + 'deg',
    '--book-scale': scale,
    '--shift': single ? '0%' : -25 * (1 - opening) + '%',
    '--left-depth': 2 + (4 * at) / (contactStart + 1) + 'px',
    '--right-depth': 6 - (4 * at) / (contactStart + 1) + 'px',
  } as CSSProperties;
  return (
    <main className="tb-world" ref={root} inert={!active} style={css} aria-label="Publisher's textbook">
      <div className="tb-stage">
        <div className={'tb-volume' + (single ? ' single' : '') + (opening >= 1 ? ' open' : '')}>
          <div className="tb-boards" aria-hidden="true" />
          <div
            className="tb-paper"
            aria-busy={!!turn}
            inert={intro < 0.65 || !!turn}
            aria-hidden={intro < 0.65}
          >
            <Leaves at={at} single={single} turn={turn} render={render} />
          </div>
          <div
            className="tb-hardcover"
            inert={opening >= 1}
            aria-hidden={opening >= 1}
            role="button"
            aria-label="Open Dotcom Publications"
            tabIndex={0}
            onClick={() => seek(0)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                seek(0);
              }
            }}
          >
            <div className="tb-jacket">
              <img src={logo} alt="Dotcom Publications logo" />
              <strong>
                Dotcom
                <br />
                Publications
              </strong>
              <div className="tb-jacket-art" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className="tb-endpaper" />
          </div>
        </div>
      </div>
      <div className="tb-controls">
        <button
          aria-label="Previous page"
          disabled={intro === 0 || (intro === 1 && at === firstPage && (firstPage > 0 || reduced))}
          onClick={() => step(-1)}
        >
          <ArrowLeft size={18} />
        </button>
        <span aria-live="polite">
          {intro < 1 ? 'Scroll to open' : single ? `Page ${at + 1}` : `Pages ${at + 1}–${at + 2}`}
        </span>
        <button
          aria-label={intro < 1 ? 'Open the book' : 'Next page'}
          disabled={intro === 1 && at + stride > lastPage}
          onClick={() => (intro < 1 ? seek(0) : step(1))}
        >
          <ArrowRight size={18} />
        </button>
      </div>
      <nav className="tb-dock" aria-label="Book navigation">
        {dock.map((d) => (
          <button
            key={d.path}
            aria-current={pathAt(at) === d.path ? 'page' : undefined}
            onClick={(e) => {
              e.currentTarget.focus({ preventScroll: true });
              jump(d.path);
            }}
          >
            <d.icon size={18} />
            <span>{d.name}</span>
            {d.path === '/cart' && cartCount > 0 && <b>{cartCount}</b>}
          </button>
        ))}
      </nav>
    </main>
  );
}
function matches(book: Book, query: string) {
  const term = query.trim().toLowerCase();
  return (
    !term ||
    [book.title, book.subtitle, book.isbn, book.subject, book.category_name, authors(book)].some((v) =>
      v?.toLowerCase().includes(term),
    ) ||
    (!!book.isbn &&
      /^[\dXx\s-]+$/.test(term) &&
      book.isbn.replace(/[-\s]/g, '').includes(term.replace(/[-\s]/g, '')))
  );
}
function preferred(ids: number[] | undefined, list: Book[]) {
  const lookup = new Map(list.map((b) => [b.id, b]));
  return Array.from(new Set([...(ids || []), ...lookup.keys()]))
    .map((id) => lookup.get(id))
    .filter((b): b is Book => !!b);
}
