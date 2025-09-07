---
applyTo: '**'
---
Bien necesito un front en react (no importa si es client side, creo que mejor) que tenga la funcionalidad del api guia que tienes en el directorio (es un back que hice) el cual voy a deployar en vercel. Que use material design https://m3.material.io/ que la distribución y componentes sean como están en la carpeta project (es como la base que hice en figma) 

Lo que si no me convencieron fueron los colores, me gustaría usar colores vivos pero para un sitio de trading, que buy y sell sean rojo y verde, y que el totalreturnpercent sea verde positivo y rojo negativo

Propon una mejor organización para las 2 listas con los datos que están allí

Los endpoints se llaman plano sin seguridad ni nada ya que es una demo de un challenge

Te explico que cosa debería llamar y cuando:
- El selector de UserId que está en el header va a ser una lista hardcodeada que va a tener los valores del 1 al 5 y es el id que se va a usar para todas las llamadas al api (el back no tiene auth ni nada)
- Al cambiar el userId se va a llamar al endpoint /portfolio y de orders que devuelve toda la info del usuario (cash, positions, orders) y se va a renderizar todo
- el portfolio y orders siempre se va a llamar luego de una acción y cuando se actualice o se entre a la pagina inicial (agrega un spinner global) (la url de orders es la del historial /api/orders/user/${userId})
- Deposit y withdraw van a levantar un modal, y al llenar el input y confirmar va a llamar el endpoint de cash como está en la doc.  /cash/balance/ creo que no hace falta usarlo, siempre llamemos al portfolio y que de ahi se lea toda la info que corresponda a cada parte
- Los botones BUY y SELL van a levantar un modal que va a listar los intruments en un selector para este en la doc no lo especifica pero vas a usar este: /instruments/search?q=acciones&limit=100 así listamos todas (podrías almacenarlo en un state global para no hacer fetch cada vez)
    - El selector de type va a tener market y limit como opciones (Este no está en las imagenes pero es necesario)
    - side se toma del botón que se apretó (buy o sell)
    - El selector de amount or size va a tener esas 2 opciones y un input para que el usuario ponga el valor
Al confirmar el modal va a llamar al endpoint  /api/orders que está en la doc
- Luego de hacer la orden, llamar al portfolio para actualizar todo
- En la lista de positions es solo informativa y no tiene acciones solo agrupa la info que viene del portfolio lo mejor posible
- En la lista de orders, cada item tiene un botón de cancelar que va a llamar al endpoint /orders/:orderId/cancel con el id de la orden que se quiere cancelar y luego de eso llamar al portfolio y orders para actualizar todo
- Arriba a la derecha está al lado derecho del selector de userId está el Process Simulator de label con placeholder de OrderId y un botón de Process to Filled, el cual es el que simula la queue de órdenes y va a llamar al endpoint /orders/${orderId}/process para procesar la orden que se ponga en el input, y luego de eso llamar al portfolio y orders para actualizar todo
- Todos los errores que vengan del back que están documentados (y los que no) mostrarlos en un snackbar abajo en el centro con el mensaje que venga del back
El logo de cocada lo tienes en la raiz del proyecto va a la izquierda del selector de userId lo más grande que puedas pero que entre en el header pero quiero que sea notorio.
- Recuerda cambiar los colores a algo más vivo pero que sea un sitio de trading pero con onda playera

Exitos! se que vas a darme un gran sitio.
