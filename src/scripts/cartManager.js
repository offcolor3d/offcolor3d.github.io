/* OBTENCION DE DATOS DE LA API */

import { ENDPOINTS } from "../config/api";

//Obtiene los datos de un producto.
async function getProduct(id){
    try{
        const response = await fetch(ENDPOINTS.products.getById(id));

        if (!response.ok) throw new Error("Error al obtener el producto");
            
        const product = await response.json(); // Obtenemos el producto de la API

        return product;
    }
    catch (error) {
        console.error(`Error cargando el producto ${id}:`, error);
    }
}

//Obtiene el precio total de todos los elementos del carrito.
async function getTotalPrice(productList){
    try {
        //Mandamos los datos a la API.
        const totalResponse = await fetch(ENDPOINTS.products.priceOf, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productList)
        });

        //Si da error se manda el error a consola.
        if (!totalResponse.ok) throw new Error("Error al calcular el total en el servidor");

        //Obtiene el precio.
        const totalPrice = await totalResponse.json();

        return totalPrice;

    } catch (error) {
        console.error("Error al obtener el precio total:", error);
    }
}

/* LOGICA GENERAL DE DATOS */

let cartItems = [];
const cartSaveKey = 'shoppingCart';

//Carga el carrito desde el localStorage al iniciar la aplicación.
function loadCart(){
    const savedCart = localStorage.getItem(cartSaveKey);

    if(savedCart){
        try {
            cartItems = JSON.parse(savedCart);
        } catch (error) {
            console.error("Error al parsear el carrito, reiniciando...", error);
            cartItems = [];
        }
    }

    updateCartNumber();
    renderCart();
}

//Guarda el estado actual del carrito en el localStorage cada vez que se agrega o elimina un producto.
function saveCart(){
    localStorage.setItem(cartSaveKey, JSON.stringify(cartItems));
    updateCartNumber();
    renderCart();
}

/* LOGICA DE INTERACCIONES CON EL USUARIO */

//Escucha todos los clicks de la pantalla.
document.addEventListener('click', (event) => {
    const target = event.target;

    // Si el click es en un boton de aumentar cantidad se agrega el producto.
    if (target.matches('.add-to-cart')) {
        // Usamos dataset que es más limpio
        const productId = target.dataset.productId || target.getAttribute('data-product-id');
        addToCart(productId);
    }

    // Si el click es en un boton de disminuir cantidad se elimina el producto.
    if (target.matches('.remove-from-cart')) {
        const productId = target.dataset.productId || target.getAttribute('data-product-id');
        removeFromCart(productId);
    }
});

//Agrega al carrito el producto seleccionado.
function addToCart(productId){

    console.log(`AGREGADO producto con id ${productId} al carrito...`);

    //Intenta agregar el producto al carrito, si ya existe, incrementa la cantidad.
    const existingItem = cartItems.find(item => item.productId === productId);

    if(existingItem){
        existingItem.quantity += 1;
        console.log(`Producto con id ${productId} ya existe en el carrito, incrementando cantidad a ${existingItem.quantity}...`);
    } 
    else {
        cartItems.push({ 
            productId, 
            quantity: 1 
        });
        console.log(`Producto con id ${productId} agregado al carrito con cantidad 1...`);
    }

    saveCart();

}

//Elimina del carrito el producto seleccionado.
function removeFromCart(productId){

    console.log(`ELIMINADO producto con id ${productId} del carrito...`);

    //Obtiene el elemento del carrito correspondiente al producto, si existe, y lo elimina.
    const existingItem = cartItems.find(item => item.productId === productId);

    //Si el producto existe en el carrito opera con el.
    if(existingItem){
        //Si la cantidad es mayor a 1, decrementa la cantidad, sino elimina el producto del carrito.
        if(existingItem.quantity > 1){
            existingItem.quantity -= 1;
            console.log(`Producto con id ${productId} tiene cantidad ${existingItem.quantity} en el carrito, decrementando cantidad a ${existingItem.quantity}...`);
        } 
        else {
            cartItems = cartItems.filter(item => item.productId !== productId);
            console.log(`Producto con id ${productId} eliminado del carrito...`);
        }
    }

    saveCart();
}

/* LOGICA DE ELEMENTOS EN EL CARRITO */

const cartNumbers = document.getElementsByClassName('cart-number');

//Actualiza el numero de productos en el carrito cada vez que se agrega o elimina un producto.
function updateCartNumber(){
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    console.log(`Actualizando numero de productos en el carrito a ${totalItems}...`);
    Array.from(cartNumbers).forEach(cartNumber => {
        cartNumber.textContent = totalItems;
    });
}

//Crea la lista de productos en el carrito.
function createCartProductsList(){
    return {
        products: cartItems.map(item => ({
            id: parseInt(item.productId, 10), 
            quantity: item.quantity
        }))
    };
}

/* LOGICA DE RENDERIZADO */
const cartContainer = document.getElementById('cart-container');

//Renderiza el producto del carrito.
function renderCartProduct(product, quantity, container){
    // Dibujamos el HTML.
    const html = `
        <div class="cart-item">
            <img src="/media/products/${product.imagesUrl[0]}" alt="${product.id}" />
            <h3>${product.title}</h3>
            <p>Precio: ${product.price}€</p>
            
            <div class="quantity-controls">
                <button class="remove-from-cart" data-product-id="${product.id}">-</button>
                <span>${quantity}</span>
                <button class="add-to-cart" data-product-id="${product.id}">+</button>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
}

//Renderiza el total del carrito.
function renderCartTotalPrice(totalPrice, container){
    const html = `
        <div class="cart-total-summary">
            <h2>Total de la compra:${totalPrice.toFixed(2)}€</h2>
            <button class="btn-checkout">Pagar ahora</button>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
}

//Renderiza el contenido del carrito en la pagina de carrito, mostrando los productos agregados y sus cantidades.
async function renderCart(){
    if (!cartContainer) return; 

    cartContainer.innerHTML = ''; 

    // Si el carrito esta vacio muestra el mensaje correspondiente.
    if (cartItems.length === 0) {
        cartContainer.innerHTML = '<p>Sin productos</p>';
        return;
    }

    //Recorre todos los productos e intenta cargar sus datos desde la API para mostrarlos en el carrito.
    for (const localItem of cartItems) {
        
        const product = await getProduct(localItem.productId);

        //Si el producto es nulo continua al siguiente.
        if(!product) continue;

        renderCartProduct(product, localItem.quantity, cartContainer);
    }

    //Dibuja el precio total.
    const totalPrice = await getTotalPrice(createCartProductsList());

    if(totalPrice > 0){
        renderCartTotalPrice(totalPrice, cartContainer);
    }

}

/* INICIALIZACION */

loadCart();