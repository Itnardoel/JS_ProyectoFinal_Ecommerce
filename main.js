/****************
    Entidades
*****************/
class Usuario {
    constructor(nombre,mail) {
        this.nombre = nombre;
        this.mail = mail;
    }
}

/**************
    Variables
***************/
//Array con todos mis productos
const productos = [];
const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

//Array para el carrito
let carrito = [];

let precioTotal = 0;

//DOM de los botones
const btnAgregarCarrito = document.getElementsByClassName("btnCompra");
const totalCarritoHtml = document.getElementById("total");
const btnCompraTotal = document.getElementById("btnTotal");
const btnCarrito = document.querySelector(".btnCarrito");
const carritoOverlay = document.querySelector(".carritoModalOverlay");
const cantidadCarrito = document.querySelector(".cantidadCarrito");
const btnSuscribirse = document.querySelector("#btnSuscribirse");

/*************
    Funciones  
**************/
const obtenerDatosAsync = async () => {
    try {
        let response = await fetch("data.json");
        let data = await response.json();
        
        data.forEach((producto) => {
            productos.push(producto);
        })
        
        guardarEnLocal();
        dibujarProductos();
        verificarStorage();
        
        Array.from(btnAgregarCarrito).forEach(botonAddCarrito => {
            botonAddCarrito.addEventListener('click', agregarAlCarrito);
        });
        
    }
    catch (error) {
        console.log(error);
    }
}

obtenerDatosAsync();


//Guardo los productos que tengo disponibles en el local storage
const guardarEnLocal = () => {localStorage.setItem("Productos", JSON.stringify(productos))};

//Dibujo los productos en el HTML
const dibujarProductos = () => {
    productos.forEach(producto => {
        let nodo = document.createElement("div");
        nodo.className = "card"

        nodo.innerHTML = `
            <img src="${producto.imagen}"</img>
            <h3>${producto.nombre}</h3>
            <p>$${producto.precio}</p>
            <button class="btnCompra" data-id=${producto.id}>Agregar al carrito</button>
        `
        document.getElementById("cards").appendChild(nodo);
    })
}

//Funcion para agregar un producto al carrito
const agregarAlCarrito = (e) => {
    let idProducto = e.target.getAttribute("data-id"); //obtengo el id del producto
    let busqueda = productos.find((producto) => producto.id == idProducto); //busco el id en el array de productos

    if (carrito.length == 0){
        carrito.push(busqueda);
        dibujarCarrito(busqueda);
        guardarCarrito(busqueda);
        totalCarrito();
        notificacionCarrito(busqueda);
    } else if (carrito.find((producto) => producto.id == busqueda.id)){
        Swal.fire(
            `${busqueda.nombre}`,
            `Ya fue agregado al carrito`,
            'info'
          )
        return
    } else {
        carrito.push(busqueda);
        dibujarCarrito(busqueda);
        guardarCarrito(busqueda);
        totalCarrito();
        notificacionCarrito(busqueda);
    }
}

const notificacionCarrito = (producto) => {
    Toastify({
        text: `Agregaste "${producto.nombre}" al carrito`,
        duration: 3000,
        gravity: 'bottom',
        position: 'right',
        stopOnFocus: true,
        close: true,
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
          }
    }).showToast();
}

const notificacionBorrarCarrito = (producto) => {
    Toastify({
        text: `Borraste "${producto.nombre}" del carrito`,
        duration: 5000,
        gravity: 'bottom',
        position: 'right',
        stopOnFocus: true,
        close: true,
        style: {
            background: "linear-gradient(to right, #ff3c3c, #ff8d5d)",
          }
    }).showToast();
}

const guardarCarrito = (busqueda) => {
    let listaNueva = JSON.parse(localStorage.getItem("Carrito")) || localStorage.setItem("Carrito", JSON.stringify(carrito)) //si es falsy me guarda en storage el carrito
    if (listaNueva) {
        listaNueva.push(busqueda);
        localStorage.setItem("Carrito", JSON.stringify(listaNueva));
    }
}

//Funcion para saber el total del carrito
const totalCarrito = () => {
    precioTotal = 0;    //Reseteo el contador para que no vuelva a contar al iterar y hacer la suma
    let carritoPrecio = carrito.map((producto) => producto.precio);
    let cantidad = document.querySelectorAll(".cantidadProducto");
    let i = 0;
    
    for (const precio of carritoPrecio) {
        guardarCantidad(cantidad[i].value, i);
        precioTotal += precio * cantidad[i].value;
        i++;
    }
    totalCarritoHtml.innerText = "$ " + precioTotal;
    
    cantidadCarrito.innerText = carrito.length;

    if (carrito.length > 0) {
        document.querySelector(".carritoVacio").classList.add("oculto");
    }
    else {
        document.querySelector(".carritoVacio").classList.remove("oculto");
    }
}

// Funcion para guardar la cantidad del carrito y modificarla en el storage
const guardarCantidad = (cantidadProducto, posicion) => {
    carrito[posicion].cantidad = cantidadProducto;
    console.log(carrito);
    let carritoStorage = JSON.parse(localStorage.getItem("Carrito"));
    carritoStorage = carrito;
    localStorage.setItem("Carrito", JSON.stringify(carritoStorage));
}

//Dibujo el carrito
const dibujarCarrito = (producto) => {
    let nodo = document.createElement("tr");
    nodo.id = producto.id;    //le coloco el id del item como id en el DOM para poder borrarlo
    nodo.innerHTML = `
        <td><img src="${producto.imagen}"</img></td>
        <td><p>${producto.nombre}</p></td>
        <td><p>$${producto.precio}</p></td>
        <td><input class="cantidadProducto" type="number" value="1"><td>
        <td><button onclick="borrarDelCarrito(${producto.id})">X</button></td>
    `
    document.getElementById("carrito").appendChild(nodo);

    let btnCantidad = document.querySelectorAll(".cantidadProducto");

    for (let i=0; i < btnCantidad.length; i++) {
        btnCantidad[i].addEventListener("change", cambiarCantidad);
    }
}

//Para borrar el item del carrito usando lo que tengo en el storage del carrito
const borrarDelCarrito = (id) => {
    let busqueda = productos.find((producto) => producto.id == id);
    notificacionBorrarCarrito(busqueda);

    let carritoViejo = JSON.parse(localStorage.getItem("Carrito"));
    let carritoFiltrado = carritoViejo.filter(producto => producto.id != id);
    localStorage.setItem("Carrito",JSON.stringify(carritoFiltrado));
    carrito = carritoFiltrado;
    const borrarNodo = document.getElementById(id); //consigo el id del dom para borrar el elemento del carrito
    borrarNodo.remove();
    totalCarrito();
}

function cambiarCantidad (e) {;
    let cantidad = e.target.value;
    
    if (isNaN(cantidad) || cantidad <= 0) {
        e.target.value = 1;
    }
    totalCarrito();
}

//Verifico si en el storage del carrito tengo algo
const verificarStorage = () => {
    carrito = JSON.parse(localStorage.getItem("Carrito")) || [] //si es falsy, retorna un array vacio
    dibujarCarritoStorage(carrito);
    totalCarrito();
}

//Si habia algo en el carrito, lo dibujo
const dibujarCarritoStorage = (carrito) => {
    for (const producto of carrito){
        let nodo = document.createElement("tr");
        nodo.id = producto.id;
        nodo.innerHTML = `
            <td><img src="${producto.imagen}"</img></td>
            <td><p>${producto.nombre}</p></td>
            <td><p>$${producto.precio}</p></td>
            <td><input class="cantidadProducto" type="number" value="${producto.cantidad}"><td>
            <td><button onclick="borrarDelCarrito(${producto.id})">X</button></td>
        `
        document.getElementById("carrito").appendChild(nodo);

        let btnCantidad = document.querySelectorAll(".cantidadProducto");

        for (let i=0; i < btnCantidad.length; i++) {
            btnCantidad[i].addEventListener("change", cambiarCantidad);
        }
    }
}

// Para guardar los datos del usuario
const nuevoUsuario = () => {
    let nombre = document.querySelector("#nombre").value;
    let email = document.querySelector("#email").value;

    let usuario = new Usuario (nombre, email);
 
    let valido = validarUsuario (nombre, email);
    
    if (valido == 0) {
        usuarios.push(usuario);
        localStorage.setItem("Usuarios", JSON.stringify(usuarios));
        document.querySelector("#nombre").value = "";
        document.querySelector("#email").value = "";
    }

}

// Para validar los datos que ingresa el usuario
const validarUsuario = (nombre,email) => {
    let error = document.querySelectorAll(".error");
    let mailvalido = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let numValido = 0;

    if (nombre == '') {
        error[0].classList.add("verdadero");
        numValido ++;
    } else {
        error[0].classList.remove("verdadero");
    }

    if (email.match(mailvalido)) {
        error[1].classList.remove("verdadero");
    } else {
        error[1].classList.add("verdadero");
        numValido ++;
    }
    return numValido;
}

/***********
    Eventos
************/

btnCompraTotal.onclick = () => {
    Swal.fire({
        title: `Gracias por tu compra`,
        text: `Tu total es de $${precioTotal}`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      }).then((result) => {
        if (result.isConfirmed) {
            location.reload();
        }
      })
    carrito = [];
    localStorage.removeItem("Carrito");
    dibujarCarritoStorage(carrito);
}

// Abrir y cerrar el carrito
btnCarrito.addEventListener("click", () =>{
    if (carritoOverlay.classList.contains("mostrar")){
        carritoOverlay.classList.remove("mostrar");
    } else {
        carritoOverlay.classList.add("mostrar");
    }
})

// Cierra el carrito cuando clickeamos afuera del overlay
carritoOverlay.addEventListener("click", (e) => {
    if (e.target.classList.contains("carritoModalOverlay")) {
        carritoOverlay.classList.remove("mostrar");
    }
})

// Evento del boton de la Newsletter
btnSuscribirse.addEventListener("click", nuevoUsuario);
