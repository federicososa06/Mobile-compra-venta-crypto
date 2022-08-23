let urlImg = "https://crypto.develotion.com/imgs/";

// -- PLUGINS --
async function cerrarApp() {
    const alerta = await alertController.create({
        header: 'Crypto',
        subHeader: 'Cerrar App',
        message: '¿Seguro que desea cerrar app?',
        buttons: [
            {
                text: 'SI',
                handler: function () {
                    if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('App')) {
                        Capacitor.Plugins.App.exitApp();
                    }
                }
            },
            {
                text: 'NO',
            }
        ]
    });
    await alerta.present();
}

async function obtenerConexionInternet() {
    if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('Network')) {
        return await Capacitor.Plugins.Network.getStatus();
    }
    else {
        throw 'Conexion no disponible';
    }
}

async function vibrar() {
    await Capacitor.Plugins.Haptics.vibrate();
}



//-- TOASTER --
function displayToast(msj, header, color) {
    const toast = document.createElement('ion-toast');
    toast.header = header;
    toast.icon = 'information-circle',
        toast.position = 'top';
    toast.message = msj;
    toast.duration = 3000;
    toast.color = color;
    document.body.appendChild(toast);
    toast.present();
}

// -- ALERT --
async function presentAlert(header, sub_header, message) {
    const alert = document.createElement('ion-alert');
    alert.header = header;
    alert.subHeader = sub_header;
    alert.message = message;
    alert.buttons = ['OK'];
    document.body.appendChild(alert);
    await alert.present();
}

// -- CARGANDO --
async function cargando(message) {
    const loading = await loadingController.create({
        message: message,
    });
    return await loading;
}

// -- OBTENER PARAMETRO --
function getParam(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


// -- LOGIN --
function login(data, router) {
    displayToast("Bienvenido", '', 'success');
    localStorage.setItem("api", data.apiKey);
    localStorage.setItem("idUsu", data.id);
    router.push('/monedas');
}

//obtener los departamentos
function ObtenerDepartamentos() {
    try {
        cargando("Cargando departamentos...").then((loading) => {
            loading.present();
            let url = "https://crypto.develotion.com/departamentos.php";
            fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(res => res.ok ? res.json() : res.json().then(data => Promise.reject(data.mensaje)))
                .then(data => MostrarDepartamentos(data))
                .catch(msj => displayToast(msj, 'Error', 'danger'))
                .finally(loading.dismiss())
        })
    } catch (error) {
        displayToast(error, 'Info', 'primary');
    }
}

//mostrar los departamentos en el select de departamentos
function MostrarDepartamentos(data) {
    try {
        localStorage.setItem("listaDptos", JSON.stringify(data.departamentos));

        let txtDepto = document.getElementById("txtDptoRegistro");
        data.departamentos.forEach(depto => {
            txtDepto.innerHTML += `<ion-select-option value="${depto.id}">${depto.nombre}</ion-select-option>`;
        });

    }
    catch (error) {
        displayToast(error, 'Info', 'danger');
    }
}

//obtener las ciudades del departamento seleccionado
function ObtenerCiudades() {
    try {
        cargando("Cargando ciudades...").then((loading) => {
            loading.present();
            let idDeptoSeleccionado = document.getElementById("txtDptoRegistro").value;
            let url = `https://crypto.develotion.com/ciudades.php?idDepartamento=${idDeptoSeleccionado}`;
            fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(res => (res.ok) ? res.json() : res.json().then(data => Promise.reject(data.mensaje)))
                .then(data => MostrarCiudades(data))
                .catch(msj => displayToast('Error', msj, 'danger'))
                .finally(() => loading.dismiss())
        })
    } catch (error) {
        displayToast(error, 'Info', 'danger');
    }
}

//mostrar las ciudades obtenidas en el select de ciudades
function MostrarCiudades(data) {
    try {
        document.getElementById("txtCiudadRegistro").innerHTML = "";

        if (data.codigo != 200) {
            throw "Ocurrio un error al cargar las ciudades"
        } else {
            data.ciudades.forEach(ciudad => {
                document.getElementById("txtCiudadRegistro").innerHTML +=
                    `<ion-select-option value"${ciudad.id}">${ciudad.nombre}</ion-select-option>`
            })
        }
    } catch (error) {
        displayToast(error, 'Info', 'danger');
    }
}


// -- LISTADO DE MONEDAS  --
//obtener las monedas para pasarlas al html de listado de monedas
function ObtenerMonedas() {
    try {
        cargando("Cargando monedas...").then((loading) => {
            loading.present();
            let apiKey = localStorage.getItem("api");
            let url = `https://crypto.develotion.com/monedas.php`;
            fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": apiKey
                }
            })
                .then(res => res.ok ? res.json() : res.json().then(data => Promise.reject(data.mensaje)))
                .then(data => ListarMonedas(data))
                .catch(msj => displayToast('Error', msj, 'danger'))
                .finally(() => loading.dismiss())
        })

    } catch (error) {
        displayToast('Error', 'Error al obtener las monedas', 'danger');
    }
}

//mostrar el listado de todas las monedas
let listaMonedas = [];
function ListarMonedas(data) {
    try {
        listaMonedas = data.monedas
        localStorage.setItem("listaMonedas", JSON.stringify(listaMonedas));
        document.getElementById("listaMonedas").innerHTML = "";

        data.monedas.forEach(moneda => {
            document.getElementById("listaMonedas").innerHTML +=
                `<ion-item detail href="/mercado?id=${moneda.id}" detail> 
                     <ion-avatar slot="start">
                         <img src="${urlImg}${moneda.imagen}" />
                     </ion-avatar>
                    <ion-label>
                        <h2>${moneda.nombre}</h2>
                        <h3>${moneda.cotizacion}</h3>
                    </ion-label>
                </ion-item>`;
        });

    } catch (error) {
        displayToast('Error', 'No autorizado', 'danger');
    }
}

function ObtenerMonedaPorId(idMoneda) {
    let listaMonedas = [];
    listaMonedas = localStorage.getItem("listaMonedas");
    listaMonedas = JSON.parse(listaMonedas);

    let moneda = listaMonedas[1];
    listaMonedas.forEach(m => {
        if (m.id === idMoneda) {
            moneda = m;
        }
    })
    return moneda;
}

// detalle de la moneda para compra y venta
function MostrarMoneda() {
    let idMoneda = getParam("id");
    let listaMonedas = [];
    listaMonedas = localStorage.getItem("listaMonedas");
    listaMonedas = JSON.parse(listaMonedas);
    let moneda = listaMonedas[idMoneda - 1];

    document.getElementById("monedaNombre").innerHTML = moneda.nombre;
    document.getElementById("monedaCotizacion").innerHTML = `Precio: $ ${moneda.cotizacion}`;

    let urlImg = `https://crypto.develotion.com/imgs/${moneda.imagen}`
    document.getElementById("monedaImagen").setAttribute('src', urlImg);

    document.getElementById("btnComprar").onclick = function () { Transar(1) };
    document.getElementById("btnVender").onclick = function () { Transar(2) };
}


// -- TRANSACCIONES  --
// nueva transaccion
function Transar(opn) {
    try {
        let idMoneda = getParam("id");
        let apiKey = localStorage.getItem("api");
        let idUsu = localStorage.getItem("idUsu");
        let cantidad = document.getElementById("txtCantidadOperacion").value;
        let valorActual = document.getElementById("monedaCotizacion").textContent;
        let indice = valorActual.indexOf('$');
        valorActual = valorActual.substring(indice + 2, valorActual.length); //obtener solo el numero del precio

        if (isNaN(cantidad) || cantidad <= 0) {
            throw "Ingresar una cantidad para continuar";
        }

        cargando("Procesando transaccion...").then((loading) => {
            loading.present();
            let url = "https://crypto.develotion.com//transacciones.php";
            datos = {
                "idUsuario": idUsu,
                "tipoOperacion": opn,
                "moneda": idMoneda,
                "cantidad": cantidad,
                "valorActual": valorActual
            }
            datos = JSON.stringify(datos);
            fetch(url, {
                method: "POST",
                body: datos,
                headers: {
                    "Content-Type": "application/json",
                    "apikey": apiKey
                }
            })
                .then(res => res.ok ? res.json() : res.json().then(data => Promise.reject(data.mensaje)))
                .then((data) => {
                    opn == 1 ? presentAlert('Exito', 'Compra realizada correctamente') :
                        presentAlert('Exito', 'Venta realizada correctamente ');
                    document.getElementById("txtCantidadOperacion").value = "";
                })
                .catch(msj => displayToast(msj, 'Error', ' danger'))
                .finally(() => loading.dismiss())
        })

    } catch (error) {
        displayToast('Debe ingresar una cantidad valida', 'Error', 'danger');
    }
}

// obtener las transacciones de la api
function ObtenerTransacciones() {
    try {
        cargando("Cargando transacciones...").then((loading) => {
            loading.present();
            let api = localStorage.getItem("api");
            let idUsu = localStorage.getItem("idUsu");

            let url = `https://crypto.develotion.com/transacciones.php?idUsuario=${idUsu}`;
            fetch(url, {
                method: "GET",
                headers: {
                    "apikey": api,
                    "Content-Type": "application/json"
                }
            })
                .then(res => res.ok ? res.json() : res.json().then(data => Promise.reject(data.mensaje)))
                .then(data => MostrarTransacciones(data))
                .catch(mensaje => displayToast('Error', mensaje, 'danger'))
                .finally(() => loading.dismiss())
        })
    }
    catch (e) {
        displayToast('Error', 'Info', 'danger');
    }
}

//listar las transacciones y el select para filtrar las monedas
// se guardan en el localStorage
let listaTransacciones = [];
function MostrarTransacciones(data) {
    SelectTransacciones(data);

    listaTransacciones = data.transacciones;
    localStorage.setItem("listaTransacciones", JSON.stringify(listaTransacciones));


    let tipoOpn = "";
    document.getElementById("listaTransacciones").innerHTML =
        `<ion-item >
        <ion-avatar slot="start">
           <img src="img/iconoMoneda.jpg"></img>
        </ion-avatar>
        <ion-label>
             <ion-grid>
                <ion-row>
                    <ion-col>
                        <div><strong>Moneda</strong></div>
                    </ion-col>
                    <ion-col>
                        <div><strong>Operacion</strong></div>
                    </ion-col>
                    <ion-col>
                        <div><strong>Cantidad</strong></div>
                    </ion-col>
                    <ion-col>
                        <div><strong>Precio</strong></div>
                    </ion-col>
                    <ion-col>
                        <div><strong>Total</strong></div>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-label>
    </ion-item >  `


    data.transacciones.forEach((transa) => {

        transa.tipo_operacion == 1 ? tipoOpn = "Compra" : tipoOpn = "Venta";
        let moneda = ObtenerMonedaPorId(transa.moneda);

        document.getElementById("listaTransacciones").innerHTML +=
            `<ion-item > 
                <ion-avatar slot="start">
                    <img src="${urlImg}${moneda.imagen}" />
                </ion-avatar>
                
                <ion-label>
                    <ion-grid>
                        <ion-row>
                            <ion-col>
                                <div>${moneda.nombre}</div>
                            </ion-col>
                            <ion-col>
                                <div>${tipoOpn}</div>
                            </ion-col>
                            <ion-col>
                                <div>${transa.cantidad}</div>
                            </ion-col>
                            <ion-col>
                                <div> $${transa.valor_actual}</div>
                            </ion-col>
                            <ion-col>
                                <div> $${transa.cantidad * transa.valor_actual}</div>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </ion-label>
                   
            </ion-item>`;
    })
}

//mostrarlas en el select
function SelectTransacciones(data) {
    let listaMonedas = [];
    listaMonedas = localStorage.getItem("listaMonedas");
    listaMonedas = JSON.parse(listaMonedas);

    document.getElementById("slcListaMonedas").innerHTML = "";
    listaMonedas.forEach(moneda => {
        document.getElementById("slcListaMonedas").innerHTML +=
            `<ion-select-option value=${moneda.id}>${moneda.nombre}</ion-select-option>`
    })
}

//obtener las transacciones segun el id de la moneda
function ObtenerTransaccionPorIdMoneda(id) {
    let listaTransacciones = [];
    listaTransacciones = localStorage.getItem("listaTransacciones");
    listaTransacciones = JSON.parse(listaTransacciones);

    let transacciones = [];
    listaTransacciones.forEach(trns => {
        if (trns.moneda == id) {
            transacciones.push(trns);
        }
    })
    return transacciones;
}

//mostrar las transacciones que cumplen con la busqueda
function MostrarTransaccionesFiltradas(transacciones) {
    let tipoOpn = "";

    document.getElementById("listaTransacciones").innerHTML = "";
    document.getElementById("listaTransaccionesFiltro").innerHTML =
        `<ion-item >
            <ion-avatar slot="start">
                <img src="img/iconoMoneda.jpg"></img>
            </ion-avatar>
            <ion-label>
                <ion-grid>
                    <ion-row>
                        <ion-col>
                            <div><strong>Moneda</strong></div>
                        </ion-col>
                        <ion-col>
                            <div><strong>Operacion</strong></div>
                        </ion-col>
                        <ion-col>
                            <div><strong>Cantidad</strong></div>
                        </ion-col>
                        <ion-col>
                            <div><strong>Precio</strong></div>
                        </ion-col>
                        <ion-col>
                            <div><strong>Total</strong></div>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </ion-label>
        </ion-item >  `

    if (transacciones.length == 0) {
        document.getElementById("listaTransaccionesFiltro").innerHTML = "No hay transacciones con la moneda seleccionada";
    } else {
        transacciones.forEach(trsn => {
            let moneda = ObtenerMonedaPorId(trsn.moneda);
            trsn.tipo_operacion == 1 ? tipoOpn = "Compra" : tipoOpn = "Venta";

            document.getElementById("listaTransaccionesFiltro").innerHTML +=
                `<ion-item > 
                    <ion-avatar slot="start">
                        <img src="${urlImg}${moneda.imagen}" />
                    </ion-avatar>
                    <ion-label>
                        <ion-grid>
                            <ion-row>
                                <ion-col>
                                    <div>${moneda.nombre}</div>
                                </ion-col>
                                <ion-col>
                                    <div>${tipoOpn}</div>
                                </ion-col>
                                <ion-col>
                                    <div> ${trsn.cantidad}</div>
                                </ion-col>
                                <ion-col>
                                    <div> $${trsn.valor_actual}</div>
                                </ion-col>
                                <ion-col>
                                    <div> $${trsn.cantidad * trsn.valor_actual}</div>
                                </ion-col>
                            </ion-row>
                        </ion-grid>
                    </ion-label>
                </ion-item>`;
        })
    }
}


// -- INVERSION --
function ObtenerInversion() {
    try {
        cargando("Cargando inversiones...").then((loading) => {
            loading.present();
            let api = localStorage.getItem("api");
            let idUsu = localStorage.getItem("idUsu");

            let url = `https://crypto.develotion.com/transacciones.php?idUsuario=${idUsu}`;
            fetch(url, {
                method: "GET",
                headers: {
                    "apikey": api,
                    "Content-Type": "application/json"
                }
            })
                .then(res => res.ok ? res.json() : res.json().then(data => Promise.reject(data.mensaje)))
                .then(data => MostrarInversionTotal(data.transacciones))
                .catch(mensaje => displayToast('Error', mensaje, 'danger'))
                .finally(() => loading.dismiss())
        })
    }
    catch (e) {
        displayToast('Error', 'Error al cargar las inversiones', 'danger');
    }
}

function MostrarInversionTotal(data) {
    let totalCompra = 0;
    let totalVenta = 0;

    data.forEach((trns) => {
        trns.tipo_operacion == 1 ?
            totalCompra += trns.valor_actual * trns.cantidad :
            totalVenta += trns.valor_actual * trns.cantidad;
    })
    let gananciaPerdida = totalCompra - totalVenta;

    document.getElementById("pInversionCompra").innerHTML = `Total compras: $${totalCompra}`;
    document.getElementById("pInversionVenta").innerHTML = `Total ventas: $${totalVenta}`;
    document.getElementById("pGananciaPerdida").innerHTML = `Ganancia/perdida: $${gananciaPerdida}`;
}

// -- MAPA --
//obtener usuarios por dpto
function ObtenerMapa() {
    try {
        cargando("Cargando mapa...").then((loading) => {
            loading.present();
            let api = localStorage.getItem("api");
            let idUsu = localStorage.getItem("idUsu");

            let url = `https://crypto.develotion.com/usuariosPorDepartamento.php`;
            fetch(url, {
                method: "GET",
                headers: {
                    "apikey": api,
                    "Content-Type": "application/json"
                }
            })
                .then(res => res.ok ? res.json() : res.json().then(data => Promise.reject(data.mensaje)))
                .then(data => ObtenerDptosMapa(data.departamentos))
                .catch(mensaje => displayToast('Error al cargar', mensaje, 'danger'))
                .finally(() => loading.dismiss())
        })
    }
    catch (e) {
        displayToast('Error', 'No autorizado', 'danger');
    }
}

//obtener dptos
function ObtenerDptosMapa(data) {
    try {
        cargando("Cargando departamentos...").then((loading) => {
            loading.present();
            let url = "https://crypto.develotion.com/departamentos.php";
            fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(res => res.ok ? res.json() : res.json().then(data => Promise.reject(data.mensaje)))
                .then(dptos => MostrarMapa(data, dptos.departamentos))
                .catch(msj => displayToast('Error', msj, 'danger'))
                .finally(loading.dismiss())
        })
    } catch (error) {
        displayToast('Error', 'Info', 'danger');
    }
}

//mostrar mapa
var map;
function MostrarMapa(data, dptos) {
    //unir los dos array para que cada dpto quede con su cantidad de usuarios
    for (let i = 0; i < dptos.length; i++) {
        const dpto1 = dptos[i];

        for (let j = 0; j < data.length; j++) {
            const dpto2 = data[j];

            if (dpto1.id == dpto2.id) {
                dpto1.cantUsuarios = dpto2.cantidad_de_usuarios;
            }
        }
    }

    if (map != undefined) {
        map.remove();
    }

    let latitudUY = -32.522779;
    let longitudUY = -55.765835;
    map = L.map('map').setView([longitudUY, latitudUY], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

    //mostrar marker por cada dpto
    dptos.forEach(dpto => {
        L.marker([dpto.latitud, dpto.longitud])
            .addTo(map)
            .bindPopup(`<strong>${dpto.nombre}</strong><br/> Cantidad de usuarios ${dpto.cantUsuarios}`)
            .openPopup();
    })
}

// -- ACTIVOS --
function ObtenerActivos() {
    try {
        cargando("Cargando activos...").then((loading) => {
            loading.present();
            let api = localStorage.getItem("api");
            let idUsu = localStorage.getItem("idUsu");

            let url = `https://crypto.develotion.com/transacciones.php?idUsuario=${idUsu}`;
            fetch(url, {
                method: "GET",
                headers: {
                    "apikey": api,
                    "Content-Type": "application/json"
                }
            })
                .then(res => res.ok ? res.json() : res.json().then(data => Promise.reject(data.mensaje)))
                .then(data => MostrarActivos(data.transacciones))
                .catch(mensaje => displayToast('Error al cargar', msj, 'danger'))
                .finally(() => loading.dismiss())
        })
    }
    catch (e) {
        displayToast('Error al cargar', 'Info', 'danger');
    }
}

function MostrarActivos(data) {
    let listaMonedas = localStorage.getItem("listaMonedas");
    listaMonedas = JSON.parse(listaMonedas);

    //quedarse solo con las transacciones que son de compra
    let compras = data.filter(transa => transa.tipo_operacion === 1);

    //crear array nuevo con los datos necesarios y llenarlo con las monedas
    let monedas = [];
    listaMonedas.forEach(m => {
        let moneda = {
            id: m.id,
            nombre: m.nombre,
            cantidad: 0,
            total: 0,
            imagen: m.imagen
        }
        monedas.push(moneda);
    })


    compras.forEach(c => {
        monedas.forEach(m => {
            if (m.id === c.moneda) {
                m.total = m.total + c.valor_actual * c.cantidad;
                m.cantidad = m.cantidad + c.cantidad;
            }
        })
    })

    //quedarse solo con las que se han efectuado compras
    monedas = monedas.filter(m => m.cantidad > 0);


    document.getElementById("listaActivos").innerHTML =
        `<ion-item >
            <ion-avatar slot="start">
                <img src="img/iconoMoneda.jpg"></img>
            </ion-avatar>
            <ion-label>
                <ion-grid>
                    <ion-row>
                        <ion-col>
                            <div><strong>Moneda</strong></div>
                        </ion-col>
                        <ion-col>
                            <div><strong>Cantidad</strong></div>
                        </ion-col>
                        <ion-col>
                            <div><strong>Total</strong></div>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </ion-label>
        </ion-item >  `

    monedas.forEach(compra => {

        document.getElementById("listaActivos").innerHTML +=
            `<ion-item >
                <ion-avatar slot="start">
                    <img src="${urlImg}${compra.imagen}" />
                </ion-avatar>
                <ion-label>
                    <ion-grid>
                        <ion-row>
                            <ion-col>
                                <div>${compra.nombre}</div>
                            </ion-col>
                            <ion-col>
                                <div>${compra.cantidad}</div>
                            </ion-col>
                            <ion-col>
                                <div>$${compra.total}</div>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </ion-label>
            </ion-item > `;
    })

}

// --------------- DOCUMENTO ---------------

document.addEventListener('DOMContentLoaded', function () {

    // -- ROUTER --
    let router = document.querySelector('ion-router');
    router.addEventListener('ionRouteDidChange', function (e) {
        menuController.close(); //cerrar el menu cada vez que cambia la ruta
        let nav = e.detail;
        let paginas = document.getElementsByTagName('ion-page');
        for (let i = 0; i < paginas.length; i++) {
            paginas[i].style.visibility = "hidden";
        }
        let ion_route = document.querySelectorAll(`[url="${nav.to}"]`)
        let id_pagina = ion_route[0].getAttribute('component');
        let pagina = document.getElementById(id_pagina);
        pagina.style.visibility = "visible";

        if (nav.to == '/transacciones') {
            ObtenerTransacciones();
        }
        if (nav.to == '/monedas') {
            ObtenerMonedas();
        }
        if (nav.to == '/mercado') {
            MostrarMoneda();
        }
        if (nav.to == '/inversion') {
            ObtenerInversion();
        }
        if (nav.to == '/mapa') {
            ObtenerMapa();
        }
        if (nav.to == '/activos') {
            ObtenerActivos();
        }
    })


    // --- CERRAR SESION ---
    document.getElementById("btnCerrarSesion").onclick = async function () {
        const alerta = await alertController.create({
            header: 'Crypto App',
            subHeader: 'Cerrar sesion',
            message: '¿Seguro que desea la cerrar sesion?',
            buttons: [
                {
                    text: 'SI',
                    handler: function () {
                        localStorage.clear();
                        router.push('/');
                    }
                },
                {
                    text: 'NO',
                }
            ]
        });
        await alerta.present();
    }

    // --  plugins  --
    document.getElementById("btnCerrarApp").onclick = function () {
        cerrarApp();
    }

    obtenerConexionInternet().then((estatus) => {
        if ('none' == estatus.connectionType) {
            displayToast('Sin conexion!', 'Conectarse para continuar', 'danger');
        }
        else {
            displayToast('Correcto', `Hay Internet ${estatus.connectionType}`, 'primary')
        }
    }).catch(error => displayToast('Warning', error, 'warning'));

    if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('Network')) {
        Capacitor.Plugins.Network.addListener('networkStatusChange', status => {
            if ('none' == status.connectionType) {
                if (Capacitor.isPluginAvailable('Haptics')) {
                    vibrar();
                }
                displayToast('Sin conexion!', 'Conectarse para continuar ', 'danger');
            }
            else {
                displayToast('Correcto', 'Vuelves a tener conexion!', 'primary')
            }
        });
    }


    // --- REGISTRO ---
    document.getElementById("btnRegistro").onclick = function () {

        const usuario = document.getElementById("txtUsuarioRegistro").value;
        const contrasenia1 = document.getElementById("txtContraseniaRegistro").value;
        const contrasenia2 = document.getElementById("txtContraseniaRegistro2").value;
        const departamento = document.getElementById("txtDptoRegistro").value;
        const ciudad = document.getElementById("txtCiudadRegistro").value;

        try {
            if (!usuario) {
                throw "Ingresar un nombre de usuario";
            }
            if (!contrasenia1) {
                throw "Ingresar una contraseña";
            }
            if (contrasenia1 != contrasenia2) {
                throw "Las contraseñias no coinciden";
            }
            if (!departamento) {
                throw "Seleccionar un departamento";
            }
            if (!ciudad) {
                throw "Ingresar una ciudad";
            }

            let url = "https://crypto.develotion.com/usuarios.php";
            datos = {
                "usuario": usuario,
                "password": contrasenia1,
                "idDepartamento": departamento,
                "idCiudad": ciudad
            }
            datos = JSON.stringify(datos);

            fetch(url, {
                method: "POST",
                body: datos,
                header: {
                    "Content-Type": "application/json"
                }
            })
                .then(res => res.ok ? res.json() : res.json().then(data => Promise.reject(data.mensaje)))
                .then(data => {
                    router.push('/');
                    displayToast('Registro exitoso', 'Exito!', 'primary');
                })
                // RegistrarUsuario(data, router))
                .catch(msj => displayToast('Error', msj, 'danger'))

        } catch (error) {
            displayToast('Error', 'Ingresar datos', 'danger');
        }
    }

    // mostrar departamentos y ciudades, cambia segun el dpto que se selecciona
    ObtenerDepartamentos();
    const select = document.getElementById("txtDptoRegistro");
    select.addEventListener('ionChange', e => { ObtenerCiudades(e.detail.value) });


    // --- LOGIN ---
    document.getElementById("btnLogin").onclick = function () {
        let usuarioLogin = document.getElementById("txtUsuarioLogin").value;
        let contraLogin = document.getElementById("txtContraseniaLogin").value;


        let url = "https://crypto.develotion.com/login.php";
        datos = {
            "usuario": usuarioLogin,
            "password": contraLogin
        }
        datos = JSON.stringify(datos);

        fetch(url, {
            method: "POST",
            body: datos,
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => (res.ok) ? res.json() : res.json().then(data => Promise.reject(data.mensaje)))
            .then(data => login(data, router))
            .catch(msj => displayToast(msj, 'Error', 'danger'))
    }


    // //filtrar transaccion por moneda 
    document.getElementById("btnFiltroTransacciones").onclick = function () {
        try {
            document.getElementById("listaTransacciones").innerHTML = "";
            document.getElementById("listaTransaccionesFiltro").innerHTML = "";

            let idMonedaSlc = document.getElementById("slcListaMonedas").value;
            if (isNaN(idMonedaSlc)) {
                throw "Seleccionar una moneda para buscar";
            }
            // document.getElementById("btnMostrarTodas").style.visibility = "visible";
            let transaccion = ObtenerTransaccionPorIdMoneda(idMonedaSlc);

            MostrarTransaccionesFiltradas(transaccion);


        } catch (error) {
            displayToast(error, 'Error', 'danger')
        }
    }

    //boton mostrar todas las transacciones 
    document.getElementById("btnMostrarTodas").onclick = function () {
        document.getElementById("listaTransacciones").innerHTML = "";
        document.getElementById("listaTransaccionesFiltro").innerHTML = "";
            ObtenerTransacciones();
    };

})


