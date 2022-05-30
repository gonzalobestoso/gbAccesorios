//defino variables globales
let productos =[];
let carrito = [];
const URL = 'https://fakestoreapi.com/products/'
const moneda = '$';
const DOMitems = document.querySelector('#productos');
const DOMcarrito = document.querySelector('#carrito');
const DOMtotal = document.querySelector('#total');
const DOMbotonLimpiar = document.querySelector('#limpiar');
const miLocalStorage = window.localStorage;

//defino clases producto y cliente

class Producto {
    constructor(codigo, marca, modelo, descripcion, precio, categoria, stock){
        this.codigo = codigo;
        this.marca = marca.toUpperCase();
        this.modelo = modelo.toUpperCase();
        this.descripcion = descripcion;
        this.precio = parseFloat(precio);
        this.categoria = categoria;
        this.stock = parseInt(stock);                
    }

    //descuento del 20% para cybermonth
    promocion(){
        this.precio = this.precio - (this.precio * 0.20) ;
    }
}

class Cliente {
    constructor(id, dni, nombre, apellido, email ){
        this.id = id;
        this.dni = dni;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
    }
  
    mostrarCliente(){
        console.log("Cliente " + this.id + " \n" + "DNI: " + this.dni + " \n" + "Nombre y Apellido: " + this.nombre + " " + this.apellido +  " \n" + "Email: " + this.email)
    }
}


//funcion carga inicial

window.onload =function() { 
    cargarCarritoDeLocalStorage();
    fetch(URL)
    .then(res=>res.json())
    .then(data =>{
        productos = data
        renderizarCarrito()
        contadorCarrito()
        agregarProductos()
        
        
    })
}

//funcion agregar productos al html desde un array de productos.

function agregarProductos(){
               productos.forEach((producto) =>{
                //estructura
                const cardGeneral = document.createElement('div');
                cardGeneral.classList.add('card','col-12', 'mt-2', 'mb-1' );
                //card body
                const cardBody = document.createElement('div');
                cardBody.classList.add('card-body' );
                //imagen
                const cardImagen = document.createElement('img');
                cardImagen.classList.add('img-fluid', 'd-flex', 'mx-auto');
                cardImagen.setAttribute('src', producto.image);
                //marca
                const cardMarca = document.createElement('p');
                cardMarca.classList.add('card-title', 'text-center', 'fw-bold', 'fs-2');
                cardMarca.textContent = producto.title;                
                //precio
                const cardPrecio = document.createElement('p');
                cardPrecio.classList.add('card-text', 'text-center', 'fs-1');
                cardPrecio.textContent = `${moneda}${producto.price}`;
                //boton 
                const cardBoton = document.createElement('button');
                cardBoton.classList.add('btn', 'btn-primary', 'd-flex', 'mx-auto');
                cardBoton.textContent = 'Agregar Producto';
                cardBoton.setAttribute('marcador', producto.id);
                cardBoton.addEventListener('click', agregarAlCarrito);
                cardBoton.addEventListener('click', () =>{
                    Toastify({
                        text: "Producto agregado a carrito",
                        duration: 3000,
                        newWindow: true,
                        close: true,
                        gravity: "bottom", // `top` or `bottom`
                        position: "right", // `left`, `center` or `right`
                        stopOnFocus: true, // Prevents dismissing of toast on hover
                        style: {
                            background: "linear-gradient(to right, #00b09b, #96c93d)",
                        }, 
                    }).showToast();
                });
                //insercion
                cardBody.appendChild(cardImagen);
                cardBody.appendChild(cardMarca);
                cardBody.appendChild(cardPrecio);
                cardBody.appendChild(cardBoton);
                cardGeneral.appendChild(cardBody);
                DOMitems.appendChild(cardGeneral);
            })        
}

//funcion para evento disparado al apretar el boton de Agregar Producto
function agregarAlCarrito(evento) {
    // agregamos el producto al carrito
    carrito.push(evento.target.getAttribute('marcador'));  
    // Actualizamos el carrito 
    renderizarCarrito();
    // Actualizamos el LocalStorage
    guardarCarritoEnLocalStorage();
    contadorCarrito();
}

function contadorCarrito() {
    let iconoCarrito = document.getElementById("contadorCarrito")
    let iconoVaciar = document.getElementById("limpiar")
    if (carrito.length === 0){
        iconoCarrito.innerText = ""
        iconoVaciar.disabled = true
    } else{

        iconoCarrito.innerText = carrito.length
        iconoVaciar.disabled = false

    }
}

function renderizarCarrito() {
           // Vaciamos todo el html
            DOMcarrito.textContent = '';
            // Quitamos los duplicados
            productosCarrito = [...new Set(carrito)];
            productosCarrito.forEach((item) => {
            // Obtenemos el item que necesitamos del array de productos
            const itemProducto = productos.filter((itemProductos) => {
                // ¿Coincide las id? Solo puede existir un caso
                return itemProductos.id === parseInt(item);
            });
            // Cuenta el número de veces que se repite el producto
            const cantidadItems = carrito.reduce((total, itemId) => {
                // ¿Coincide las id? Incremento el contador, en caso contrario lo mantengo
                return itemId === item ? total += 1 : total;
            }, 0);
            // Creamos el nodo del item del carrito
            const miNodo = document.createElement('li');
            miNodo.classList.add('list-group-item', 'list-group-item-primary', 'text-center', 'border','border-primary', 'border-1', 'mt-1', 'mx-auto');
            miNodo.textContent = `${cantidadItems} x ${itemProducto[0].title} - ${moneda}${itemProducto[0].price}`;
            
            

            // Boton de borrar
            const miBoton = document.createElement('button');
            miBoton.classList.add('btn', 'btn-danger', 'd-flex', 'mx-auto');
            miBoton.textContent = 'Borrar';
            miBoton.dataset.item = item;
            miBoton.addEventListener('click', borrarItemCarrito);
            miBoton.addEventListener('click', () => {
            Toastify({
                text: "Producto eliminado del carrito",
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "bottom", // `top` or `bottom`
                position: "right", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                  background: "linear-gradient(to right, #ed213a, #93291e)",
                },
            }).showToast();
        });
        // Mezclamos nodos
        miNodo.appendChild(miBoton);
        DOMcarrito.appendChild(miNodo);
    });
    // Renderizamos el precio total en el HTML
    DOMtotal.textContent = calcularTotal();
}

//Evento para borrar un elemento del carrito
function borrarItemCarrito(evento) {
    // Obtenemos el producto ID que hay en el boton pulsado
    const id = evento.target.dataset.item;
    // Borramos todos los productos
    carrito = carrito.filter((carritoId) => {
        return carritoId !== id;
    });
    // volvemos a renderizar
    renderizarCarrito();
    // Actualizamos el LocalStorage
    guardarCarritoEnLocalStorage();
    contadorCarrito();
}


// Calcula el precio total teniendo en cuenta los productos repetidos

function calcularTotal() {
    // Recorremos el array del carrito 
    return carrito.reduce((total, item) => {
        // De cada elemento obtenemos su precio
        const miItem = productos.filter((itemBaseDatos) => {
            return itemBaseDatos.id === parseInt(item);
        });
        // Los sumamos al total
        return total + miItem[0].price;
    }, 0).toFixed(2);
}


//Vacia el carrito y vuelve a dibujarlo
function vaciarCarrito() {
    // Limpiamos los productos guardados
    carrito = [];
    // Renderizamos los cambios
    renderizarCarrito();
    // Borra LocalStorage
    localStorage.clear();
    contadorCarrito();
    

}

function guardarCarritoEnLocalStorage () {
    miLocalStorage.setItem('carrito', JSON.stringify(carrito));
    
}

function cargarCarritoDeLocalStorage () {
    // ¿Existe un carrito previo guardado en LocalStorage?
    if (miLocalStorage.getItem('carrito') !== null) {
        // Carga la información
        carrito = JSON.parse(miLocalStorage.getItem('carrito'));
    }
}

// Eventos

DOMbotonLimpiar.addEventListener('click', () =>{
    Swal.fire({
        title: '¿Estas seguro de vaciar el carrito?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Si, vacialo!'
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire(
            'Eliminado',
            'Su carrito está vacío',
            'success',
            vaciarCarrito(),
            
          )
        }
      })
});


// si el mes es abril, aplico un descuento al precio del producto
function cyberMonth(){
    let fechaActual = new Date();
    if (fechaActual.getMonth() == 3){
    for (const producto of productos){
        producto.promocion();
        return console.log ("Precio con descuento: " + producto.precio);
    }
    }else {
     alert("No es mes de descuentos");
    }};
    


const cliente1 = new Cliente ("1", "33948693", "Gonzalo", "Bestoso", "gonzalojavier19@gmail.com" );
cliente1.mostrarCliente();
