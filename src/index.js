/*
  Materia:  Programación Backend
  Alumno:   Rolando Villegas
  Fecha:    20/04/2025

  Clase virtual 3 - Actividad

  Descripción:

  Al programa hecho en clase, le agregué un endpoint /cocina/alacena para practicar las operaciones
  de alta, baja, modificación y lectura, que luego ejecutaré con Postman.

  El nuevo endpoint sigue esta lógica:

  a)  El endpoint /cocina/alacena representa la alacena de una cocina, donde se pueden almacenar productos
      como latas de conservas, fideos, platos, etc.
  b)  Los productos se guardan en un array llamado "alacena", que registra el nombre del producto y su cantidad.
  c)  Se utilizan los métodos GET, POST, PATCH, PUT y DELETE para hacer las operaciones básicas de un CRUD.
  d)  Los métodos utilizan (los que lo requieren) parámetros del tipo path (ej.: DELETE) y body (ej: PUT).
  
  Los métodos del endpoint /cocina/alacena los escribí a continuación de lo visto en clase, a partir de la línea 70.
*/

// Inicialización de Express
import express from 'express';

const app = express();
const port = 3000;

// Configuraciones para el endpoint alacena
app.use(express.json());    // Habilita la lectura de objetos JSON en el body de las peticiones
const alacena = [];         // Arreglo para almacenar los objetos que contendrá la alacena (ej.: ítem: manteca, cantidad: 1)

app.get('/', (request, response) => {
  response.send('Abrir puerta');
});

app.get('/cocina', (request, response) => {
  response.send('Llegaste a la cocina');
});

app.get('/cocina/heladera', (request, response) => {
  const tipoVaso = request.query['tipoVaso'];

  if (!tipoVaso) {
    response.send('Abriste la heladera');
    return;
  }

  response.send(`Abriste la heladera y trajiste solo un ${tipoVaso}`);
});

app.get('/cocina/heladera/:tipoBebida', (request, response) => {
  const tipoVaso = request.query['tipoVaso'];

  const tipoBebida = request.params.tipoBebida;
  if (!tipoVaso) {
    response.send('Abriste la heladera');
    return;
  }

  if (!tipoBebida) {
    response.send(`Abriste la heladera y trajiste solo un ${tipoVaso}`);
  }

  response.send(
    `Abriste la heladera y te serviste ${tipoBebida} en un ${tipoVaso}`
  );
});

// INICIO DE MÉTODOS PARA endpoint /cocina/alacena

  // Método GET para listar los productos que tiene la alacena.
  app.get('/cocina/alacena', (request, response) => {
    // Se evalúa si hay productos en el array alacena. 
    // Si el largo de alacena es igual a 0, significa que no hay productos y se devuelve eso como resultado.

    if (alacena.length===0){
      return response.json(
        {
          mensaje: 'La alacena está vacía.'
        }
      )
    }
    
    if (alacena.length!==0) {
     response.json(
        {
          mensaje: 'Contenido de la alacena:',
          productos: alacena
        }
      );
    };

  });


  // Método POST para agregar productos a la alacena
  app.post('/cocina/alacena', (request, response) => {
    const {nombre, cantidad} = request.body;     // recupero del body lo que pasa como parámetros

    // Validaciones

    // Si no se pasó nada en nombre o no es una cadena de texto, devolverá error y avisará
    if (!nombre || typeof nombre!== 'string') {
      return response.status(400).json({error: 'Falta el nombre del producto o no es válido.'});
    }

    // Si el parámetro cantidad no es un número o es menor o igual a cero, devuelve error y aviso.
    if (typeof cantidad!=='number' || cantidad<=0 ) {
      return response.status(400).json({error: 'La cantidad debe ser un número positivo.'});
    }

    // Verificación de si existe el ítem. Si existe, agrega la cantidad.
    const existente = alacena.find(item => item.nombre.toLowerCase() === nombre.toLowerCase());
    
    // Si el producto ya existe en la alacena, ejecuta lo siguiente:
    if (existente) {
      existente.cantidad = existente.cantidad + cantidad;
      return response.json({
        mensaje: `Se agregó ${cantidad} unidad(es) a ${nombre}`,
        producto: existente
      })
    }

    // Si el producto no existe, entonces lo da de alta.
    if (!existente) {
      const nuevoProducto = {nombre, cantidad};
      alacena.push(nuevoProducto);

      response.status(201).json(
        {
          mensaje: `Producto ${nombre} agregado a la alacena`,
          producto: nuevoProducto
        }
      )
    }

  });

  // Método PUT para modificar productos en la alacena
  // Este método requiere el suministro de un producto como parámetro y la cantidad que se desea configurar.
  app.put('/cocina/alacena/:producto', (request, response) => {
    const {producto} = request.params;
    const {cantidad} = request.body;

    // Validación de la cantidad
    if (typeof cantidad !== 'number' || cantidad<=0) {
      return response.status(400).json(
        {
          error: `La cantidad debe ser un número positivo`
        }
      )
    }

    // Búsqueda del producto
    const item = alacena.find(i => i.nombre.toLowerCase()===producto.toLowerCase());

    // Si no lo encuentra:
    if(!item) {
      return response.status(404).json(
        {
          error: `El producto ${producto} no está en la alacena.`
        }
      );
    }

    // De lo contrario (si lo encuentra):
    item.cantidad = cantidad;
    response.json(
      {
        mensaje: `La cantidad de ${item.nombre} fue actualizada a ${item.cantidad}`,
        producto: item
      }
    )
  }
)

// Método PATCH para modificar productos en la alacena
// Este método requiere el suministro de un producto como parámetro y la cantidad que se desea agregar o restar al stock.
app.patch('/cocina/alacena/:producto', (request, response) => {
  // Lectura de parámetros
  const {producto} = request.params;
  const {cantidad} = request.body;

  // Validación de cantidad
  if (typeof cantidad!== 'number') {
    return response.status(400).json(
      {
        error: 'La candidad debe ser un número (positivo para sumar, negativo para restar).'
      }
    )
  }

  // Buscar el producto en la alacena
  const item = alacena.find(i => i.nombre.toLowerCase() === producto.toLowerCase());

  // Si el producto pasado como parámetro no está en el array alacena
  if(!item) {
    return response.status(404).json(
      {
        error: `El producto ${producto} no está en la alacena.`
      }
    )
  }

  // Si el producto está en alacena.
  // Verificar que no se reste más de lo que hay
  if(item.cantidad + cantidad < 0) {
    return response.status(400).json(
      {
        error: `No se pueden restar ${Math.abs(cantidad)} unidades. Solo hay ${item.cantidad}`
      }
    )
  };

  // Si el producto está en la alacena y hay suficiente stock
  item.cantidad = item.cantidad + cantidad;

  response.json(
    {
      mensaje: `La cantidad de ${item.nombre} fue modificada, ahora hay ${item.cantidad}`,
      producto: item
    }
  );

}
);

// Método DELETE para eliminar productos en la alacena
// Requiere de un parámetro (de ruta) para hacer la eliminación.
app.delete('/cocina/alacena/:producto', (request,response) => {
  const {producto}=request.params;

  // Buscar al producto en el array alacena
  const index=alacena.findIndex( i => i.nombre.toLowerCase()===producto.toLowerCase());

  // Si no lo encuentra
  if (index === -1) {
    return response.status(404).json(
      {
        error: `El producto "${producto}" no se encuentra en la alacena.`
      }
    )
  } ;

  // Si lo encuentra, elimina el producto del array
  // Antes de eliminar, me guardo el nombre para luego mostrarlo
  const eliminado=alacena[index].nombre;

  // Ahora sí, elimino el producto
  alacena.splice(index, 1);
  response.json(
    {
      mensaje: `El producto ${eliminado} fue eliminado de la alacena.`,
      producto: eliminado
    }
  );
});
// FIN DE MÉTODOS PARA /cocina/alacena

// Arranque del servidor
app.listen(port, () => {
  console.log(`La aplicación está escuchando el puerto ${port}`);
});