//entrar a productos
  const cardProducts = document.querySelectorAll('.card-product');
const detalleProducto = document.querySelector('#detalle-producto');

cardProducts.forEach((cardProduct) => {
    const btnDetalle = cardProduct.querySelector('.btn-detalle');
    btnDetalle.addEventListener('click', () => {
        // Obtener los datos del producto seleccionado
        const titulo = cardProduct.querySelector('h3').textContent;
        const descripcion = 'Descripción del producto...'; // Agrega la descripción del producto aquí
        const imagen = cardProduct.querySelector('img').src;

        // Mostrar la pantalla de detalles
        detalleProducto.style.display = 'block';

        // Actualizar los datos en la pantalla de detalles
        document.querySelector('#titulo-detalle').textContent = titulo;
        document.querySelector('#descripcion-detalle').textContent = descripcion;
        document.querySelector('#imagen-detalle').src = imagen;
    });
});