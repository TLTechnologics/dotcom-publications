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
  ['hero', 'Opening spread'],
  ['featured', 'Featured books'],
  ['about', 'About the press'],
  ['releases', 'New releases'],
  ['voices', 'Reader voices'],
  ['contact', 'Contact the press'],
  ['footer', 'Publisher information'],
] as const;
type Chapter = (typeof chapters)[number][0];
const firstLeaf = (id: Chapter) => chapters.findIndex(([key]) => key === id) * 2;
const catalogueStart = chapters.length * 2;
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
  const focusSearch = useRef(false);
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
  const pageCount = catalogueStart + Math.max(1, Math.ceil(catalogue.length / perPage));
  const folio = (p: number) => (p >= catalogueStart ? p - catalogueStart + 1 : p + 1);
  const pathAt = (p: number) => {
    if (p >= catalogueStart) return '/books';
    const chapter = chapters[Math.floor(p / 2)][0];
    return chapter === 'contact' || chapter === 'about' ? '/' + chapter : '/';
  };
  const anchor = (path: string) =>
    path === '/books' || path === '/search'
      ? catalogueStart
      : path === '/contact'
        ? firstLeaf('contact')
        : path === '/about'
          ? firstLeaf('about')
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
    pageCount - 1,
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
    if (path === '/' && location.hash === '#new-releases') return firstLeaf('releases');
    if (path === '/' && location.hash === '#contact') return firstLeaf('contact');
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
  const prior = useRef({ perPage, stride });
  useLayoutEffect(() => {
    const old = prior.current;
    prior.current = { perPage, stride };
    const p = position.current;
    const dest =
      p < catalogueStart
        ? p
        : Math.min(
            pageCount - 1,
            catalogueStart + Math.floor(((p - catalogueStart) * old.perPage) / perPage),
          );
    if (dest !== p || old.stride !== stride) travel(dest, false, true);
  }, [pageCount, perPage, stride]);
  const focusCatalogueInput = () => {
    const input = root.current?.querySelector<HTMLInputElement>('.tb-leaf input[type=search]');
    if (input && active && intro === 1 && !turn && at === catalogueStart) {
      input.focus({ preventScroll: true });
      focusSearch.current = false;
    }
  };
  useEffect(() => {
    if (focusSearch.current && currentPath === '/books') focusCatalogueInput();
  });
  useEffect(() => {
    if (currentPath === '/search') {
      focusSearch.current = true;
      history.replaceState({}, '', '/books');
      onNavigate('/books');
    }
  }, [currentPath]);
  const jump = (path: string) => {
    focusSearch.current = path === '/search';
    if (focusSearch.current) {
      path = '/books';
      if (currentPath === path) focusCatalogueInput();
    }
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
    if (page < catalogueStart) return [0, catalogueStart - 1];
    return [catalogueStart, pageCount - 1];
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
      case firstLeaf('hero'):
        return image(heroImage, 'Shelves in a sunlit academic library', 'The reading room');
      case firstLeaf('hero') + 1:
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
      case firstLeaf('featured'):
      case firstLeaf('featured') + 1:
        return (
          <>
            {header(p % 2 === 0 ? 'Featured books' : 'In the collection')}
            {rows(featured.slice((p % 2) * perPage, ((p % 2) + 1) * perPage))}
            {p % 2 === 1 && action('View all books', '/books')}
          </>
        );
      case firstLeaf('about'):
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
      case firstLeaf('about') + 1:
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
      case firstLeaf('releases'):
      case firstLeaf('releases') + 1:
        return (
          <>
            {header(p === firstLeaf('releases') ? 'New releases' : 'Recently published')}
            {rows(releases.slice(p % 2, (p % 2) + 1), true)}
            {p === firstLeaf('releases') + 1 && action('Browse recent titles', '/books')}
          </>
        );
      case firstLeaf('voices'):
        return (
          <div className="tb-prose">
            {header('Reader voices')}
            <p>No reader testimonials have been published yet.</p>
          </div>
        );
      case firstLeaf('voices') + 1:
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
      case firstLeaf('footer'):
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
  const listLeaf = (p: number) => {
    const n = p - catalogueStart,
      list = catalogue,
      first = n === 0;
    return (
      <div className="tb-list-page">
        {header(first ? 'Book Store' : 'Catalogue')}
        {first && (
          <div className="tb-filters">
            <label className="tb-query">
              <Search size={16} />
              <input
                type="search"
                aria-label="Search titles, authors, ISBN or subject"
                placeholder="Title, author, ISBN or subject"
                value={filter}
                onChange={(e) => changeList('/books', () => setFilter(e.target.value))}
              />
            </label>

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
          <p>No matching titles. Try another search or subject.</p>
        )}
      </div>
    );
  };
  const render = (p: number) => {
    if (p >= pageCount) return <div className="tb-page" aria-hidden="true" />;
    const chapter = chapters[Math.floor(p / 2)];
    const name = chapter?.[1] ?? 'Book Store';
    const body = !chapter ? (
      listLeaf(p)
    ) : chapter[0] !== 'contact' ? (
      homeLeaf(p)
    ) : p % 2 === 0 ? (
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
      <article className={'tb-page ' + (p === firstLeaf('hero') || p === firstLeaf('about') ? 'photo' : '')}>
        <header>{p === 1 ? 'Independent academic publishing' : p % 2 === 0 ? brand : name}</header>
        <div className="tb-body">{body}</div>
        <footer>
          <span>{name}</span>
          <b>{String(folio(p)).padStart(2, '0')}</b>
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
    '--angle': -180 * opening + 'deg',
    '--book-scale': scale,
    '--shift': single ? '0%' : -25 * (1 - opening) + '%',
    '--left-depth': 2 + (4 * at) / (pageCount - 1) + 'px',
    '--right-depth': 6 - (4 * at) / (pageCount - 1) + 'px',
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
            data-resting={at !== 0 || !!turn}
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
            <div className="tb-endpaper" aria-hidden="true">
              {!single && render(0)}
            </div>
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
          {intro < 1
            ? 'Scroll to open'
            : single || at + 1 >= pageCount
              ? `Page ${folio(at)}`
              : `Pages ${folio(at)}–${folio(at + 1)}`}
        </span>
        <button
          aria-label={intro < 1 ? 'Open the book' : 'Next page'}
          disabled={intro === 1 && at + stride > lastPage}
          onClick={() => (intro < 1 ? seek(0) : step(1))}
        >
          <ArrowRight size={18} />
        </button>
      </div>
      <nav
        className="tb-dock"
        aria-label="Book navigation"
        onPointerMove={(event) => {
          if (event.pointerType !== 'mouse') return;
          const buttons = event.currentTarget.querySelectorAll<HTMLElement>('button');
          buttons.forEach((button) => {
            const rect = button.getBoundingClientRect();
            const distance = Math.abs(event.clientX - (rect.left + rect.width / 2));
            const influence = Math.max(0, 1 - distance / 105);
            button.style.setProperty('--dock-lift', String(1 + influence * 0.3));
          });
        }}
        onPointerLeave={(event) => {
          event.currentTarget.querySelectorAll<HTMLElement>('button').forEach((button) =>
            button.style.removeProperty('--dock-lift'),
          );
        }}
      >
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
