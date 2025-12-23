// Глобальні змінні
let allProducts = []
let filteredProducts = []

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

// Відображення товарів на сторінці
function displayProducts(products) {
    const productsList = document.querySelector('#products-list')
    if (!productsList) return

    productsList.innerHTML = ''
    
    if (products.length === 0) {
        productsList.innerHTML = '<div class="col-12 text-center"><p class="text-muted">Товари не знайдено</p></div>'
        return
    }

    products.forEach(function(product) {
        productsList.innerHTML += getCardHTML(product)
    })

    // Додаємо обробники подій для кнопок "Купити"
    const buyButtons = document.querySelectorAll('.add-to-cart-btn')
    buyButtons.forEach(function(button) {
        button.addEventListener('click', addToCart)
    })
}

// Функція додавання товару до кошика
function addToCart(event) {
    const productData = event.target.closest('.add-to-cart-btn').getAttribute('data-product')
    const product = JSON.parse(productData)
    cart.addItem(product)
}

// Отримання унікальних категорій
function getCategories(products) {
    const categories = new Set()
    products.forEach(product => {
        if (product.category) {
            categories.add(product.category)
        }
    })
    return Array.from(categories)
}

// Заповнення фільтра категорій
function populateCategoryFilter(categories) {
    const categoryFilter = document.querySelector('#category-filter')
    if (!categoryFilter) return

    categories.forEach(category => {
        const option = document.createElement('option')
        option.value = category
        option.textContent = category
        categoryFilter.appendChild(option)
    })
}

// Застосування фільтрів
function applyFilters() {
    const categoryFilter = document.querySelector('#category-filter').value
    const sortFilter = document.querySelector('#sort-filter').value
    const searchInput = document.querySelector('#search-input').value.toLowerCase()

    // Фільтрація за категорією
    filteredProducts = allProducts.filter(product => {
        if (categoryFilter !== 'all' && product.category !== categoryFilter) {
            return false
        }
        return true
    })

    // Пошук за назвою
    if (searchInput) {
        filteredProducts = filteredProducts.filter(product => {
            return product.title.toLowerCase().includes(searchInput)
        })
    }

    // Сортування
    switch(sortFilter) {
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price)
            break
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price)
            break
        case 'name':
            filteredProducts.sort((a, b) => a.title.localeCompare(b.title))
            break
    }

    displayProducts(filteredProducts)
}

// Ініціалізація сторінки
getProducts().then(function(products) {
    allProducts = products
    filteredProducts = products

    // Заповнюємо фільтр категорій
    const categories = getCategories(products)
    populateCategoryFilter(categories)

    // Відображаємо всі товари
    displayProducts(products)

    // Додаємо обробники для фільтрів
    document.querySelector('#category-filter').addEventListener('change', applyFilters)
    document.querySelector('#sort-filter').addEventListener('change', applyFilters)
    document.querySelector('#search-input').addEventListener('input', applyFilters)

    // Кнопка застосувати (якщо є)
    const applyBtn = document.querySelector('#apply-filters')
    if (applyBtn) applyBtn.addEventListener('click', applyFilters)

    // Підтримка параметрів URL: ?cat=CategoryName&brand=BrandName&search=...
    const urlParams = new URLSearchParams(window.location.search)
    const catParam = urlParams.get('cat')
    const brandParam = urlParams.get('brand')
    const searchParam = urlParams.get('search')
    if (catParam) {
        const select = document.querySelector('#category-filter')
        if (select) {
            // Якщо значення не в списку, додаємо його тимчасово
            if (![...select.options].some(o => o.value === catParam)) {
                const opt = document.createElement('option')
                opt.value = catParam
                opt.textContent = catParam
                select.appendChild(opt)
            }
            select.value = catParam
        }
    }
    if (searchParam) {
        const searchInput = document.querySelector('#search-input')
        if (searchInput) searchInput.value = searchParam
    }
    // Виконуємо фільтрацію після встановлення параметрів
    if (catParam || brandParam || searchParam) {
        applyFilters()
    }
})