const DATA_URL = 'data.json';

let products = [];
let config = {};

const modal = document.getElementById('product-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');
let currentCategory = "Todos";
let currentSearch = "";
let visibleCount = 20;
const ITEMS_PER_PAGE = 20;

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
}

async function initializeApp() {
    try {
        const data = await fetchData(DATA_URL);
        
        config = data.config || {};
        products = data.products || [];
        
        // Actualizar UI básica
        document.getElementById('site-logo').innerText = config.logo_nombre || 'Beauty Bloom';
        document.getElementById('footer-text').innerText = config.footer_texto || '© 2023 Beauty Bloom';

        generateCategoryFilters();
        loadProducts();
    } catch (error) {
        console.error("Error cargando datos:", error);
    }
}

function generateCategoryFilters() {
    const container = document.getElementById('category-filters');
    const categories = ['Todos', ...new Set(products.map(p => p.category))];
    
    container.innerHTML = categories.map(cat => `
        <button class="filter-btn ${cat === 'Todos' ? 'active' : ''}" data-category="${cat}">
            ${cat}
        </button>
    `).join('');

    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            visibleCount = ITEMS_PER_PAGE;
            loadProducts();
        });
    });
}

function loadProducts() {
    const container = document.getElementById('catalog-container');
    container.innerHTML = ''; // Limpiar el contenedor antes de cargar
    
    const filteredProducts = products.filter(p => {
        const matchesCategory = currentCategory === "Todos" || p.category === currentCategory;
        const matchesSearch = p.name.toLowerCase().includes(currentSearch.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const displayedProducts = filteredProducts.slice(0, visibleCount);

    displayedProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.images[0]}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">${product.price}</p>
            </div>
        `;

        // Evento para abrir modal
        card.addEventListener('click', () => showProductDetails(product));
        
        container.appendChild(card);
    });

    const loadMoreBtn = document.getElementById('load-more');
    if (visibleCount < filteredProducts.length) {
        loadMoreBtn.style.display = 'inline-block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

function showProductDetails(product) {
    let currentSlide = 0;
    const images = product.images;

    modalBody.innerHTML = `
        <div class="modal-grid">
            <div class="carousel">
                <div class="carousel-inner">
                    ${images.map((img, index) => `
                        <img src="${img}" class="carousel-item ${index === 0 ? 'active' : ''}" alt="${product.name}">
                    `).join('')}
                </div>
                ${images.length > 1 ? `
                    <button class="carousel-control prev">&lsaquo;</button>
                    <button class="carousel-control next">&rsaquo;</button>
                    <div class="carousel-indicators">
                        ${images.map((_, index) => `
                            <span class="indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="modal-info-side">
                <h2 style="font-family: 'Playfair Display', serif; margin-bottom: 10px;">${product.name}</h2>
                <p style="color: #888; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px;">${product.category}</p>
                <p style="margin: 15px 0;">${product.description}</p>
                <p class="price" style="font-size: 1.5rem;">${product.price}</p>
                <button id="buy-now-btn" class="filter-btn active" style="width: 100%; margin-top: 20px;">Comprar ahora</button>
            </div>
        </div>
    `;

    const buyNowBtn = modalBody.querySelector('#buy-now-btn');
    buyNowBtn.addEventListener('click', () => {
        const message = `¡Hola! Me interesa comprar el producto: ${product.name} (${product.price})`;
        const whatsappUrl = `https://wa.me/${config.contacto_whatsapp_link}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    });

    if (images.length > 1) {
        const items = modalBody.querySelectorAll('.carousel-item');
        const indicators = modalBody.querySelectorAll('.indicator');

        const showSlide = (index) => {
            items[currentSlide].classList.remove('active');
            indicators[currentSlide].classList.remove('active');
            currentSlide = (index + images.length) % images.length;
            items[currentSlide].classList.add('active');
            indicators[currentSlide].classList.add('active');
        };

        modalBody.querySelector('.next').addEventListener('click', () => showSlide(currentSlide + 1));
        modalBody.querySelector('.prev').addEventListener('click', () => showSlide(currentSlide - 1));
        indicators.forEach(ind => {
            ind.addEventListener('click', () => showSlide(parseInt(ind.dataset.index)));
        });
    }

    modal.style.display = 'flex';
}

function showAboutInfo() {
    modalBody.innerHTML = `
        <div style="padding: 10px;">
            <h2 style="font-family: 'Playfair Display', serif; margin-bottom: 20px;">${config.nosotros_titulo || 'Sobre Nosotros'}</h2>
            <p>${config.nosotros_texto || 'Cargando información...'}</p>
            ${config.nosotros_imagen ? `<img src="${config.nosotros_imagen}" style="width: 100%; border-radius: 15px; margin-top: 20px;">` : ''}
        </div>
    `;
    modal.style.display = 'flex';
}

function showContactInfo() {
    modalBody.innerHTML = `
        <div style="padding: 10px;">
            <h2 style="font-family: 'Playfair Display', serif; margin-bottom: 20px;">Contacto</h2>
            <p>¡Nos encantaría saber de ti! Puedes contactarnos a través de los siguientes medios:</p>
            <ul style="list-style: none; margin-top: 20px; line-height: 2.5;">
                <li><strong>📍 Ubicación:</strong> ${config.contacto_ubicacion || 'N/A'}</li>
                <li><strong>📱 WhatsApp:</strong> ${config.contacto_whatsapp || 'N/A'}</li>
                <li><strong>📧 Correo:</strong> ${config.contacto_email || 'N/A'}</li>
            </ul>
            <a href="https://wa.me/${config.contacto_whatsapp_link}" target="_blank" class="filter-btn active" style="display: block; text-align: center; text-decoration: none; margin-top: 30px;">Chatear en WhatsApp</a>
        </div>
    `;
    modal.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();

    const searchInput = document.getElementById('product-search');
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        visibleCount = ITEMS_PER_PAGE;
        loadProducts();
    });

    const loadMoreBtn = document.getElementById('load-more');
    loadMoreBtn.addEventListener('click', () => {
        visibleCount += ITEMS_PER_PAGE;
        loadProducts();
    });

    const menuToggle = document.getElementById('menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinksContainer.classList.toggle('active');
    });

    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            navLinksContainer.classList.remove('active');
            if (href === '#nosotros') {
                e.preventDefault();
                showAboutInfo();
            } else if (href === '#contacto') {
                e.preventDefault();
                showContactInfo();
            }
        });
    });

    // Cerrar modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});