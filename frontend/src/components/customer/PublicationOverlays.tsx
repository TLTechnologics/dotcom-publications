import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import type { Book, OrderItem } from '../../types';
import { Leaves, ProductCover, useBookInput, useMedia, useTurns } from './BookMechanics';

const rupees = (amount: number) => '₹' + amount.toLocaleString('en-IN');
function Surface({
  active,
  title,
  close,
  children,
  kind,
}: {
  active: boolean;
  title: string;
  close: () => void;
  children: ReactNode;
  kind: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(exitTimer.current), []);
  const dismiss = () => {
    if (closing) return;
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) {
      close();
      return;
    }
    setClosing(true);
    exitTimer.current = setTimeout(() => {
      setClosing(false);
      close();
    }, 150);
  };
  const closeTouch = useRef<{ x: number; y: number } | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !active) return;
    const origin = document.activeElement as HTMLElement | null;
    node.showModal();
    if (lastFocus.current?.isConnected && node.contains(lastFocus.current)) lastFocus.current.focus();
    else node.focus();
    return () => {
      lastFocus.current = node.contains(document.activeElement)
        ? (document.activeElement as HTMLElement)
        : null;
      node.close();
      if (origin?.isConnected) origin.focus({ preventScroll: true });
    };
  }, [active]);
  return (
    <dialog
      ref={ref}
      tabIndex={-1}
      className={'tb-overlay ' + kind + (closing ? ' leaving' : '')}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        dismiss();
      }}
    >
      {children}
      <button
        className="tb-close"
        onClick={dismiss}
        aria-label={'Close ' + title}
        onTouchStart={(event) => {
          const t = event.touches[0];
          closeTouch.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchCancel={() => {
          closeTouch.current = null;
        }}
        onTouchEnd={(event) => {
          const t = event.changedTouches[0];
          const start = closeTouch.current;
          closeTouch.current = null;
          if (start && Math.hypot(t.clientX - start.x, t.clientY - start.y) < 10) {
            event.preventDefault();
            dismiss();
          }
        }}
      >
        <X size={21} />
      </button>
    </dialog>
  );
}
export function CheckoutSheet({
  title,
  subtitle,
  close,
  children,
}: {
  title: string;
  subtitle: string;
  close: () => void;
  children: ReactNode;
}) {
  return (
    <Surface active title="Checkout" close={close} kind="tb-checkout">
      <section className="tb-checkout-paper">
        <header>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </header>
        <div className="tb-checkout-fields" data-native-scroll>
          {children}
        </div>
      </section>
    </Surface>
  );
}
export function DetailBook({
  book,
  active,
  close,
  add,
  buy,
  cart,
  preview,
  count,
}: {
  book: Book;
  active: boolean;
  close: () => void;
  add: (n: number) => void;
  buy: (n: number) => void;
  cart: () => void;
  preview: () => void;
  count: number;
}) {
  const single = useMedia('(max-width: 820px), (max-width: 960px) and (max-height: 480px)');
  const reduced = useMedia('(prefers-reduced-motion:reduce)');
  const [opened, setOpened] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const description = [book.short_description, book.full_description]
    .filter((v, i, a) => v?.trim() && a.indexOf(v) === i)
    .join('\n\n');
  const measure = useRef<HTMLDivElement>(null);
  const [parts, setParts] = useState<string[]>([]);
  const area = useRef<HTMLDivElement>(null);
  const specifications = [
    ['ISBN', book.isbn],
    ['Edition', book.edition],
    ['Year', book.publication_year],
    ['Publisher', book.publisher_name],
    ['Language', book.language],
    ['Format', book.book_format],
    ['Pages', book.pages],
    ['Subject', book.subject || book.category_name],
  ].filter(([, v]) => v);
  useLayoutEffect(() => {
    const node = measure.current;
    if (!node || !active) return;
    let live = true;
    const paginate = () => {
      if (!live || !node.clientHeight || !node.clientWidth) return;
      const words = description.split(/\s+/).filter(Boolean),
        chunks: string[] = [];
      for (let start = 0; start < words.length;) {
        let low = start + 1,
          high = words.length;
        while (low < high) {
          const end = Math.ceil((low + high) / 2);
          node.textContent = words.slice(start, end).join(' ');
          if (node.scrollHeight > node.clientHeight + 1) high = end - 1;
          else low = end;
        }
        chunks.push(words.slice(start, low).join(' '));
        start = low;
      }
      node.textContent = '';
      setParts((old) =>
        old.length === chunks.length && old.every((x, i) => x === chunks[i]) ? old : chunks,
      );
    };
    const observer = new ResizeObserver(paginate);
    observer.observe(node);
    paginate();
    document.fonts.ready.then(paginate);
    return () => {
      live = false;
      observer.disconnect();
    };
  }, [active, description, single]);
  const specPages = Math.ceil(specifications.length / 4);
  const last = Math.max(1, parts.length + specPages);
  const { at, turn, travel, position } = useTurns(0, single ? 1 : 2, last, reduced);
  useEffect(() => {
    travel(Math.min(position.current, last), false, true);
  }, [single, last]);
  const step = (dir: number) => travel(at + dir * (single ? 1 : 2));
  useBookInput(area, active, step);
  const selectable = book.availability_status !== 'out_of_stock';
  const render = (p: number) => {
    const spec = p - parts.length - 1,
      entries = specifications.slice(spec * 4, spec * 4 + 4);
    return (
      <article className="tb-page">
        <header>{p === 0 ? 'Book details' : book.title}</header>
        <div className={'tb-body ' + (p === 0 ? 'tb-title-page' : '')}>
          {p === 0 ? (
            <>
              <ProductCover src={book.cover_image} title={book.title} />
              <h2>{book.title}</h2>
              {book.authors?.length > 0 && <p>{book.authors.map((a) => a.name).join(', ')}</p>}
            </>
          ) : p <= parts.length ? (
            <>
              <h3>{p === 1 ? 'About this book' : 'Description'}</h3>
              <p className="tb-description">{parts[p - 1]}</p>
            </>
          ) : entries.length > 0 && spec >= 0 ? (
            <>
              <h3>Publication details</h3>
              <dl className="tb-specs">
                {entries.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : (
            <>
              <h3>{book.title}</h3>
              <button className="tb-link" onClick={preview}>
                Read preview <ArrowRight size={15} />
              </button>
            </>
          )}
        </div>
        <footer>
          <span>Book details</span>
          <b>{p + 1}</b>
        </footer>
      </article>
    );
  };
  return (
    <Surface active={active} title="Book details" close={close} kind="tb-details">
      <div className="tb-detail-shell" ref={area}>
        <div className="tb-detail-volume">
          <Leaves at={at} single={single} turn={turn} render={render} />
          {!opened && (
            <div aria-hidden="true" className="tb-detail-opening" onAnimationEnd={() => setOpened(true)}>
              <ProductCover src={book.cover_image} title={book.title} />
            </div>
          )}
          <div className="tb-measuring" aria-hidden="true">
            <div className="tb-page">
              <header>Book details</header>
              <div className="tb-body">
                <h3>About this book</h3>
                <div ref={measure} className="tb-description" />
              </div>
              <footer>Book details</footer>
            </div>
          </div>
        </div>
        <div className="tb-detail-paging">
          <button
            className="tb-arrow"
            disabled={at === 0}
            aria-label="Previous detail page"
            onClick={() => step(-1)}
          >
            <ArrowLeft size={17} />
          </button>
          <button onClick={preview} className="tb-preview">
            Read preview
          </button>
          <button
            className="tb-arrow"
            disabled={at + (single ? 1 : 2) > last}
            aria-label="Next detail page"
            onClick={() => step(1)}
          >
            <ArrowRight size={17} />
          </button>
        </div>
        <div className="tb-buybar">
          <div className="tb-price">
            <strong>{rupees(book.selling_price)}</strong>
            {book.mrp > book.selling_price && <del>{rupees(book.mrp)}</del>}
            <small>
              {
                { in_stock: 'In stock', pre_order: 'Pre-order', out_of_stock: 'Out of stock' }[
                  book.availability_status
                ]
              }
            </small>
          </div>
          <label>
            Qty
            <input
              type="number"
              min="1"
              step="1"
              aria-label="Purchase quantity"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
            />
          </label>
          <button className="tb-outline" disabled={!selectable} onClick={() => add(quantity)}>
            Add to cart
          </button>
          <button className="tb-button" disabled={!selectable} onClick={() => buy(quantity)}>
            Buy now
          </button>
          <button className="tb-mini-cart" aria-label={'Open cart, ' + count + ' items'} onClick={cart}>
            <ShoppingBag size={17} />
            {count}
          </button>
        </div>
      </div>
    </Surface>
  );
}
export function OrderClipboard({
  items,
  change,
  remove,
  checkout,
  browse,
  close,
}: {
  items: (OrderItem & { mrp?: number })[];
  change: (id: number, d: number) => void;
  remove: (id: number) => void;
  checkout: () => void;
  browse: () => void;
  close: () => void;
}) {
  const total = items.reduce((n, i) => n + i.price * i.quantity, 0);
  const discount = items.reduce((n, i) => n + Math.max(0, (i.mrp ?? i.price) - i.price) * i.quantity, 0);
  return (
    <Surface active title="Shopping cart" close={close} kind="tb-cart">
      <section className="tb-clipboard">
        <div className="tb-clip" aria-hidden="true" />
        <header>
          <small>Dotcom Publications</small>
          <h2>Order sheet</h2>
          <small>{items.reduce((sum, i) => sum + i.quantity, 0)} items</small>
        </header>
        {items.length ? (
          <>
            <div className="tb-order-list" data-native-scroll>
              {items.map((i) => (
                <article key={i.book_id}>
                  <ProductCover src={i.cover_image} title={i.title} />
                  <div className="tb-line-copy">
                    <h3>{i.title}</h3>
                    <span>{rupees(i.price)} each</span>
                    <div className="tb-stepper">
                      <button
                        aria-label={'Decrease quantity of ' + i.title}
                        onClick={() => change(i.book_id, -1)}
                      >
                        <Minus size={14} />
                      </button>
                      <b>{i.quantity}</b>
                      <button
                        aria-label={'Increase quantity of ' + i.title}
                        onClick={() => change(i.book_id, 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="tb-line-total">
                    <strong>{rupees(i.price * i.quantity)}</strong>
                    <button aria-label={'Remove ' + i.title} onClick={() => remove(i.book_id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <footer>
              {discount > 0 && (
                <>
                  <p>
                    List price <span>{rupees(total + discount)}</span>
                  </p>
                  <p>
                    Book discount <span>−{rupees(discount)}</span>
                  </p>
                </>
              )}
              <p>
                Institutional delivery <span>Free</span>
              </p>
              <p>
                <strong>Total</strong>
                <strong>{rupees(total)}</strong>
              </p>
              <button className="tb-button" onClick={checkout}>
                Continue to checkout <ArrowRight size={16} />
              </button>
            </footer>
          </>
        ) : (
          <div className="tb-empty">
            <ShoppingBag size={31} />
            <h3>Your order sheet is empty.</h3>
            <button className="tb-link" onClick={browse}>
              Browse books <ArrowRight size={16} />
            </button>
          </div>
        )}
      </section>
    </Surface>
  );
}
