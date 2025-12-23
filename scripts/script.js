// Отримання товарів з JSON файлу
async function getProducts() {
    try {
        const response = await fetch('products.json')
        const products = await response.json()
        return products
    } catch (error) {
        console.error('Помилка завантаження товарів:', error)
        return []
    }
}

// Функція для створення HTML картки товару
function getCardHTML(product) {
    const imgVal = product.image ? String(product.image) : ''
    const imgSrc = (imgVal.startsWith('http') || imgVal.startsWith('/') || imgVal.startsWith('img/')) ? imgVal : `img/${imgVal}`
    return `
        <div class="col-md-4 mb-4">
            <div class="card h-100 product-card">
                 <img src="${imgSrc}" class="card-img-top" alt="${product.title}" 
                     onerror="this.src='img/placeholder.svg'">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.title}</h5>
                    <p class="card-text text-muted">${product.description}</p>
                    <div class="mt-auto">
                        <p class="h5 text-primary mb-3">${product.price} грн</p>
                        <div class="d-flex gap-2">
                            <button class="btn btn-primary-custom flex-grow-1 add-to-cart-btn" 
                                    data-product='${JSON.stringify(product)}'>
                                <i class="bi bi-cart-plus"></i> Додати в кошик
                            </button>
                            <a href="product.html?id=${product.id}" class="btn btn-accent">
                                <i class="bi bi-eye"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
}

// Функція додавання товару до кошика
function animateFlyToCart(imgEl, callback) {
    if (!imgEl) { callback(); return }
    const imgRect = imgEl.getBoundingClientRect()
    const clone = imgEl.cloneNode(true)
    clone.classList.add('fly-image')
    clone.style.width = imgRect.width + 'px'
    clone.style.height = imgRect.height + 'px'
    clone.style.left = imgRect.left + 'px'
    clone.style.top = imgRect.top + 'px'
    clone.style.opacity = '1'
    document.body.appendChild(clone)

    const target = document.getElementById('floating-cart') || document.querySelector('.navbar .bi-cart3')
    const targetRect = target ? target.getBoundingClientRect() : {left: window.innerWidth - 40, top: window.innerHeight - 40}

    // Trigger reflow then move
    requestAnimationFrame(() => {
        const translateX = targetRect.left + (targetRect.width/2) - (imgRect.left + imgRect.width/2)
        const translateY = targetRect.top + (targetRect.height/2) - (imgRect.top + imgRect.height/2)
        clone.style.transform = `translate(${translateX}px, ${translateY}px) scale(0.18)`
        clone.style.opacity = '0.6'
    })

    setTimeout(() => {
        clone.remove()
        callback()
    }, 700)
}

function addToCart(event) {
    // support clicks on icon inside button
    const btn = event.currentTarget || event.target.closest('.add-to-cart-btn') || event.target
    const productData = btn.getAttribute('data-product')
    const product = JSON.parse(productData)

    // find image inside same card
    const card = btn.closest('.product-card') || btn.closest('.card')
    const imgEl = card ? card.querySelector('img') : null

    animateFlyToCart(imgEl, () => {
        cart.addItem(product)
    })
}

// Відображення товарів на головній сторінці (тільки перші 6)
getProducts().then(function(products) {
    const productsList = document.querySelector('#products-list')
    if (productsList) {
        // Показуємо тільки перші 6 товарів на головній
        const featuredProducts = products.slice(0, 6)
        
        featuredProducts.forEach(function(product) {
            productsList.innerHTML += getCardHTML(product)
        })

        // Додаємо обробники подій для кнопок "Купити"
        const buyButtons = document.querySelectorAll('.add-to-cart-btn')
        buyButtons.forEach(function(button) {
            button.addEventListener('click', addToCart)
        })
    }
})

// Поповнення мегаменю динамічно з products.json
async function populateMegamenu() {
    try {
        const resp = await fetch('products.json')
        const products = await resp.json()

        // Отримуємо унікальні категорії
        const categories = Array.from(new Set(products.map(p => p.category || 'Інше'))).slice(0, 20)

        // Простий список брендів: перше слово заголовку (можна змінити)
        const brands = Array.from(new Set(products.map(p => (p.title||'').split(' ')[0]))).slice(0, 20)

        // Новинки — останні 4 за id
        const novelties = products.slice().sort((a,b)=>b.id - a.id).slice(0,4)

        const contentHtml = `
            <div class="row">
                <div class="col-md-4">
                    <h6>Категорії</h6>
                    <ul class="list-unstyled">
                        ${categories.map(c=>`<li><a href="products.html?cat=${encodeURIComponent(c)}">${c}</a></li>`).join('')}
                    </ul>
                </div>
                <div class="col-md-4">
                    <h6>Бренди</h6>
                    <ul class="list-unstyled">
                        ${brands.map(b=>`<li><a href="products.html?brand=${encodeURIComponent(b)}">${b}</a></li>`).join('')}
                    </ul>
                </div>
                <div class="col-md-4">
                    <h6>Новинки</h6>
                    <ul class="list-unstyled">
                        ${novelties.map(n=>`<li><a href="product.html?id=${n.id}">${n.title}</a></li>`).join('')}
                    </ul>
                </div>
            </div>
        `

        document.querySelectorAll('.megamenu .megamenu-content').forEach(el=>{
            el.innerHTML = contentHtml
            // додати tabindex для посилань щоб поліпшити навігацію клавіатурою
            el.querySelectorAll('a').forEach(a=>a.setAttribute('tabindex','0'))
        })

        // Додаємо просту клавіатурну навігацію для dropdown-toggle (відкривання Enter/Space)
        document.querySelectorAll('.nav-item.dropdown > .dropdown-toggle').forEach(toggle=>{
            toggle.addEventListener('keydown', (e)=>{
                if (e.key === 'Enter' || e.key === ' '){
                    e.preventDefault()
                    toggle.click()
                }
            })
        })

    } catch (err) {
        console.error('Не вдалось завантажити продукти для мегаменю', err)
    }
}

// Викликаємо на завантаженні сторінки
document.addEventListener('DOMContentLoaded', populateMegamenu)