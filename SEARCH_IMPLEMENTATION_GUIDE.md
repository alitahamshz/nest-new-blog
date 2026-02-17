# راهنمای پیاده‌سازی جستجو محصول و دسته‌بندی

## بررسی کلی

سیستم جستجو شامل سه بخش است:
1. **فیلد جستجو در سایت** - نمایش نتایج خلاصه در popup
2. **صفحه جستجو مخصوص** - نمایش تمام نتایج با صفحه‌بندی

---

## API Endpoint

**URL:** `GET /api/products/search`

**پارامترهای Query:**
- `q` (required): متن جستجو
- `page` (optional): صفحه محصولات (پیش‌فرض: 1)
- `limit` (optional): تعداد محصولات در هر صفحه (پیش‌فرض: 20)

**مثال:**
```
GET /api/products/search?q=گوشی&page=1&limit=20
```

---

## 1. فیلد جستجو در Navbar سایت

### HTML & React Component

```jsx
// SearchInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import './SearchInput.css';

export function SearchInput() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);

  // جستجو هنگام تایپ
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch();
      } else {
        setResults(null);
        setShowPopup(false);
      }
    }, 300); // debounce 300ms

    return () => clearTimeout(timer);
  }, [query]);

  // بستن popup هنگام کلیک بیرون
  useEffect(() => {
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowPopup(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setResults(data);
      setShowPopup(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToSearchPage = () => {
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  return (
    <div className="search-container" ref={popupRef}>
      <input
        type="text"
        placeholder="جستجو برای محصول..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />

      {showPopup && results && (
        <div className="search-popup">
          {loading && <div className="loading">در حال جستجو...</div>}

          {/* محصولات */}
          {results.products?.data?.length > 0 && (
            <div className="popup-section">
              <h4>محصولات ({results.products.total})</h4>
              <div className="products-list">
                {results.products.data.map((product) => (
                  <div key={product.id} className="product-item">
                    <img src={product.mainImage} alt={product.name} />
                    <div className="product-info">
                      <h5>{product.name}</h5>
                      <p className="price">
                        {product.minPrice?.toLocaleString('fa-IR')} تا{' '}
                        {product.maxPrice?.toLocaleString('fa-IR')} تومان
                      </p>
                      {/* نمایش مسیر دسته‌بندی */}
                      <div className="breadcrumb">
                        {product.categoryPath?.map((cat, idx) => (
                          <span key={cat.id}>
                            {cat.name}
                            {idx < product.categoryPath.length - 1 && ' / '}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {results.products.total > 5 && (
                <button className="view-more-btn" onClick={goToSearchPage}>
                  مشاهده تمام محصولات ({results.products.total})
                </button>
              )}
            </div>
          )}

          {/* دسته‌بندی‌ها */}
          {results.categories?.data?.length > 0 && (
            <div className="popup-section">
              <h4>دسته‌بندی‌ها</h4>
              <div className="categories-list">
                {results.categories.data.map((category) => (
                  <a
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="category-item"
                  >
                    {category.name}
                    <span className="count">
                      ({category.productCount} محصول)
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* نتیجه نیافت */}
          {!loading &&
            results.products?.data?.length === 0 &&
            results.categories?.data?.length === 0 && (
              <div className="no-results">نتیجه‌ای یافت نشد</div>
            )}
        </div>
      )}
    </div>
  );
}
```

### CSS Styling

```css
/* SearchInput.css */

.search-container {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  direction: rtl;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.search-popup {
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 500px;
  overflow-y: auto;
  margin-top: 8px;
  z-index: 1000;
}

.popup-section {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.popup-section:last-child {
  border-bottom: none;
}

.popup-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-item {
  display: flex;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.product-item:hover {
  background-color: #f5f5f5;
}

.product-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.product-info {
  flex: 1;
}

.product-info h5 {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #333;
}

.price {
  color: #28a745;
  font-weight: 600;
  font-size: 12px;
  margin: 4px 0;
}

.breadcrumb {
  font-size: 11px;
  color: #999;
}

.breadcrumb span {
  margin: 0 4px;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  padding: 8px 12px;
  background: #f9f9f9;
  border-radius: 4px;
  text-decoration: none;
  color: #007bff;
  font-size: 13px;
  transition: background-color 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-item:hover {
  background: #f0f0f0;
}

.category-item .count {
  color: #999;
  font-size: 11px;
}

.view-more-btn {
  width: 100%;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  margin-top: 8px;
  transition: background-color 0.2s;
}

.view-more-btn:hover {
  background: #0056b3;
}

.loading {
  padding: 16px;
  text-align: center;
  color: #999;
  font-size: 13px;
}

.no-results {
  padding: 16px;
  text-align: center;
  color: #999;
  font-size: 13px;
}
```

---

## 2. صفحه جستجو مخصوص

### React Component

```jsx
// SearchPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './SearchPage.css';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // بارگذاری نتایج
  useEffect(() => {
    if (query.trim().length === 0) return;

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/products/search?q=${encodeURIComponent(query)}&page=${currentPage}&limit=20`
        );
        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError('خطا در بارگذاری نتایج');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, currentPage]);

  const handlePageChange = (newPage) => {
    setSearchParams({ q: query, page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!query) {
    return <div className="search-page">لطفاً یک کلیدواژه وارد کنید</div>;
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>نتایج جستجو برای: "{query}"</h1>
      </div>

      {loading && <div className="loading">در حال بارگذاری نتایج...</div>}
      {error && <div className="error">{error}</div>}

      {results && !loading && (
        <div className="search-results">
          {/* دسته‌بندی‌ها */}
          {results.categories?.data?.length > 0 && (
            <section className="categories-section">
              <h2>دسته‌بندی‌ها</h2>
              <div className="categories-grid">
                {results.categories.data.map((category) => (
                  <a
                    key={category.id}
                    href={`/category/${category.categoryPath
                      .map((c) => c.slug)
                      .join('/')}`}
                    className="category-card"
                  >
                    {category.icon && (
                      <img src={category.icon} alt={category.name} />
                    )}
                    <h3>{category.name}</h3>
                    <p>{category.productCount} محصول</p>
                    <div className="category-breadcrumb">
                      {category.categoryPath.map((cat, idx) => (
                        <span key={cat.id}>
                          {cat.name}
                          {idx < category.categoryPath.length - 1 && ' / '}
                        </span>
                      ))}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* محصولات */}
          <section className="products-section">
            <h2>
              محصولات ({results.products.total} نتیجه)
            </h2>

            {results.products?.data?.length > 0 ? (
              <>
                <div className="products-grid">
                  {results.products.data.map((product) => (
                    <a
                      key={product.id}
                      href={`/product/${product.slug}`}
                      className="product-card"
                    >
                      {product.mainImage && (
                        <img src={product.mainImage} alt={product.name} />
                      )}
                      <div className="product-details">
                        <h3>{product.name}</h3>
                        <p className="description">{product.description}</p>
                        <div className="price-range">
                          {product.minPrice && (
                            <>
                              <span className="min-price">
                                {product.minPrice.toLocaleString('fa-IR')} تومان
                              </span>
                              {product.maxPrice !== product.minPrice && (
                                <span className="max-price">
                                  تا{' '}
                                  {product.maxPrice.toLocaleString('fa-IR')} تومان
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <div className="offers-count">
                          {product.offerCount} فروشنده
                        </div>
                        <div className="breadcrumb">
                          {product.categoryPath?.map((cat, idx) => (
                            <span key={cat.id}>
                              {cat.name}
                              {idx < product.categoryPath.length - 1 && ' / '}
                            </span>
                          ))}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>

                {/* صفحه‌بندی */}
                {results.products.total > results.products.limit && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      صفحه قبل
                    </button>

                    {Array.from(
                      { length: Math.ceil(results.products.total / results.products.limit) },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage ===
                        Math.ceil(results.products.total / results.products.limit)
                      }
                      className="pagination-btn"
                    >
                      صفحه بعد
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-products">
                محصولی یافت نشد
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
```

### CSS برای صفحه جستجو

```css
/* SearchPage.css */

.search-page {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
}

.search-header {
  margin-bottom: 30px;
  border-bottom: 2px solid #eee;
  padding-bottom: 20px;
}

.search-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.loading,
.error {
  text-align: center;
  padding: 20px;
  font-size: 16px;
}

.error {
  color: #dc3545;
  background: #f8d7da;
  border-radius: 4px;
}

/* دسته‌بندی‌ها */
.categories-section {
  margin-bottom: 40px;
}

.categories-section h2 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-card img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 12px;
}

.category-card h3 {
  font-size: 14px;
  color: #333;
  margin: 8px 0;
  text-align: center;
}

.category-card p {
  font-size: 12px;
  color: #999;
  margin: 4px 0;
}

.category-breadcrumb {
  font-size: 10px;
  color: #bbb;
  margin-top: 8px;
  text-align: center;
}

/* محصولات */
.products-section h2 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.product-card {
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-details {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-details h3 {
  font-size: 14px;
  color: #333;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.product-details .description {
  font-size: 12px;
  color: #666;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price-range {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.min-price {
  font-size: 14px;
  color: #28a745;
  font-weight: 600;
}

.max-price {
  font-size: 12px;
  color: #999;
}

.offers-count {
  font-size: 11px;
  color: #007bff;
  margin-bottom: 8px;
}

.breadcrumb {
  font-size: 10px;
  color: #999;
  margin-top: auto;
}

.breadcrumb span {
  margin: 0 2px;
}

.no-products {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 16px;
}

/* صفحه‌بندی */
.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 8px 12px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.pagination-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## 3. Routing (React Router)

```jsx
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SearchPage } from './pages/SearchPage';
import { SearchInput } from './components/SearchInput';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <SearchInput />
      </nav>
      <Routes>
        <Route path="/search" element={<SearchPage />} />
        {/* سایر routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 4. Router Configuration

**صفحات مورد نیاز:**

- **صفحه اصلی:** `/` (فیلد جستجو در navbar)
- **صفحه جستجو:** `/search?q=کلیدواژه&page=1`
- **صفحه محصول:** `/product/:slug`
- **صفحه دسته:** `/category/:slug` یا `/category/:slug1/:slug2` (برای دسته‌های تو در تو)

---

## 5. نکات مهم

### Performance
- ✅ Debounce جستجو (300ms)
- ✅ Limit نتایج popup به 5 محصول
- ✅ Lazy load تصاویر
- ✅ Cache نتایج جستجو

### UX
- ✅ نمایش مسیر دسته کامل (breadcrumb)
- ✅ نمایش تعداد نتایج
- ✅ نمایش تعداد فروشندگان
- ✅ نمایش بازه قیمت

### SEO
- ✅ URL parameters برای جستجو (قابل اشتراک‌گذاری)
- ✅ Meta tags برای صفحه جستجو
- ✅ Breadcrumb schema

---

## 6. مثال استفاده API

### Request
```bash
curl "http://localhost:3000/api/products/search?q=گوشی&page=1&limit=20"
```

### Response
```json
{
  "products": {
    "data": [
      {
        "id": 1,
        "name": "گوشی هوشمند نوکیا",
        "slug": "nokia-smartphone",
        "mainImage": "https://...",
        "description": "...",
        "sku": "NOKIA-001",
        "categoryPath": [
          {
            "id": 1,
            "name": "الکترونیک",
            "slug": "electronics",
            "icon": null
          },
          {
            "id": 2,
            "name": "تلفن همراه",
            "slug": "mobile",
            "icon": null
          }
        ],
        "offerCount": 3,
        "minPrice": 5000000,
        "maxPrice": 7500000
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 20
  },
  "categories": {
    "data": [
      {
        "id": 2,
        "name": "تلفن همراه",
        "slug": "mobile",
        "icon": null,
        "categoryPath": [
          {
            "id": 1,
            "name": "الکترونیک",
            "slug": "electronics",
            "icon": null
          },
          {
            "id": 2,
            "name": "تلفن همراه",
            "slug": "mobile",
            "icon": null
          }
        ],
        "productCount": 245
      }
    ],
    "total": 1
  }
}
```

---

## خلاصه مراحل پیاده‌سازی

1. **BackEnd:** ✅ API آماده است (`/api/products/search`)
2. **FrontEnd:**
   - [ ] Component `SearchInput` برای navbar
   - [ ] Component `SearchPage` برای صفحه جستجو
   - [ ] Styling CSS
   - [ ] Routing setup
   - [ ] Integration با سایر pages

یادتان باشد: دقت داشته باشید که محصولاتی برای نمایش انتخاب کنید که فروشنده آفر کرده است! ✅
