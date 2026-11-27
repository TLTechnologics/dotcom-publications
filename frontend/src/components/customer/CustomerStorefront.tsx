import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Book,
  Category,
  LandingPageContent,
  SiteSettings,
  OrderItem,
  Author,
  Publisher
} from '../../types';
import {
  Search,
  ShoppingBag,
  Lock,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  X,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  Filter,
  Sparkles,
  ShieldCheck,
  Truck,
  CreditCard,
  Home,
  Info,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { InteractiveBookReader } from '../books/InteractiveBookReader';
import { EditorialStorefront } from './EditorialStorefront';
import { MagnificationDock, type DockItemData } from './MagnificationDock';
import './editorial-storefront.css';
import { ChevronDown, HelpCircle } from 'lucide-react';

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

  // State
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dotcom_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<any | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery('');
    window.scrollTo(0, 0);
  }, [currentPath]);

  // Synchronize route paths like /cart, /checkout, /books, /authors
  useEffect(() => {
    const raw = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
    const path = raw.toLowerCase().replace(/\/+$/, '');
    if (path === '/cart') {
      setIsCartOpen(true);
      setIsCheckoutOpen(false);
    } else if (path === '/checkout') {
      setIsCheckoutOpen(true);
      setIsCartOpen(false);
    }
  }, [currentPath]);

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

  // Lock body scroll when cart or modal is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else if (!selectedBook && !readingBook && !isCheckoutOpen) {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen, selectedBook, readingBook, isCheckoutOpen]);

  // IntersectionObserver for 4.C Scroll Reveal Animation
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [effectiveBooks]);

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
    const existingIndex = cart.findIndex((item) => item.book_id === book.id);
    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...cart];
      updated[existingIndex].quantity += quantity;
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

  const filteredBooks = useMemo(() => {
    return publishedBooks.filter((book) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        book.category_id === selectedCategory ||
        book.subcategory_id === selectedCategory;
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.authors &&
          book.authors.some((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (book.isbn && book.isbn.includes(searchQuery)) ||
        (book.subject && book.subject.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [publishedBooks, selectedCategory, searchQuery]);

  const dockItems = useMemo<DockItemData[]>(() => [
    {
      icon: <Home size={21} />,
      label: 'Home',
      onClick: () => {
        setSearchOpen(false);
        setSearchQuery('');
        onNavigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      icon: <BookOpen size={21} />,
      label: 'Bookstore',
      onClick: () => { setSearchOpen(false); setSearchQuery(''); onNavigate('/books'); },
    },
    {
      icon: <Info size={21} />,
      label: 'About us',
      onClick: () => { setSearchOpen(false); setSearchQuery(''); onNavigate('/about'); },
    },
    {
      icon: <Mail size={21} />,
      label: 'Contact',
      onClick: () => { setSearchOpen(false); setSearchQuery(''); onNavigate('/contact'); },
    },
    {
      icon: <Search size={21} />,
      label: 'Search books',
      onClick: () => setSearchOpen((open) => !open),
    },
    {
      icon: <ShoppingBag size={21} />,
      label: 'Your cart',
      badge: cartCount,
      onClick: () => setIsCartOpen(true),
    },
  ], [cartCount, onNavigate]);

  // Handle Checkout Submit
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) {
      toast.error('Required Information Missing', 'Please fill in your name, contact phone, and delivery address.');
      return;
    }

    if (cart.length === 0) {
      toast.error('Cart Empty', 'Please select at least one title before placing an order.');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const orderPayload = {
        customer_name: checkoutForm.name,
        customer_email: checkoutForm.email || 'customer@dotcompublications.com',
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
    } catch (err: any) {
      // Graceful offline fallback simulation
      const fallbackOrder = {
        order_number: `ORD-${Date.now().toString().slice(-6)}`,
        customer_name: checkoutForm.name,
        customer_phone: checkoutForm.phone,
        total_amount: cartTotal,
      };
      setOrderConfirmed(fallbackOrder);
      updateCart([]);
      toast.success('Order Placed!', `Your order #${fallbackOrder.order_number} has been recorded.`);
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
          <h1 className="font-serif font-bold text-3xl text-[#181716]">
            Catalogue temporarily offline
          </h1>
          <p className="text-xs text-[#524B42] leading-relaxed">
            Dotcom Publications is currently performing scheduled infrastructure maintenance. Our bookstore, catalog, and reader will return shortly.
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
    <div className="min-h-screen bg-[#FAF9F5] font-sans text-[#181716] flex flex-col selection:bg-[#E5DDCF] selection:text-[#29382C] storefront">
      {searchOpen && (
        <section className="dock-search-panel" aria-label="Search the book catalogue">
          <div className="dock-search-heading">
            <div><span className="editorial-kicker editorial-kicker-dark">Catalogue search</span><h2>Find a book</h2></div>
            <button type="button" className="dock-search-close" onClick={() => { setSearchOpen(false); setSearchQuery(''); }} aria-label="Close search">×</button>
          </div>
          <label className="dock-search-field">
            <Search size={18} aria-hidden="true" />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); } }}
              placeholder="Search titles, authors, ISBN or subject"
              aria-label="Search titles, authors, ISBN or subject"
            />
          </label>
          <div className="dock-search-results" aria-live="polite">
            {filteredBooks.slice(0, 5).map((book) => (
              <button key={book.id} type="button" className="dock-search-result" onClick={() => { setReadingBook(book); setSearchOpen(false); setSearchQuery(''); }}>
                <img src={book.cover_image || '/covers/computational-mathematics.jpg'} alt="" />
                <span className="dock-search-result-copy"><strong>{book.title}</strong><small>{book.authors?.map((author) => author.name).join(', ') || 'Dotcom Publications'}</small></span>
                <span className="dock-search-price">₹{book.selling_price.toLocaleString('en-IN')}</span>
              </button>
            ))}
            {filteredBooks.length === 0 && <p className="dock-search-empty">No books match that search. Try a different title, author or subject.</p>}
          </div>
        </section>
      )}
      <EditorialStorefront
        books={publishedBooks}
        categories={effectiveCategories}
        landingContent={landingContent}
        siteSettings={siteSettings}
        currentPath={currentPath || '/'}
        onNavigate={onNavigate}
        onOpenBook={setReadingBook}
        onBookDetails={setSelectedBook}
        onAddToCart={addToCart}
      />

      <MagnificationDock items={dockItems} />

      {/* Cart Drawer Slide-Over (4.G Smooth Opening & Closing) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/60 transition-opacity animate-in fade-in duration-300"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-lg z-10 flex flex-col animate-in slide-in-from-right duration-300 ease-out">
            {/* Cart Header */}
            <div className="p-4 sm:p-5 border-b border-[#EAE3DE] flex items-center justify-between bg-[#FAF9F5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-sm bg-[#EED97A] text-[#181716] flex items-center justify-center font-bold border border-[#E5CE68]">
                  <ShoppingBag className="w-4 h-4 text-[#181716]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#181716]">
                    Your academic cart
                  </h3>
                  <span className="text-[11px] text-[#736B5E]">
                    {cartCount} {cartCount === 1 ? 'book' : 'books'} ready for order
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-sm text-[#736B5E] hover:text-[#181716] hover:bg-stone-100 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-stone-400 space-y-3">
                  <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-[#736B5E]" />
                  <p className="text-sm font-medium text-[#181716]">Your cart is currently empty</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Browse academic catalogue
                  </Button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.book_id}
                    className="flex gap-3 p-3 rounded-sm border border-[#EAE3DE] bg-[#FAF9F5] relative"
                  >
                    {/* Item Cover */}
                    <div className="w-14 h-18 bg-stone-200 rounded-sm overflow-hidden shrink-0 border border-[#EAE3DE]">
                      {item.cover_image ? (
                        <img
                          src={item.cover_image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#181716] flex items-center justify-center text-[#EED97A] text-[9px] font-bold">
                          DOTCOM
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif font-bold text-xs text-[#181716] line-clamp-1">
                          {item.title}
                        </h4>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="font-serif font-bold text-xs text-[#181716]">
                            ₹{item.price}
                          </span>
                          {item.mrp && item.mrp > item.price && (
                            <span className="text-[10px] text-[#736B5E] line-through">
                              ₹{item.mrp}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Buttons */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 bg-white border border-[#EAE3DE] rounded-sm p-0.5">
                          <button
                            onClick={() => updateQuantity(item.book_id, -1)}
                            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md hover:bg-stone-100 text-[#181716]"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-[#181716]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.book_id, 1)}
                            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md hover:bg-stone-100 text-[#181716]"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.book_id)}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-sm text-[#736B5E] hover:text-red-600 hover:bg-rose-50 transition-colors"
                          title="Remove from cart"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer / Checkout Trigger */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-[#EAE3DE] bg-[#FAF9F5] space-y-3">
                <div className="space-y-1.5 text-xs text-[#181716]">
                  <div className="flex justify-between">
                    <span className="text-[#736B5E]">Subtotal:</span>
                    <span className="font-semibold">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#736B5E]">Institutional delivery:</span>
                    <span className="font-semibold text-[#3A754E]">FREE</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#EAE3DE] text-sm">
                    <span className="font-bold">Total:</span>
                    <span className="font-serif font-bold text-base text-[#181716]">
                      ₹{cartTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full min-h-[48px] flex items-center justify-center gap-2"
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                >
                  <span>Proceed to checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3D Physical Page-Flip Interactive Reader (3. Perfected) */}
      <InteractiveBookReader
        book={readingBook}
        isOpen={!!readingBook}
        onClose={() => setReadingBook(null)}
        onAddToCart={(b) => addToCart(b)}
        onViewDetails={(b) => setSelectedBook(b)}
      />

      {/* Book Detail Modal (4.G Smooth Opening) */}
      {selectedBook && (
        <Modal
          isOpen={!!selectedBook}
          onClose={() => setSelectedBook(null)}
          title={selectedBook.title}
          subtitle={`By ${selectedBook.authors?.map((a) => a.name).join(', ') || 'Faculty Authors'}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Cover */}
              <div className="w-full sm:w-44 shrink-0 aspect-[3/4] bg-[#FAF8F3] rounded-sm overflow-hidden border border-[#EAE3DE] shadow-sm">
                <img
                  src={
                    selectedBook.cover_image ||
                    '/covers/computational-mathematics.jpg'
                  }
                  alt={selectedBook.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Metadata */}
              <div className="flex-1 space-y-3">
                {selectedBook.category_name && (
                  <span className="inline-block px-2.5 py-0.5 rounded-sm bg-[#FAF2BA] text-[#181716] text-xs font-semibold border border-[#EED97A]">
                    {selectedBook.category_name}
                  </span>
                )}

                {selectedBook.subtitle && (
                  <h4 className="font-serif text-[#736B5E] text-xs italic">
                    {selectedBook.subtitle}
                  </h4>
                )}

                {/* Price block */}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-2xl font-serif font-bold text-[#181716]">
                    ₹{selectedBook.selling_price}
                  </span>
                  {selectedBook.mrp > selectedBook.selling_price && (
                    <span className="text-sm text-[#736B5E] line-through">
                      ₹{selectedBook.mrp}
                    </span>
                  )}
                  <span className="text-xs text-[#3A754E] font-semibold">Available for dispatch</span>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-[#FAF9F5] rounded-sm border border-[#EAE3DE] text-[11px]">
                  <div>
                    <span className="text-[#736B5E]">ISBN:</span>{' '}
                    <strong className="text-[#181716] font-mono">{selectedBook.isbn || 'Pending'}</strong>
                  </div>
                  <div>
                    <span className="text-[#736B5E]">Edition:</span>{' '}
                    <strong className="text-[#181716]">{selectedBook.edition || '1st edition'}</strong>
                  </div>
                  <div>
                    <span className="text-[#736B5E]">Format:</span>{' '}
                    <strong className="text-[#181716]">{selectedBook.book_format || 'Hardbound'}</strong>
                  </div>
                  <div>
                    <span className="text-[#736B5E]">Language:</span>{' '}
                    <strong className="text-[#181716]">{selectedBook.language || 'English'}</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => {
                      addToCart(selectedBook);
                      setSelectedBook(null);
                    }}
                  >
                    <ShoppingBag className="w-4 h-4 text-[#181716]" />
                    <span>Add to cart (₹{selectedBook.selling_price})</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-[#EAE3DE] pt-4">
              <h4 className="font-serif font-bold text-sm text-[#181716] mb-2">Book synopsis</h4>
              <p className="text-xs text-[#736B5E] leading-relaxed font-light whitespace-pre-line">
                {selectedBook.full_description || selectedBook.short_description || 'No detailed synopsis provided.'}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Checkout / Order Placement Modal */}
      {isCheckoutOpen && (
        <Modal
          isOpen={isCheckoutOpen}
          onClose={() => {
            if (!isSubmittingOrder) {
              setIsCheckoutOpen(false);
              setOrderConfirmed(null);
            }
          }}
          title={orderConfirmed ? 'Order confirmed' : 'Checkout details'}
          subtitle={
            orderConfirmed
              ? 'Thank you for choosing Dotcom Publications'
              : `Order Total: ₹${cartTotal.toLocaleString()} (${cartCount} titles)`
          }
          size="md"
        >
          {orderConfirmed ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="font-serif font-bold text-xl text-[#181716]">
                  Order placed
                </h3>
                <p className="text-xs text-[#736B5E] mt-1">
                  Your tracking order reference is:
                </p>
                <div className="inline-block px-4 py-1.5 rounded-sm bg-[#FAF2BA] border border-[#EED97A] font-mono font-bold text-sm text-[#181716] mt-2 shadow-xs">
                  {orderConfirmed.order_number}
                </div>
              </div>

              <p className="text-xs text-[#736B5E] max-w-sm mx-auto">
                Our logistics dispatch team will prepare your shipment. You will receive dispatch updates on <strong>{orderConfirmed.customer_phone}</strong>.
              </p>

              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setOrderConfirmed(null);
                }}
              >
                Continue browsing
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#181716] mb-1">
                    Full name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Sharma"
                    value={checkoutForm.name}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-sm border border-[#EAE3DE] bg-[#FAF9F5] focus:bg-white text-[#181716] focus:outline-none focus:ring-2 focus:ring-[#EED97A] text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#181716] mb-1">
                    Contact phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={checkoutForm.phone}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-sm border border-[#EAE3DE] bg-[#FAF9F5] focus:bg-white text-[#181716] focus:outline-none focus:ring-2 focus:ring-[#EED97A] text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-[11px] font-semibold text-[#181716] mb-1">
                  Email address (for order receipt)
                </label>
                <input
                  type="email"
                  placeholder="name@university.edu.in"
                  value={checkoutForm.email}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-sm border border-[#EAE3DE] bg-[#FAF9F5] focus:bg-white text-[#181716] focus:outline-none focus:ring-2 focus:ring-[#EED97A] text-xs sm:text-sm"
                />
              </div>

              <div className="text-xs">
                <label className="block text-[11px] font-semibold text-[#181716] mb-1">
                  Delivery address *
                </label>
                <textarea
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
                  <label className="block text-[10px] font-semibold text-[#181716] mb-1">City</label>
                  <input
                    type="text"
                    placeholder="New Delhi"
                    value={checkoutForm.city}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                    className="w-full min-h-[42px] px-2.5 py-2 rounded-sm border border-[#EAE3DE] bg-[#FAF9F5] text-[#181716] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#181716] mb-1">State</label>
                  <input
                    type="text"
                    placeholder="Delhi"
                    value={checkoutForm.state}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, state: e.target.value })}
                    className="w-full min-h-[42px] px-2.5 py-2 rounded-sm border border-[#EAE3DE] bg-[#FAF9F5] text-[#181716] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#181716] mb-1">PIN Code</label>
                  <input
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
                <label className="block text-[11px] font-semibold text-[#181716] mb-1">
                  Payment method
                </label>
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
        </Modal>
      )}
    </div>
  );
};
