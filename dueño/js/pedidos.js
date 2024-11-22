document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM cargado");
    cargarPedidos();
});

let procesados = new Set(); // Set para controlar IDs únicos

function cargarPedidos() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("Token no encontrado en localStorage.");
        return;
    }

    fetch("https://print-me-ten.vercel.app/pedidos/pedidos", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                // Filtrar datos por ID de comprador único antes de hacer cualquier solicitud
                const pedidosUnicos = data.filter(pedido => {
                    const idComprador = pedido.id_comprador;
                    if (idComprador && !procesados.has(idComprador)) {
                        procesados.add(idComprador); // Registrar ID único
                        return true; // Mantener en el array
                    }
                    return false; // Excluir del array
                });

                // Realizar solicitudes para compradores únicos
                pedidosUnicos.forEach(pedido => {
                    const idComprador = pedido.id_comprador;
                    fetch(`https://print-me-ten.vercel.app/compradores/compradorByID/${idComprador}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        }
                    })
                        .then(response => response.json())
                        .then(compradorData => {
                            console.log("Respuesta del endpoint compradorByID:", compradorData);

                            const nombreComprador = compradorData.comprador
                                ? compradorData.comprador.nombre_apellido
                                : "Sin nombre";

                            crearPedido(pedido, nombreComprador);
                        })
                        .catch(error => console.error("Error al obtener comprador:", error));
                });
            } else {
                document.getElementById("TodosPedidos").innerHTML = "<p>No se encontraron pedidos.</p>";
            }
        })
        .catch(error => console.error("Error al cargar pedidos:", error));
}

function crearPedido(pedido, nombreComprador) {
    console.log("Creando pedido:", pedido, "Nombre del comprador:", nombreComprador);

    const pedidoDiv = document.createElement("div");
    pedidoDiv.classList.add("card");
    pedidoDiv.setAttribute("data-id", pedido.id);

    pedidoDiv.innerHTML = `
        <img src="../fotos/impresora 3d.png" alt="Impresora" class="printer-image">
        <div class="info">
            <h2>${nombreComprador}</h2>
            <button class="aceptar" onclick="aceptarPedido(${pedido.id})">Aceptar</button>
            <button class="rechazar" onclick="rechazarPedido(${pedido.id})">Rechazar</button>
        </div>
    `;

    document.getElementById("TodosPedidos").appendChild(pedidoDiv);
}

//boton aceptar y rechazar

function aceptarPedido(idPedido) {
    console.log(`Aceptando pedido con ID: ${idPedido}`);

    fetch(`https://print-me-ten.vercel.app/pedidos/${idPedido}/aceptar`, {
        method: "PUT", // Método PUT para actualizar
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${localStorage.getItem("token")}`
        },
        "estado": "aceptado"
    })
        .then(response => {
            if (response.ok) {
                console.log(`Pedido ${idPedido} aceptado exitosamente`);
                alert(`El pedido ${idPedido} fue aceptado.`);
            } else {
                console.error(`Error al aceptar el pedido ${idPedido}:`, response.statusText);
                response.json().then(data => {
                    console.error("Detalles del error:", data); // Mostrar detalles del error
                });
                alert(`Hubo un problema al aceptar el pedido ${idPedido}.`);
            }
        })
        .catch(error => {
            console.error(`Error en la solicitud para aceptar pedido ${idPedido}:`, error);
            alert(`Hubo un error al intentar aceptar el pedido ${idPedido}.`);
        });
}
function rechazarPedido(idPedido) {
    console.log(`Rechazando pedido con ID: ${idPedido}`);
    
    fetch(`https://print-me-ten.vercel.app/pedidos/delete/${idPedido}`, {
        method: "DELETE", // Método DELETE para eliminar el pedido
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: idPedido }) 
    })
        .then(response => {
            if (response.ok) {
                console.log(`Pedido ${idPedido} rechazado exitosamente`);
                alert(`El pedido ${idPedido} fue rechazado.`);
                // Opcional: eliminar el pedido del DOM si fue rechazado con éxito
                const pedidoElement = document.querySelector(`.card[data-id="${idPedido}"]`);
                if (pedidoElement) {
                    pedidoElement.remove();
                }
            } else {
                console.error(`Error al rechazar el pedido ${idPedido}:`, response.statusText);
                alert(`Hubo un problema al rechazar el pedido ${idPedido}.`);
            }
        })
        .catch(error => console.error(`Error en la solicitud para rechazar pedido ${idPedido}:`, error));
}

//funcion para redirigir pagina segun id pedido
function MoverID(idPedidoSeleccionado){
    console.log("idPedidoSeleccionado:", idPedidoSeleccionado);
    window.location.href = `/usuario/html/perfilduenio.html?id=${idPedidoSeleccionado}`; //cambio de pantalla y le paso el id
}

/*
function buscarPerfiles() {
    document.getElementById("TodosPerfiles").innerHTML = "";
    const searchInput = document.getElementById('buscador').value.toLowerCase(); // Obtener el valor del buscador en minúsculas
    fetch("https://print-me-ten.vercel.app/vendedores/buscar?q=" + searchInput) 
        .then(response => response.json())
        .then(data => {
            console.log("Data recibida:", data);
            if (Array.isArray(data.message)) {
                data.message.forEach(crearPerfil);
            } else {
                console.log(data.message);
                console.error("La propiedad 'message' no es un array:", data);
            }
        })
        .catch(error => console.error("Error al cargar perfiles:", error));
}
*/

//ruta pediddoById  https://print-me-ten.vercel.app/pedidos/pedidosID/14 

//FILTROS
//marcar o desmarcar favorito
function FiltroFavoritos(checkbox) {
    const favoritos = document.querySelectorAll('.containerlike input:checked');
    console.log(favoritos.length);
    const perfilDiv = checkbox.closest(".card");
    if (checkbox.checked) {
        perfilDiv.classList.add("containerlike");
    } else {
        perfilDiv.classList.remove("containerlike");
    }
}

// Mostrar solo los perfiles favoritos
function mostrarFavoritos() {
    const perfiles = document.querySelectorAll('.card');
    perfiles.forEach(perfil => {
        // Verifica si el perfil tiene un checkbox marcado dentro del contenedor
        const checkbox = perfil.querySelector('.containerlike input');
        if (checkbox && checkbox.checked) {
            perfil.style.display = "block";
        } else {
            perfil.style.display = "none";
        }
    });
}

// Restablecer para mostrar todos los perfiles
function mostrarTodos() {
    const perfiles = document.querySelectorAll('.card');
    perfiles.forEach(perfil => {
        perfil.style.display = "block";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    /*const filterBtn = document.getElementById("filter-btn");
    const filterPopup = document.getElementById("filter-popup");*/
    const applyFilterBtn = document.getElementById("aplicar-filtro");
    const estadoSelect = document.getElementById("estado");
    const pedidoContainer = document.getElementById("pedidoElement");

    filterBtn.addEventListener("click", () => {
        filterPopup.style.display = "block"; // Mostrar el filtro
    });

    closePopupBtn.addEventListener("click", () => {
        filterPopup.style.display = "none"; // Cerrar el filtro
    });

    applyFilterBtn.addEventListener("click", () => {
        const selectedEstado = estadoSelect.value;
        filterPedidos(selectedEstado);
        filterPopup.style.display = "none"; // Cerrar el filtro al aplicar
    });

    // Función para obtener todos los pedidos según el estado
    function filterPedidos(estado) {
        let url = "https://print-me-ten.vercel.app/pedidos/pedidos "; // Ruta para obtener todos los pedidos

        if (estado !== "todos") {
            url = `https://tuservidor.com/pedidos/${estado}`; // Ruta para filtrar por estado
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                mostrarPedidos(data);
            })
            .catch(error => {
                console.error("Error al obtener los pedidos:", error);
            });
    }

    // Función para mostrar los pedidos en la pantalla
    function mostrarPedidos(pedidos) {
        pedidoContainer.innerHTML = ""; // Limpiar los pedidos existentes

        if (pedidos.length === 0) {
            pedidoContainer.innerHTML = "<p>No hay pedidos para mostrar.</p>";
        } else {
            pedidos.forEach(pedido => {
                const pedidoElement = document.createElement("div");
                pedidoElement.classList.add("pedido");
                pedidoElement.innerHTML = `
                    <p>ID: ${pedido.id}</p>
                    <p>Estado: ${pedido.estado}</p>
                    <p>Descripción: ${pedido.descripcion}</p>
                `;
                pedidoContainer.appendChild(pedidoElement);
            });
        }
    }

    // Llamada inicial para cargar todos los pedidos
    filterPedidos("todos");
});

const estadoSeleccionado = document.getElementById("estado").value;

    // Filtrar pedidos por estado
    const pedidosFiltrados = pedidos.filter(
        (pedido) => pedido.estado === estadoSeleccionado
    );

    // Mostrar pedidos filtrados
    mostrarPedidos(pedidosFiltrados);

// Función para mostrar todos los pedidos al hacer clic en "Todos"
document.querySelector("span.active").addEventListener("click", () => {
    mostrarPedidos(pedidos); // Mostrar todos los pedidos
});