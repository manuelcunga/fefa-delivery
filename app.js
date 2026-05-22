 const JosefaApp = {
   cart: [],
   
   init() {
     this.injectGlobalStyles();
     this.loadCart();
     this.updateCartBadge();
     this.bindEvents();
     this.highlightCurrentPage();
   },
   
   injectGlobalStyles() {
     if (document.getElementById('josefa-global-styles')) return;
     
     const style = document.createElement('style');
     style.id = 'josefa-global-styles';
     style.textContent = `
       * {
         -webkit-tap-highlight-color: transparent;
       }
       
       a, button, [data-media-type="banani-button"], [data-add-to-cart] {
         cursor: pointer !important;
       }
       
       a:hover {
         opacity: 0.9;
       }
       
       button:hover {
         transform: translateY(-1px);
         box-shadow: 0 4px 12px rgba(180, 62, 18, 0.2);
       }
       
       button:active {
         transform: translateY(0);
       }
       
       [class*="bg-market-clay"]:hover {
         filter: brightness(1.1);
       }
       
       .transition, [class*="transition-"] {
         transition: all 0.2s ease !important;
       }
       
       html {
         scroll-behavior: smooth;
       }
       
       ::-webkit-scrollbar {
         width: 8px;
         height: 8px;
       }
       
       ::-webkit-scrollbar-track {
         background: #faf7f2;
       }
       
       ::-webkit-scrollbar-thumb {
         background: rgba(180, 62, 18, 0.3);
         border-radius: 4px;
       }
       
       ::-webkit-scrollbar-thumb:hover {
         background: rgba(180, 62, 18, 0.5);
       }
       
       #mobile-nav a {
         transition: all 0.2s ease;
       }
       
       #mobile-nav a:hover {
         background: #fff7ed;
         border-radius: 8px;
       }
       
       input {
         transition: all 0.2s ease;
       }
       
       input:focus {
         box-shadow: 0 0 0 3px rgba(180, 62, 18, 0.1);
       }
     `;
     document.head.appendChild(style);
   },
  
  loadCart() {
    const saved = localStorage.getItem('josefa-cart');
    if (saved) {
      this.cart = JSON.parse(saved);
    }
  },
  
  saveCart() {
    localStorage.setItem('josefa-cart', JSON.stringify(this.cart));
  },
  
  addToCart(product) {
    const existing = this.cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        image: product.image,
        category: product.category,
        quantity: 1
      });
    }
    this.saveCart();
    this.updateCartBadge();
    this.showToast(`${product.name} adicionado ao carrinho!`);
  },
  
  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCartBadge();
    if (window.location.pathname.includes('carrinho.html')) {
      this.renderCart();
    }
  },
  
  updateQuantity(productId, delta) {
    const item = this.cart.find(i => i.id === productId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        this.saveCart();
        this.updateCartBadge();
        if (window.location.pathname.includes('carrinho.html')) {
          this.renderCart();
        }
      }
    }
  },
  
  getCartTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
  
  getCartCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  },
  
  updateCartBadge() {
    const badges = document.querySelectorAll('[data-cart-badge]');
    const count = this.getCartCount();
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  },
  
  renderCart() {
    const container = document.getElementById('cart-items');
    const emptyState = document.getElementById('cart-empty');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!container) return;
    
    if (this.cart.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      if (cartSummary) cartSummary.style.display = 'none';
      return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';
    
    container.innerHTML = this.cart.map(item => `
      <div class="flex items-center gap-4 p-4 bg-white rounded-2xl border border-market-clay/10">
        <div class="w-20 h-20 bg-muted rounded-xl overflow-hidden flex-shrink-0">
          ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover" />` : 
            `<div class="w-full h-full bg-market-clay-light flex items-center justify-center">
              <iconify-icon icon="lucide:package" class="text-market-clay size-8"></iconify-icon>
            </div>`}
        </div>
        <div class="flex-1">
          <h4 class="font-bold text-market-dark">${item.name}</h4>
          <p class="text-xs text-muted-foreground">${item.unit || 'Unidade'}</p>
          <p class="font-bold text-market-clay mt-1">${this.formatPrice(item.price)}</p>
        </div>
        <div class="flex items-center gap-3">
          <button onclick="JosefaApp.updateQuantity('${item.id}', -1)" 
            class="w-8 h-8 rounded-lg bg-market-cream flex items-center justify-center text-market-clay font-bold hover:bg-market-clay-light transition-colors">
            -
          </button>
          <span class="font-bold w-8 text-center">${item.quantity}</span>
          <button onclick="JosefaApp.updateQuantity('${item.id}', 1)" 
            class="w-8 h-8 rounded-lg bg-market-cream flex items-center justify-center text-market-clay font-bold hover:bg-market-clay-light transition-colors">
            +
          </button>
        </div>
        <button onclick="JosefaApp.removeFromCart('${item.id}')" 
          class="text-rose-400 hover:text-rose-500 p-2 transition-colors">
          <iconify-icon icon="lucide:trash-2" class="size-5"></iconify-icon>
        </button>
      </div>
    `).join('');
    
    const totalEl = document.getElementById('cart-total');
    if (totalEl) {
      totalEl.textContent = this.formatPrice(this.getCartTotal());
    }
  },
  
  formatPrice(price) {
    return price.toLocaleString('pt-AO') + ' Kz';
  },
  
  showToast(message) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-market-dark text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 text-sm font-medium transition-all duration-300';
      document.body.appendChild(toast);
    }
    
    toast.innerHTML = `<iconify-icon icon="lucide:check-circle" class="text-emerald-400"></iconify-icon>${message}`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
    }, 2500);
  },
  
   bindEvents() {
      this.autoDiscoverProducts();
      this.bindProductCardNavigation();
      
      document.addEventListener('click', (e) => {
        const orderBtn = e.target.closest('[data-add-to-cart]');
        if (orderBtn) {
          const product = {
            id: orderBtn.dataset.productId || 'prod-' + Date.now(),
            name: orderBtn.dataset.productName || 'Produto',
            price: parseFloat(orderBtn.dataset.productPrice) || 0,
            unit: orderBtn.dataset.productUnit || 'Kg',
            image: orderBtn.dataset.productImage || '',
            category: orderBtn.dataset.productCategory || ''
          };
          this.addToCart(product);
        }
      });
      
      if (document.getElementById('cart-items')) {
        this.renderCart();
      }
    },
    
    bindProductCardNavigation() {
      document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
        const card = btn.closest('[class*="p-4"][class*="flex"][class*="flex-col"]') ||
                     btn.closest('[class*="rounded-2xl"][class*="shadow"]');
        if (!card || card.dataset.productNav) return;
        card.dataset.productNav = 'true';
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
          if (e.target.closest('[data-add-to-cart]') || e.target.closest('button')) return;
          const productId = btn.dataset.productId;
          if (productId) {
            window.location.href = `detalhe-produto.html?id=${productId}`;
          }
        });
      });
    },
   
   autoDiscoverProducts() {
     const orderButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
       btn.textContent.includes('Pedir') || 
       (btn.querySelector('span') && btn.querySelector('span').textContent.includes('Pedir'))
     );
     
     orderButtons.forEach((btn, index) => {
       if (btn.hasAttribute('data-add-to-cart')) return;
       
       const card = btn.closest('.p-4.flex.flex-col') || 
                    btn.closest('[class*="bg-white"]') ||
                    btn.parentElement.parentElement.parentElement;
       
       if (!card) return;
       
       const nameEl = card.querySelector('h4');
       const name = nameEl ? nameEl.textContent.trim() : `Produto ${index + 1}`;
       
       let price = 0;
       const priceRegex = /([\d.,]+)\s*[Kk][Zz]/;
       const cardText = card.textContent;
       const priceMatch = cardText.match(priceRegex);
       if (priceMatch) {
         price = parseInt(priceMatch[1].replace(/[.,\s]/g, ''));
       }
       
       let category = '';
       const categoryTags = ['Produtos da Terra', 'Peixaria', 'Hortaliças', 'Frutas', 'Talho', 'Cereais'];
       for (const tag of categoryTags) {
         if (cardText.includes(tag)) {
           category = tag;
           break;
         }
       }
       
       let unit = 'Kg';
       if (cardText.includes('Palma')) unit = 'Palma';
       if (cardText.includes('Unidade')) unit = 'Unidade';
       if (cardText.includes('Penca')) unit = 'Penca';
       
       let image = '';
       const imgEl = card.querySelector('img');
       if (imgEl && imgEl.src) {
         image = imgEl.src;
       }
       
       const productId = name.toLowerCase()
         .replace(/[^a-z0-9áàâãéèêíïóôõöúüñç\s]/g, '')
         .replace(/\s+/g, '-')
         .trim() || `produto-${index}`;
       
       btn.setAttribute('data-add-to-cart', '');
       btn.setAttribute('data-product-id', productId);
       btn.setAttribute('data-product-name', name);
       btn.setAttribute('data-product-price', price);
       btn.setAttribute('data-product-unit', unit);
       btn.setAttribute('data-product-category', category);
       btn.setAttribute('data-product-image', image);
       
       btn.style.cursor = 'pointer';
     });
   },
  
  setupMobileNav() {
    const mobileNav = document.createElement('nav');
    mobileNav.id = 'mobile-nav';
    mobileNav.className = 'fixed bottom-0 left-0 right-0 bg-white border-t border-market-clay/10 z-40 md:hidden';
    
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';
    
    const navItems = [
      { page: 'home.html', icon: 'lucide:home', label: 'Início' },
      { page: 'categorias.html', icon: 'lucide:grid-3x3', label: 'Categorias' },
      { page: 'carrinho.html', icon: 'lucide:shopping-bag', label: 'Carrinho', badge: true },
      { page: 'perfil.html', icon: 'lucide:user', label: 'Perfil' }
    ];
    
    mobileNav.innerHTML = `
      <div class="flex items-center justify-around py-3 px-2">
        ${navItems.map(item => {
          const isActive = currentPage === item.page || (item.page === 'home.html' && currentPage === '');
          return `
            <a href="${item.page}" class="flex flex-col items-center gap-1 px-4 py-1 relative ${isActive ? 'text-market-clay' : 'text-muted-foreground'} transition-colors">
              <iconify-icon icon="${item.icon}" class="size-5"></iconify-icon>
              <span class="text-[10px] font-medium">${item.label}</span>
              ${item.badge ? `<span data-cart-badge class="absolute -top-1 right-1 bg-market-clay text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center" style="display: none;">0</span>` : ''}
            </a>
          `;
        }).join('')}
      </div>
    `;
    
    document.body.appendChild(mobileNav);
    document.body.style.paddingBottom = '70px';
  },
  
  highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (href === 'home.html' && currentPage === '')) {
        link.classList.add('text-market-yellow', 'font-bold');
      }
    });
  },
  
  clearCart() {
    this.cart = [];
    this.saveCart();
    this.updateCartBadge();
    if (window.location.pathname.includes('carrinho.html')) {
      this.renderCart();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => JosefaApp.init());
