## 1 Instalaciones globales necesarias (solo se instalan una vez en el equipo)
1. Instalar _node.js_ desde la página oficial: https://nodejs.org/es
2. Instalar typeScript  de manera global con el comando ```npm install -g typescript```
3. Instalar yarn de manera global con el comando: ```npm install -g yarn ``` 

## 2 Inicialización del proyecto:
1. Creamos una carpeta con el nombre del proyecto, creamos dos subcarpetas uno con el nombre de back y el otro con el nombre front, según el proyecto y en el lado en el que trabajemos estaremos en la ruta de carpeta indicada, en este caso todas las instrucciones corresponden al Back, por ende estaremos en esa ruta. abrimos VS code, abrimos la carpeta de nuestro proyecto y seguimos las instrucciones:
1. 1. Ejecutar el comando ``` npm init``` o el comando ```yarn init ``` para creación del proyecto. Podemos añadir la bandera (-y) para la creación rápida del proyeto.

 2. Inicializar typescript con el comando: ```tsc --init```. este comando nos crea un archivo llamado tsconfig.json

 3. Configuración del _ts config_, las opciones que se van a configurar son:
 //ctrl + f busca:
 ```json
    "target": "es6", //versión de js que se va a ocupar
    "outDir": "./dist", //directorio donde se van a alojar los archivos
    "esModuleInterlop": true, //nos permite hacer las importaciones, ie, los imp
    "sourceMap": true, // nos crea el mapa para mostrar los errores y advertencias de js a typescript
    "moduleResolution": "node",
    "experimentalDecorators": true, //soporte para decoradores
    "emitDecoratorMetadata": true, //soporte para decoradores
    "strictNullChecks": false, //para que no marque errores en  los dto 
 ```
 4. configuración del tslint, ahora es eslint y seguimos los pasos del sitio oficial de eslint: https://typescript-eslint.io/getting-started
 Seguimos la documentación oficial del link.

## 3 Creamos una estructura de carpetas para el manejo de la mismas:
1. src/: Carpeta que contiene el código fuente de la aplicación.
   1. controllers/: Carpeta donde se definen los controladores que manejan las lógicas de las rutas.
   2. models/: Carpeta donde se definen los modelos o esquemas de datos utilizados en la aplicación.
   3. routes/: Carpeta que contiene los archivos donde se definen las rutas y se manejan las solicitudes HTTP.
   4. middlewares/: Carpeta que contiene funciones que se ejecutan antes o después de una solicitud HTTP.
   5. app.ts: Archivo principal que inicializa y configura la aplicación Express.

## 4 Creamos nuestro primer archivo dentro de SRC
1. Creamos el primer archivo, lo llamamos index.ts, aquí será la raíz de nuestro proyecto porque se mantendrá escuchando al servidor.

## 5 Instalaciones para crear un servidor Api: 
1. Instalación de express con el comando: ```yarn add express``` para más información:https://www.npmjs.com/package/express 
2. Instalamos los tipos de paquetes correspondientes de express, estos se instalan con el _-D_
4. También se instala cors, y sus paquetes correspondientes con el comando -D

## 5.5 Configuración del script
Esta configuración es del script dentro del archivo de _package.json_, si no hay entonces se crea.... debajo de las licencias llamdo MIT, con la siguiente configuración: ```"dev": "nodemon ./dist/index.js"```


### 6 Creamos el modelo del servidor
1. Dentro de la carpeta de **models** se crea el arch. de _server.ts_
   1. 1. Vamos a crear la carpeta **public** y dentro de esta se crea el archivo _index.html_ y mandamos un h2 para visualizarlo.

2. En el archivo de _server.ts_ exportamos la clase *Server*, aquí vamos a crear nuestra aplicación y el puerto, éstos según sus tipos, Aplication y number, ambos serán privados.

   2. 1. Creamos un constructor donde se inicializan el puerto y la aplicación, con el puerto mayor a 3000 y la aplicación con express(). anteponiendo this. a ellos. Aquí también se inicializan los métodos middleware y el de la conexión a la base de datos (conectDB())

   2. 2. Continuamos con la creación de las rutas/ las paths; Vamos a crear nuestros paths de tipo privado y como objeto se declaran nuestras rutas los cuales se ven como los siguientes: 
      ```ts
      private paths = {
            users: '/users',//ruta según el nameRuta.
         } 
      ```

   3. 1. Creamos el método de los middlewares el cual será privado. 
      3. 2. Dentro de este seguimos la sintaxis siguiente:
      ```ts
         this.app.use (cors()); //permite acceder a los recursos restringidos de un sitio desde otro dominio
         this.app.use (express.json());
         this.app.use (morgan('dev')); //permite el manejo de los loggers de las solicitudes de Entrada.
         //en caso de tener archivos estáticos, express los manejara
         const path = join(__dirname,'../../public');
         this.app.use (express.static(path));
      ```
         ------ <Para poder hacer uso de los cors, morgan y express, se tienen que instalar con anticipación, para estas instalacione se deben seguir los pasos correctos para la instalción de los mismos, la instalación se hará conforme nos indique el paso 6 donde se crea la función de listen del servidor.>
         -------
   4. 1. Creamos el método de las rutas privadas. debajo del método de middleware. Donde se definen el nombre de nuestras rutas, los nombres se definen por la creación de los archivos en la carpeta de _routes_, mismos que van después agragados en el private routes()
      1. En la carpeta de _routes_ creamos las rutas debidas de los paths declarados en los paths, mismo método que está encima del constructor.
      1. 2. Los nombres de las rutas son: 
               users.route.ts
               movs.route.ts
               auth.route.ts
               seed.route.ts
         2. 1. Dentro de cada archivo de ruta se tiene como código principal y base lo siguiente:
         ```ts
            import { Router } from "express";
               const router = Router();
            export default router;
         ```
         Para después pasar sus nombres a las rutas en los paths como se puede observar abajo en el codigo:
         ```ts
            private routes (){
               this.app.use (this.paths.users, userRoutes); // se decalaran las rutas de nuestro paths
            ...
            }
         ```
   5. 1. Creamos la conexión a la base de Datos: La configuración que se va a realizar es la siguiente: Antes de realizar la conexión se va a realizar el paso 6.1 y después volvemos aquí para continuar con el código:
      Creamos de manera privada la función conexiónDB, dejaremos con 3 intentos para conectar
   ```ts
      private conectDataBase(intentConect: number = 3){
        appDataSource.initialize() //inicializamos la base de datos
        .then(() =>{
            this.routes(); //empleamos la priedad de la función de routes
        })
        .catch((err) => {
            console.log(err);
            if(intentConect == 0){
                logger.error('Fallo en la conexión de la base de datos, aplicación terminada');
                throw 'Ha finalizado la aplicación';
            }
            setTimeout(() => {
                logger.warn('Fallo en la conexión de la base de datos, intentando nuevamente')
                this.conectDataBase(--intentConect)
            }, 3000);
        })
    }
   ```
      El logger que vemos aquí se configura en el archivo de _logger.ts_ ubicado en la carpeta de **config**, la cual se configura de la siguiente manera: para más información se debe verificar en la siguiente liga https://www.npmjs.com/package/winston
      ```ts
      //nos permite hacer logger de consola y de arch
      //Logger de arch, nos devuelve todos los logs

      import winston from "winston";
         const consoleFormat = winston.format.combine(
            //tipo info
         )
         const fileFormat = winston.format.combine(
            //tipo info
         )
         //aQUÍ SE CONFIGURA EL LOGGER PARA QUE TOME EL NIVEL DE TIPO INFO 
         //solo se ocupa en todo menos http
         const logger = winston.createLogger({
            //En level info solo toma en cuenta los que están debajo de el
            //para más niveles recuerda revisar documentación de winston
            transports: [....]
         })
      export default logger;
      ```

   6. 1. Continuamos con la conexión a la base de datos después de haber configurado estos pasos volvemos al paso numero 5.1 para generar la conexión con todos los ajustes ya hechos. Terminando volvemos al punto 6.1  con estos pasos
      Creamos **carpeta** de DB y dentro el archivo _dataBase.ts_
      6. 2. Realizamos la instalación de TypeORM: Su objetivo proporcionar funciones adicionales para desarrollar cualquier tipo de aplicación que use bases de datos en los distintos gestores de base de datos que soporte. Instalamos:
      ```yarn add typeorm```, ```yarn add reflect-metadata``` y ```yarn add mssql```
      6. 3. Dentro del archivo _dataBase.ts_ Se exporta constante con el nombre de appDataSource y la sintaxis es la siguiente:
      ```ts
         export const appDataSource = new DataSource ({
            type:'mssql', //el cual va a manejar el typeORM
            host: enviroment.HOST, //se puede hacer una configuración para no dejar el host sin seguridad, 
            port: 3000,  //varia segun el # de puerto
            username: enviroment.USERNAME,
            password: enviroment.PASSWORD,
            database: enviroment.DATABASE,
            synchronize: true,
            // logging: true,
            entities: [Aqui van todas nuestras entidades ],
            extra: {
               trustServerCertificate:true
            }
         })
      ```
      6. 4. La configuración para el archivo del manejo de las variables (_enviroment_) de entorno es: 
         1. Se crea archivo en la carpeta de **config** con el nombre _enviroment.ts_
         2. Se instala ```yarn add dotenv``` el cual nos ayuda a manejar las variables de entorno:
            Para más información ir la liga de https://www.npmjs.com/package/dotenv 
         ```ts
            import dotenv from 'dotenv'

            dotenv.config();
            export const enviroment = {
               PORT: process.env.PORT || '5000',
               SECRET_KEY: process.env.SECRET_KEY,
               HOST: process.env.HOST,
               USERNAME: process.env.DB_USERNAME,
               PASSWORD: process.env.PASSWORD,
               DATABASE: process.env.DATABASE,
               API_PATH: process.env.API_PATH
            }
         ```
         3. Dentro de este paso vamos a configurar el .env, creamos el archivo _.env_ fuera de la carpeta de **src**, y simplemente vamos a declarar nuestras variables de entorno. las cuales pueden ser las siguientes:
         ```ts
         PORT = 3000
         HOST = 192.192.192.192
         DB_USERNAME = userName of DataBase
         PASSWORD = PasswordName
         DATABASE = NameDataBse
         API = http://localhost:3000
         ```
         Una vez terminado este proceso ya podemos hacer uso del archivo para evitar que nuestras credenciales sean expuestas.

   6. 1. Finalizando la conexión de la base de datos dentro de la carpeta de **models** en el archivo de _server.ts_ seguimos con el codigo para crear nuestra función de listen. Entonces, creamos la función de listen, el cual estará atento al puerto. Dentro de este listen se va a configurar el logger, para lo cual se necesitan las instalaciones de morgan y winston, las instrucciones están en el paso ###7. El logger ya está configurado en el paso 5.1.
   La configuración de nuestra función es la siguiente:
   ```ts
   listen (){
        this.app.listen(this.port, () => {
            logger.info(`Servidor corriendo en el puerto: ${this.port}`);
        })
   }
   ```
   .----------------------------------------------------------

### 7 Se realizará la instalación de morgan y de winston
1. Morgan: Es un logger de solo peticiones de tipo http, por lo tanto morgan es un middleware.
``` yarn add morgan```
2. Winston nos permite hacer logger de consola y de arch. El Logger de arch, nos devuelve todos los logs. Este se tiene que configurar de la siguiente manera:
https://www.npmjs.com/package/winston
2. 1. Se debe crear una carpeta **config** dentro del SRC creamos un archivo de nombre _logger.ts_, este se configura según el anterior link. También se puede revisar otro proyecto en la carpeta de config con el archivo logger.ts
``` yarn add winston```
### Volvemos al paso de la creación del modelo del servidor.... para configurar nuestro listen.
---------------------------------------------------------------

## 8.- Creamos las rutas a las cuales van a pertencecer los paths y también creamos los controladores que van a manejar lo que entre a las rutas.
   2. En la carpeta de _controllers_ creamos los controladores mismos que van a manejar la lógica de nuestro programa. Dentro de estos van a estar todas las funciones básicas de nuestro programa, es decir las funciones básicas de un CRUD
      2. 1. Los nombres de los archivos son:
            users.controllers.ts
            movs.controllers.ts
            auth.controllers.ts
            seed.controllers.ts

         2. 1. 1. El código principal y base de nuestros controladores es el siguiente :
         Exportamos cada const, por lo general estaremos trabajando con promesas y devolución de las mismas así que emplearemos los async y await. Se debe tener cuidado del manejo de los await. para que el programa funcione debidamente.
         ```ts
         export const nameFuncionControlador = async (req:Request, res:Response) => {
            //aqui se pasa text plano en caso se ser necesario, todas las funciones se declaran dentro de esta constante 
            const body = req.body;
               res.json ({
                  msj: 'msj de respuesta en'
               })
            }
        ```

        Los nombres de los controladores son los tipos de funciones las cuales van a realizar cada controlador, ie, van a tener los 5 tipos basicos de un CRUD, que son Crear, Read (leer-obtener), Update (actualizar) y Delete (eliminar).
        Su estructura será la siguiente(_tomando la estructura anterior y poniendo los nombres de las funciones como:_): tipoFuncion_NameController, por ejemplo:
        ```ts
        createUser, getAllUsers, getOneUser, upDateUser, deleteUser y seedUser
        ```
        
        En el caso del seedUser dentro de la función solo va a pasar el texto plano, crear repository, crear una función de buscar usuario y una const para crear usuario mediante el repository, eliminamos el password del usuario por seguridad. Recordemos que el seed se configura así porque sólo será ejecutado una sola vez.

        <En este paso se debe instalar bcrypt para encriptar la contraseña. Ir al apartado de #9 para Instalar y configurar el bcrypt y después ir al #10 para la configuración del código de los controladores de manera interna y para la preparación de lo que hará.>

      2. 2. Antes de continuar con nuestras funciones de los controladores se debe crear una carpeta **DTO**, dentro de esta se van a crear todos los dtos (data transfer object) que van a ir de parámetro en las rutas, estos se encargan de las validaciones de los datos enviados por el usuario, ie, puede validar Params, Body y Query que vienen en la Request, son las que van a manejar los tipos de datos ingresados en los controladores. Y tienen la siguiente estructura: se exporta clase y NameDTO, dentro de estas van los decoradores anteponiendo el @, pj: @IsString()
      ```ts
      export class CreatePostDTO {
         @IsString() //adentro se pueden poner los 
         @Length(10,30)
         namePost: string;

         @IsArray()
         @IsInt({each: true})
         idCategories: Array<number> //en caso de Arreglo de numeros
      }
      ```
      Los datos que van dentro para el diseño de los DTO son los mismos que se obtienen del diseño de nuestra UML

      2. 3. Creamos una carpeta de nombre **entities**, dentro se crearán los archivos de tipo _name.entity.ts_, las entidades son las que manejan la base de datos porque se van creando las tablas y columnas a través de ellas. Éstas también se toman del diseño de nuestra UML. y tienen la siguiente estructura: 
      ```ts
            @Entity ('users')
            export class User{
               @Column({
                  primary:true
               })
               id: string;
               .... // se declaran todas las propiedades de nuestro diseño UML
            }
      ``` 

## 8.5 Creamos **carpeta** de DB y adentro el archivo que se llamará _dataBase.ts_, esimpotante realizar este paso primero por el manejo de los datos para los controllers.
1. Realizamos la instalación de TypeORM: Su objetivo es proporcionar funciones adicionales para desarrollar cualquier tipo de aplicación que use bases de datos en los distintos gestores de base de datos que soporte. Instalamos:
 ```yarn add typeorm```, ```yarn add reflect-metadata``` y ```yarn add mssql```
2. Dentro del archivo _dataBase.ts_ Se exporta constante con el nombre de appDataSource y la sintaxis es la siguiente:
```ts
   export const appDataSource = new DataSource ({
      type:'mssql',
      host: enviroment.HOST, //se puede hacer una configuración para no dejar el host sin seguridad, 
      port: 3000,  //varia segun el # de puerto
      username: enviroment.USERNAME,
      password: enviroment.PASSWORD,
      database: enviroment.DATABASE,
      synchronize: true, 
      // logging: true,
      entities: [User, Mov, Bitacora ],
      extra: {
         trustServerCertificate:true
      }
   })
```
   Para que pueda funcionar correctamente la conexión de la base de datos es necesario importar el reflect metadata en la parte más alta de nuestro prpgrama, es decir este estará ubicado en nuestr _index.ts_ que es el archivo generado en la parte más alta de nuestro proyecto.
3. Realizaremos la configuración para el archivo del manejo de las variables de entorno, el cual es el siguiente : 
   1. Se crea arch en la carpeta de config con el nombre _enviroment.ts_
   2. Se intala ```yarn add dotenv``` este nos ayuda a manejar las variables de entorno:
   ```ts
      import dotenv from 'dotenv'

      dotenv.config();
      export const enviroment = {
         PORT: process.env.PORT || '5000',
         SECRET_KEY: process.env.SECRET_KEY,
         HOST: process.env.HOST,
         USERNAME: process.env.DB_USERNAME,
         PASSWORD: process.env.PASSWORD,
         DATABASE: process.env.DATABASE,
         API_PATH: process.env.API_PATH
      }
   ```

## 9 Instalar bcrypt para encriptar la contraseña
1. Instalar ```yarn add bcrypt``` y ```yarn add @types/bcrypt -D``` para añadir los tipos.
2. Procedemos a configurar el controlador donde maneja el password.
   con el metodo de hashSync(password, seguido del #de veces de la encriptación (saltos))
   ```ts
      password: bcrypt.hashSync(password, 10)
   ```
   Este paso está dentro de la función para crear el usuario, después de la desestructuración de la exportación de nuestra const principal y antes la validación de los roles de usuario.

## 10 Comenzamos con el código que van adentro de los controladores
   1. En el controller del <usuario>
   Vamos a manejar la entrada de datos con una transacción, para ello vamos al sitio de typeORM: https://typeorm.io/transactions y en transactions vemos la sintaxis que se debe de manejar para este:

### Generar las claves privadas y publicas
#### Generar una clave privada RSA de 2048 bits
openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048


#### Extraer la clave pública a partir de la clave privada
openssl rsa -pubout -in private.pem -out public.pem
