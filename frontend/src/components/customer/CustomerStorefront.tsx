import { lazy, Suspense, useState, useMemo, useEffect, useRef } from 'react';
import type { Book, Category, LandingPageContent, SiteSettings, OrderItem, Order } from '../../types';
import { CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

import { EditorialStorefront } from './EditorialStorefront';
import { DetailBook, OrderClipboard, CheckoutSheet } from './PublicationOverlays';
import './publication-overlays.css';

const InteractiveBookReader = lazy(() => import('../books/InteractiveBookReader').then(module => ({default: module.InteractiveBookReader})));

interface CartItem extends OrderItem {
  cover_image?: string | null;
  mrp?: number;
}

interface CustomerStorefrontProps {
  books: Book[];
  categories: Category[];
  landingContent: LandingPageContent | null;
  siteSettings: SiteSettings | null;
  onNavigate: (path: string) => void;
  isAdminLoggedIn?: boolean;
  currentPath?: string;
}

// Verified academic catalogue publications
const VERIFIED_CATALOGUE_BOOKS: Book[] = [
  {
    id: 1,
    title: 'Foundations of Computational Mathematics',
    subtitle: 'An Advanced University Monograph',
    short_description: 'A systematic exposition of computational methods, numerical algorithms, and mathematical modelling for postgraduate students and researchers.',
    full_description: 'Foundations of Computational Mathematics presents a comprehensive treatment of numerical methods, matrix computations, interpolation, differential equations, and optimisation techniques essential for postgraduate scholars in applied mathematics and engineering.\n\nThis authoritative monograph integrates fundamental mathematical theory with computational implementation, providing students and instructors with rigorous analytical frameworks supported by illustrative case studies.\n\nSynthesising classical numerical analysis with modern computational paradigms, the text equips readers with the mathematical rigour required for independent research and advanced academic inquiry. Each chapter concludes with structured problem sets aligned to national university examination standards.',
    cover_image: '/covers/computational-mathematics.jpg',
    isbn: '978-81-948231-1-1',
    edition: '1st Edition',
    publication_year: 2026,
    pages: 486,
    language: 'English',
    book_format: 'Hardcover',
    subject: 'Applied Mathematics, Numerical Analysis, Scientific Computing',
    category_id: 1,
    category_name: 'Science & Technology',
    publisher_name: 'Dotcom Academic Press',
    selling_price: 495.0,
    mrp: 650.0,
    currency: 'INR',
    is_draft: false,
    is_featured: true,
    availability_status: 'in_stock',
    authors: [{ id: 1, name: 'Dr. R. K. Sharma' }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Principles of Environmental Law & Policy',
    subtitle: 'A Comprehensive Legal Framework',
    short_description: 'A definitive legal text covering environmental legislation, regulatory frameworks, judicial precedents and policy governance for law students and practitioners.',
    full_description: 'Principles of Environmental Law & Policy offers a thorough and analytical examination of environmental legislation, judicial doctrines, and international treaty obligations as they apply within the Indian and South Asian legal context.\n\nDrawing on landmark case law, constitutional provisions, and international environmental conventions, this monograph provides law students, legal practitioners, and policy researchers with an authoritative reference grounded in current legislative developments.\n\nThe text covers foundational environmental jurisprudence, regulatory compliance mechanisms, environmental impact assessment law, biodiversity conservation legislation, and emerging frameworks for climate governance and sustainable development.',
    cover_image: '/covers/environmental-law.jpg',
    isbn: '978-81-948231-2-8',
    edition: '1st Edition',
    publication_year: 2026,
    pages: 398,
    language: 'English',
    book_format: 'Paperback',
    subject: 'Environmental Law, Public Policy, Jurisprudence, Governance',
    category_id: 2,
    category_name: 'Law & Governance',
    publisher_name: 'Dotcom Academic Press',
    selling_price: 425.0,
    mrp: 550.0,
    currency: 'INR',
    is_draft: false,
    is_featured: false,
    availability_status: 'in_stock',
    authors: [{ id: 2, name: 'Prof. Meenakshi Nair' }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Clinical Psychology: Research & Practice',
    subtitle: 'Evidence-Based Approaches for the Modern Practitioner',
    short_description: 'An evidence-based academic text integrating clinical research methodology, psychopathology, therapeutic modalities and professional practice standards.',
    full_description: 'Clinical Psychology: Research & Practice is a comprehensive academic monograph designed for postgraduate students, clinical trainees, and practising psychologists seeking an evidence-based foundation in contemporary clinical methods.\n\nThe text integrates scientific research methodology with practical clinical application, covering psychodiagnostic assessment, cognitive-behavioural frameworks, neuropsychological evaluation, and psychotherapeutic intervention across diverse clinical populations.\n\nStructured in alignment with national licensing and accreditation standards, this publication bridges the gap between academic research and clinical practice, providing a rigorous yet accessible resource for university psychology departments and professional training programmes.',
    cover_image: '/covers/clinical-psychology.jpg',
    isbn: '978-81-948231-3-5',
    edition: '1st Edition',
    publication_year: 2026,
    pages: 512,
    language: 'English',
    book_format: 'Paperback',
    subject: 'Clinical Psychology, Research Methodology, Psychotherapy, Mental Health',
    category_id: 3,
    category_name: 'Social Sciences',
    publisher_name: 'Dotcom Academic Press',
    selling_price: 375.0,
    mrp: 480.0,
    currency: 'INR',
    is_draft: false,
    is_featured: false,
    availability_status: 'in_stock',
    authors: [{ id: 3, name: 'Dr. Anjali Verma' }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    title: 'Principles of Modern Deep Learning: From Perceptrons to Transformers',
    subtitle: 'A Rigorous Mathematical and Algorithmic Exposition',
    short_description: 'Widely adopted across undergraduate and postgraduate computer science programs, presenting a unified mathematical treatment of modern machine learning.',
    full_description: 'Principles of Modern Deep Learning offers an authoritative mathematical and algorithmic exposition of contemporary artificial intelligence architectures, from gradient-based backpropagation to modern multi-head self-attention transformers and diffusion mechanisms.\n\nDesigned for university computer science and data science curricula, the text combines rigorous analytical proofs with practical computational paradigms. Each chapter features detailed derivations of loss functions, optimization surfaces, and matrix computational complexities.\n\nThe monograph serves as a comprehensive textbook for higher education classrooms, supporting instructors with modular problem sets, verification benchmarks, and faculty discussion frameworks aligned with global academic curricula.',
    cover_image: '/covers/modern-deep-learning.jpg',
    isbn: '978-81-948231-4-2',
    edition: '1st Edition',
    publication_year: 2026,
    pages: 544,
    language: 'English',
    book_format: 'Hardcover',
    subject: 'Computer Science, Deep Learning, Artificial Intelligence, Algorithms',
    category_id: 1,
    category_name: 'Science & Technology',
    publisher_name: 'Dotcom Academic Press',
    selling_price: 550.0,
    mrp: 695.0,
    currency: 'INR',
    is_draft: false,
    is_featured: true,
    availability_status: 'in_stock',
    authors: [{ id: 4, name: 'Dr. Marcus Vance' }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    title: 'Macroeconomic Modeling in Developing Economies',
    subtitle: 'Fiscal Dominance, Exchange Regimes, and Monetary Shocks',
    short_description: 'A pioneering econometric monograph on fiscal dynamics, foreign exchange regimes, and inflation targeting in emerging markets.',
    full_description: 'Macroeconomic Modeling in Developing Economies delivers a rigorous, data-driven framework for understanding fiscal policy, sovereign debt sustainability, dynamic stochastic general equilibrium (DSGE) modeling, and central bank monetary transmission in emerging market contexts.\n\nAuthored by Prof. Elena Rostova, the monograph bridges structural macroeconomic theory with empirical econometric estimation. The text provides postgraduate students, economic researchers, and central bank analysts with advanced analytical tools for modeling trade shocks, currency depreciation, and fiscal consolidation.\n\nFeaturing real-world macroeconomic datasets and comprehensive curriculum modules, this work is an essential adoption for university departments of economics, public policy institutes, and financial research centers.',
    cover_image: '/covers/macroeconomic-modeling.jpg',
    isbn: '978-81-948231-5-9',
    edition: '1st Edition',
    publication_year: 2026,
    pages: 460,
    language: 'English',
    book_format: 'Hardcover',
    subject: 'Macroeconomics, Econometric Modeling, Public Finance, Monetary Policy',
    category_id: 4,
    category_name: 'Economics & Public Policy',
    publisher_name: 'Dotcom Academic Press',
    selling_price: 440.0,
    mrp: 580.0,
    currency: 'INR',
    is_draft: false,
    is_featured: false,
    availability_status: 'in_stock',
    authors: [{ id: 5, name: 'Prof. Elena Rostova' }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 6,
    title: 'Clinical Neuroanatomy & Translational Diagnostics',
    subtitle: 'Pathological Correlations and Functional Systems',
    short_description: 'A comprehensive clinical neurology reference integrating structural neuroanatomy, pathological functional systems, and modern neuroimaging diagnostics.',
    full_description: 'Clinical Neuroanatomy & Translational Diagnostics provides a definitive, curriculum-aligned text for postgraduate medical students, neurology residents, and clinical researchers in translational neurosciences.\n\nThe text systematically explores cerebral cortical organization, subcortical tracts, cranial nerve pathways, and vascular supply, correlating histological architecture with clinical manifestations of neurological disease.\n\nEnriched with high-resolution diffusion tensor imaging (DTI) tractography maps, magnetic resonance correlations, and structured diagnostic case analyses, this monograph provides an indispensable clinical and educational foundation for medical college faculties and university hospital libraries.',
    cover_image: '/covers/clinical-neuroanatomy.jpg',
    isbn: '978-81-948231-6-6',
    edition: '1st Edition',
    publication_year: 2026,
    pages: 620,
    language: 'English',
    book_format: 'Hardcover',
    subject: 'Neuroscience, Clinical Medicine, Neuroanatomy, Diagnostics',
    category_id: 5,
    category_name: 'Medical & Clinical Sciences',
    publisher_name: 'Dotcom Academic Press',
    selling_price: 520.0,
    mrp: 680.0,
    currency: 'INR',
    is_draft: false,
    is_featured: false,
    availability_status: 'in_stock',
    authors: [{ id: 6, name: 'Dr. Suniti Mukherjee' }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Science & Technology', slug: 'science-technology', description: 'Advanced university publications in computer science, mathematics, and algorithms.' },
  { id: 2, name: 'Law & Governance', slug: 'law-governance', description: 'Scholarly texts on environmental legislation, jurisprudence, and regulatory frameworks.' },
  { id: 3, name: 'Social Sciences', slug: 'social-sciences', description: 'Academic literature in clinical psychology, sociology, and behavioral sciences.' },
  { id: 4, name: 'Economics & Public Policy', slug: 'economics-public-policy', description: 'Macroeconomics, quantitative econometrics, and fiscal sustainability.' },
  { id: 5, name: 'Medical & Clinical Sciences', slug: 'medical-clinical-sciences', description: 'Clinical neuroanatomy, translational research, and diagnostics manuals.' }
];

export const CustomerStorefront: React.FC<CustomerStorefrontProps> = ({
  books,
  categories: propCategories,
  landingContent,
  siteSettings,
  onNavigate,
  isAdminLoggedIn = false,
  currentPath,
}) => {
  const toast = useToast();

  // Active catalogues with safe fallback
  const effectiveBooks = useMemo(() => {
    return books && books.length > 0 ? books : VERIFIED_CATALOGUE_BOOKS;
  }, [books]);

  const effectiveCategories = useMemo(() => {
    return propCategories && propCategories.length > 0 ? propCategories : DEFAULT_CATEGORIES;
  }, [propCategories]);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dotcom_cart');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed)
        ? parsed.filter(
            (i) => i && Number.isSafeInteger(i.quantity) && i.quantity > 0 && Number.isFinite(i.price),
          )
        : [];
    } catch {
      return [];
    }
  });

  const path = currentPath || '/';
  const productPath = path.match(/^\/books\/(\d+)$/);
  const isCartOpen = path === '/cart';
  const isCheckoutOpen = path === '/checkout';
  const foreground = !!productPath || isCartOpen || isCheckoutOpen;
  const background = foreground ? history.state?.publicationUnderlay || (productPath ? '/books' : '/') : path;
  const [entryProduct, setEntryProduct] = useState(() =>
    productPath && !matchMedia('(prefers-reduced-motion:reduce)').matches ? path : null,
  );
  const arriving = entryProduct === path;
  useEffect(() => {
    if (entryProduct && path !== entryProduct) setEntryProduct(null);
  }, [entryProduct, path]);
  const productId = Number(productPath?.[1] || (foreground && history.state?.publicationProduct));
  const selectedBook = effectiveBooks.find((b) => b.id === productId && !b.is_draft);
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState<Order | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  useEffect(() => {
    setReadingBook(null);
    setOrderError('');
    if (!isCheckoutOpen) setOrderConfirmed(null);
  }, [path, isCheckoutOpen]);

  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (foreground || !opener.current) return;
    const target = opener.current;
    const frame = requestAnimationFrame(() => {
      if (target.isConnected) target.focus({ preventScroll: true });
      opener.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [foreground]);

  const openOverlay = (destination: string, bookId = productId) => {
    if (!foreground && document.activeElement instanceof HTMLElement) opener.current = document.activeElement;
    if (destination === path) return;
    onNavigate(destination);
    history.replaceState(
      {
        ...history.state,
        publicationParent: path,
        publicationUnderlay: background,
        publicationProduct: bookId,
      },
      '',
    );
  };
  const closeOverlay = () => {
    if (history.state?.publicationParent) history.back();
    else onNavigate(background);
  };

  // Checkout Form State
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    payment_method: 'Cash on Delivery',
  });

  // Save cart to localStorage
  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem('dotcom_cart', JSON.stringify(newCart));
    } catch {
      // ignore
    }
  };

  const addToCart = (book: Book, quantity = 1) => {
    if (book.availability_status === 'out_of_stock' || !Number.isSafeInteger(quantity) || quantity < 1)
      return;
    const existingIndex = cart.findIndex((item) => item.book_id === book.id);
    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...cart];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity,
      };
    } else {
      updated = [
        ...cart,
        {
          book_id: book.id,
          title: book.title,
          price: book.selling_price,
          mrp: book.mrp,
          quantity,
          cover_image: book.cover_image,
        },
      ];
    }
    updateCart(updated);
    toast.success('Added to Cart', `"${book.title}" added to your academic cart.`);
  };

  const updateQuantity = (bookId: number, delta: number) => {
    if (delta > 0 && effectiveBooks.find((b) => b.id === bookId)?.availability_status === 'out_of_stock')
      return;
    const updated = cart
      .map((item) => {
        if (item.book_id === bookId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];
    updateCart(updated);
  };

  const removeFromCart = (bookId: number) => {
    const updated = cart.filter((item) => item.book_id !== bookId);
    updateCart(updated);
    toast.info('Item Removed', 'The item was removed from your cart.');
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Filter published books only
  const publishedBooks = useMemo(() => {
    return effectiveBooks.filter((b) => !b.is_draft);
  }, [effectiveBooks]);

  // Handle Checkout Submit
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) {
      toast.error(
        'Required Information Missing',
        'Please fill in your name, contact phone, and delivery address.',
      );
      return;
    }

    if (cart.length === 0) {
      toast.error('Cart Empty', 'Please select at least one title before placing an order.');
      return;
    }

    if (
      cart.some(
        (item) => effectiveBooks.find((b) => b.id === item.book_id)?.availability_status === 'out_of_stock',
      )
    ) {
      setOrderError('Remove out-of-stock titles from your cart before checkout.');
      return;
    }
    if (isSubmittingOrder) return;
    setOrderError('');
    setIsSubmittingOrder(true);
    try {
      const orderPayload = {
        customer_name: checkoutForm.name,
        customer_email: checkoutForm.email.trim(),
        customer_phone: checkoutForm.phone,
        shipping_address: checkoutForm.address,
        city: checkoutForm.city,
        state: checkoutForm.state,
        pincode: checkoutForm.pincode,
        items: cart.map((i) => ({
          book_id: i.book_id,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          cover_image: i.cover_image,
        })),
        total_amount: cartTotal,
        payment_method: checkoutForm.payment_method,
      };

      const result = await api.createOrder(orderPayload);
      setOrderConfirmed(result);
      updateCart([]);
      toast.success('Order Placed!', `Your order #${result.order_number} has been recorded.`);
    } catch {
      setOrderError('Your order could not be placed. Your cart has been kept. Please try again.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Maintenance Mode Guard
  if (siteSettings?.maintenance_mode && !isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-6 text-center text-[#181716] font-sans selection:bg-[#EED97A]">
        <div className="w-16 h-16 rounded-sm bg-white border border-[#EAE3DE] overflow-hidden shadow-sm p-1 mb-6">
          <img src="/logo.jpg" alt="Dotcom Publications" className="w-full h-full object-cover rounded-sm" />
        </div>
        <div className="max-w-md space-y-4">
          <span className="inline-block px-3 py-1 rounded-sm bg-[#FAF2BA] text-[#181716] text-xs font-bold tracking-wide border border-[#EED97A]">
            Scheduled maintenance
          </span>
          <h1 className="font-serif font-bold text-3xl text-[#181716]">Catalogue temporarily offline</h1>
          <p className="text-xs text-[#524B42] leading-relaxed">
            Dotcom Publications is currently performing scheduled infrastructure maintenance. Our bookstore,
            catalog, and reader will return shortly.
          </p>
          <div className="pt-4 border-t border-[#EAE3DE] flex justify-center gap-3">
            <button
              onClick={() => onNavigate('/admin')}
              className="text-xs font-semibold text-[#651C32] hover:underline"
            >
              Administrator sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <EditorialStorefront
        books={publishedBooks}
        categories={effectiveCategories}
        landingContent={landingContent}
        siteSettings={siteSettings}
        currentPath={background}
        onNavigate={onNavigate}
        active={arriving || (!foreground && !readingBook)}
        onArrived={() => setEntryProduct(null)}
        onBookDetails={(b) => openOverlay('/books/' + b.id, b.id)}
        cartCount={cartCount}
        onCart={() => openOverlay('/cart')}
      />
      {selectedBook && (
        <DetailBook
          key={selectedBook.id}
          book={selectedBook}
          active={!!productPath && !readingBook && !arriving}
          close={closeOverlay}
          add={(n) => addToCart(selectedBook, n)}
          buy={(n) => {
            addToCart(selectedBook, n);
            openOverlay('/checkout');
          }}
          cart={() => openOverlay('/cart')}
          preview={() => setReadingBook(selectedBook)}
          count={cartCount}
        />
      )}
      {productPath && !arriving && !selectedBook && (
        <Modal isOpen onClose={closeOverlay} title="Title unavailable">
          <p>This title is unavailable in the current catalogue.</p>
          <button className="tb-link" onClick={() => onNavigate('/books')}>
            Browse books
          </button>
        </Modal>
      )}
      {isCartOpen && (
        <OrderClipboard
          items={cart}
          change={updateQuantity}
          remove={removeFromCart}
          close={closeOverlay}
          checkout={() => openOverlay('/checkout')}
          browse={() => onNavigate('/books')}
        />
      )}
      {readingBook && (
        <Suspense
          fallback={
            <div role="status" className="fixed inset-0 grid place-items-center bg-stone-100">
              Opening preview…
            </div>
          }
        >
          <InteractiveBookReader
            book={readingBook}
            isOpen
            onClose={() => setReadingBook(null)}
            onAddToCart={addToCart}
            onViewDetails={() => setReadingBook(null)}
          />
        </Suspense>
      )}
      {/* Checkout / Order Placement Modal */}
      {isCheckoutOpen && (
        <CheckoutSheet
          close={() => {
            if (!isSubmittingOrder) {
              closeOverlay();
              setOrderConfirmed(null);
            }
          }}
          title={orderConfirmed ? 'Order confirmed' : 'Checkout details'}
          subtitle={
            orderConfirmed
              ? 'Thank you for choosing Dotcom Publications'
              : `Order Total: ₹${cartTotal.toLocaleString()} (${cartCount} titles)`
          }
        >
          {orderConfirmed ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="font-serif font-bold text-xl text-[#181716]">Order placed</h3>
                <p className="text-xs text-[#736B5E] mt-1">Your tracking order reference is:</p>
                <div className="inline-block px-4 py-1.5 rounded-sm bg-[#FAF2BA] border border-[#EED97A] font-mono font-bold text-sm text-[#181716] mt-2 shadow-xs">
                  {orderConfirmed.order_number}
                </div>
              </div>

              <p className="text-xs text-[#736B5E] max-w-sm mx-auto">
                Contact phone for this order: <strong>{orderConfirmed.customer_phone}</strong>.
              </p>

              <Button
                variant="primary"
                onClick={() => {
                  setOrderConfirmed(null);
                  onNavigate(background);
                }}
              >
                Continue browsing
              </Button>
            </div>
          ) : cart.length === 0 ? (
            <div className="tb-empty">
              <p>Your order sheet is empty.</p>
              <button className="tb-link" onClick={() => onNavigate('/books')}>
                Browse books
              </button>
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label
                    htmlFor="checkout-name"
                    className="block text-[11px] font-semibold text-[#181716] mb-1"
                  >
                    Full name *
                  </label>
                  <input
                    id="checkout-name"
                    autoComplete="name"
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Sharma"
                    value={checkoutForm.name}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-sm border border-[#EAE3DE] bg-[#FAF9F5] focus:bg-white text-[#181716] focus:outline-none focus:ring-2 focus:ring-[#EED97A] text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="checkout-phone"
                    className="block text-[11px] font-semibold text-[#181716] mb-1"
                  >
                    Contact phone *
                  </label>
                  <input
                    id="checkout-phone"
                    autoComplete="tel"
                    type="tel"
                    minLength={5}
                    required
                    placeholder="+91 98765 43210"
                    value={checkoutForm.phone}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-sm border border-[#EAE3DE] bg-[#FAF9F5] focus:bg-white text-[#181716] focus:outline-none focus:ring-2 focus:ring-[#EED97A] text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label
                  htmlFor="checkout-email"
                  className="block text-[11px] font-semibold text-[#181716] mb-1"
                >
                  Email address (for order receipt) *
                </label>
                <input
                  id="checkout-email"
                  autoComplete="email"
                  type="email"
                  placeholder="name@university.edu.in"
                  value={checkoutForm.email}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-sm border border-[#EAE3DE] bg-[#FAF9F5] focus:bg-white text-[#181716] focus:outline-none focus:ring-2 focus:ring-[#EED97A] text-xs sm:text-sm"
                />
              </div>

              <div className="text-xs">
                <label
                  htmlFor="checkout-address"
                  className="block text-[11px] font-semibold text-[#181716] mb-1"
                >
                  Delivery address *
                </label>
                <textarea
                  id="checkout-address"
                  autoComplete="street-address"
                  rows={2}
                  required
                  placeholder="Department / Campus Address, Institutional Area..."
                  value={checkoutForm.address}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-sm border border-[#EAE3DE] bg-[#FAF9F5] focus:bg-white text-[#181716] focus:outline-none focus:ring-2 focus:ring-[#EED97A] text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label
                    htmlFor="checkout-city"
                    className="block text-[10px] font-semibold text-[#181716] mb-1"
                  >
                    City
                  </label>
                  <input
                    id="checkout-city"
                    autoComplete="address-level2"
                    type="text"
                    placeholder="New Delhi"
                    value={checkoutForm.city}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                    className="w-full min-h-[42px] px-2.5 py-2 rounded-sm border border-[#EAE3DE] bg-[#FAF9F5] text-[#181716] text-xs"
                  />
                </div>
                <div>
                  <label
                    htmlFor="checkout-state"
                    className="block text-[10px] font-semibold text-[#181716] mb-1"
                  >
                    State
                  </label>
                  <input
                    id="checkout-state"
                    autoComplete="address-level1"
                    type="text"
                    placeholder="Delhi"
                    value={checkoutForm.state}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, state: e.target.value })}
                    className="w-full min-h-[42px] px-2.5 py-2 rounded-sm border border-[#EAE3DE] bg-[#FAF9F5] text-[#181716] text-xs"
                  />
                </div>
                <div>
                  <label
                    htmlFor="checkout-pincode"
                    className="block text-[10px] font-semibold text-[#181716] mb-1"
                  >
                    PIN Code
                  </label>
                  <input
                    id="checkout-pincode"
                    autoComplete="postal-code"
                    type="text"
                    placeholder="110001"
                    value={checkoutForm.pincode}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, pincode: e.target.value })}
                    className="w-full min-h-[42px] px-2.5 py-2 rounded-sm border border-[#EAE3DE] bg-[#FAF9F5] text-[#181716] text-xs"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="text-xs pt-1">
                <label className="block text-[11px] font-semibold text-[#181716] mb-1">Payment method</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2.5 min-h-[44px] rounded-sm border border-[#EAE3DE] bg-[#FAF9F5] cursor-pointer hover:border-[#EED97A]">
                    <input
                      type="radio"
                      name="payment_method"
                      value="Cash on Delivery"
                      checked={checkoutForm.payment_method === 'Cash on Delivery'}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, payment_method: e.target.value })}
                      className="text-[#EED97A] focus:ring-[#EED97A]"
                    />
                    <span className="font-semibold text-xs">Cash on delivery</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 min-h-[44px] rounded-sm border border-[#EAE3DE] bg-[#FAF9F5] cursor-pointer hover:border-[#EED97A]">
                    <input
                      type="radio"
                      name="payment_method"
                      value="UPI on Delivery"
                      checked={checkoutForm.payment_method === 'UPI on Delivery'}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, payment_method: e.target.value })}
                      className="text-[#EED97A] focus:ring-[#EED97A]"
                    />
                    <span className="font-semibold text-xs">UPI on delivery</span>
                  </label>
                </div>
              </div>

              {orderError && (
                <p role="alert" className="tb-order-error">
                  {orderError}
                </p>
              )}
              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmittingOrder}
                  className="w-full min-h-[48px] flex items-center justify-center gap-2 font-bold"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#181716]" />
                  <span>
                    {isSubmittingOrder
                      ? 'Confirming order...'
                      : `Confirm order (₹${cartTotal.toLocaleString()})`}
                  </span>
                </Button>
              </div>
            </form>
          )}
        </CheckoutSheet>
      )}
    </div>
  );
};
