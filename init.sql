-- 1. Tabla principal (con borrado lógico y auditoría básica)
CREATE TABLE Persona (
    id_persona SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE,
    telefono VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Tarifas Globales (Configuración en vivo de los precios del club)
CREATE TABLE Tarifa_Global (
    id_tarifa SERIAL PRIMARY KEY,
    concepto VARCHAR(100) UNIQUE NOT NULL, -- Ej: 'Cuota Socio', 'Adicional Federado'
    monto_actual NUMERIC(10, 2) NOT NULL,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Entidad Federado (1:1 opcional, PK y FK combinadas)
CREATE TABLE Federado (
    id_persona INT PRIMARY KEY,
    cod_federacion VARCHAR(50) UNIQUE NOT NULL,
    elo INT NOT NULL,
    FOREIGN KEY (id_persona) REFERENCES Persona(id_persona)
);

-- 4. Entidad Profesor (Rol de seguridad)
CREATE TABLE Profesor (
    id_persona INT PRIMARY KEY,
    FOREIGN KEY (id_persona) REFERENCES Persona(id_persona)
);

-- 5. Entidad Alumno (Rol para facturación e inscripciones)
CREATE TABLE Alumno (
    id_persona INT PRIMARY KEY,
	fecha_nacimiento DATE NOT NULL,
    FOREIGN KEY (id_persona) REFERENCES Persona(id_persona)
);

-- 6. Tabla Taller (La entidad principal del curso, con borrado lógico)
CREATE TABLE Taller (
    id_taller SERIAL PRIMARY KEY,
    nombre VARCHAR(150) UNIQUE NOT NULL,
    id_profesor INT NOT NULL,
    cupo_maximo INT NOT NULL,
    precio_actual NUMERIC(10, 2) NOT NULL,
    duracion VARCHAR(50),          -- Ej: '4 meses', '80 horas'
    edad_minima INT,               -- Para agrupar categorías (ej: Sub-10, Sub-14)
    edad_maxima INT,
    nivel VARCHAR(50) CHECK (nivel IN ('Principiante', 'Recreativo', 'Federado')),             -- Ej: 'Principiante', 'Federado'
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_profesor) REFERENCES Profesor(id_persona)
);

-- 7. Tabla Taller_Horario (El atributo multivaluado normalizado 1:N)
CREATE TABLE Taller_Horario (
    id_horario SERIAL PRIMARY KEY,
    id_taller INT NOT NULL,
    dia_semana VARCHAR(20) NOT NULL, -- Ej: 'Martes'
    hora_inicio TIME NOT NULL,       -- Ej: '18:00:00'
    hora_fin TIME NOT NULL,          -- Ej: '20:00:00' (Permite calcular duración exacta)
    FOREIGN KEY (id_taller) REFERENCES Taller(id_taller)
);

-- 8. Tabla Pago (El recibo de ingreso que registra la transacción)
CREATE TABLE Pago (
    id_pago SERIAL PRIMARY KEY,
    id_alumno INT NOT NULL,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    monto_total NUMERIC(10, 2) NOT NULL,
    medio_pago VARCHAR(50) NOT NULL CHECK (medio_pago IN ('Efectivo', 'Transferencia', 'MercadoPago', 'Tarjeta')),
    FOREIGN KEY (id_alumno) REFERENCES Alumno(id_persona)
);

-- 9. Tabla Alumno_Taller (La tabla intermedia de inscripciones y snapshot financiero)
CREATE TABLE Alumno_Taller (
    id_alumno INT NOT NULL,
    id_taller INT NOT NULL,
    precio_acordado NUMERIC(10, 2) NOT NULL, -- El precio histórico congelado ("Snapshot")
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_alumno, id_taller),
    FOREIGN KEY (id_alumno) REFERENCES Alumno(id_persona),
    FOREIGN KEY (id_taller) REFERENCES Taller(id_taller)
);

-- 10. Tabla Cuota (El compromiso mensual, con el Snapshot de precios)
CREATE TABLE Cuota (
    id_cuota SERIAL PRIMARY KEY,
    id_alumno INT NOT NULL,
    periodo VARCHAR(7) NOT NULL,             -- Ej: '2026-07'
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('Pendiente', 'Pagada', 'Vencida', 'Anulada')) DEFAULT 'Pendiente',
    id_pago INT,                             -- NULL mientras se deba, con el ID del recibo cuando se pague
    FOREIGN KEY (id_alumno) REFERENCES Alumno(id_persona),
    FOREIGN KEY (id_pago) REFERENCES Pago(id_pago)
);

-- 11. Nueva tabla de detalles contables
CREATE TABLE Detalle_Cuota (
    id_detalle SERIAL PRIMARY KEY,
    id_cuota INT NOT NULL,
    nombre_concepto VARCHAR(100) NOT NULL,
    monto_congelado NUMERIC(10, 2) NOT NULL,
    FOREIGN KEY (id_cuota) REFERENCES Cuota(id_cuota) ON DELETE CASCADE
);

-- Función que cuenta inscriptos y evalúa el cupo
CREATE OR REPLACE FUNCTION verificar_cupo_taller()
RETURNS TRIGGER AS $$
DECLARE
    cupos_ocupados INT;
    cupo_maximo_taller INT;
BEGIN
    -- Conteo simple y directo de la tabla de unión
    SELECT COUNT(*) INTO cupos_ocupados
    FROM alumno_taller
    WHERE id_taller = NEW.id_taller;

    SELECT cupo_maximo INTO cupo_maximo_taller
    FROM taller
    WHERE id_taller = NEW.id_taller;

    IF cupos_ocupados >= cupo_maximo_taller THEN
        RAISE EXCEPTION 'El taller ha alcanzado su cupo máximo';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que dispara la función ANTES de registrar la inscripción
CREATE TRIGGER trg_verificar_cupo
BEFORE INSERT ON Alumno_Taller
FOR EACH ROW
EXECUTE FUNCTION verificar_cupo_taller();


-- ==========================================
-- 1. CONFIGURACIÓN INICIAL (Tarifas)
-- ==========================================
INSERT INTO Tarifa_Global (concepto, monto_actual) 
VALUES 
('Cuota Socio', 10000.00),
('Adicional Federado', 3000.00);

-- ==========================================
-- 2. PERSONAS (La tabla central)
-- ==========================================
-- Insertamos 3 personas. PostgreSQL les asignará automáticamente los IDs 1, 2 y 3.
INSERT INTO Persona (nombre, apellido, dni, email, telefono)
VALUES
('Garry', 'Kasparov', '11111111', 'garry@ajedrez.com', '11223344'), -- ID 1 (Será Profesor)
('Magnus', 'Carlsen', '22222222', 'magnus@ajedrez.com', '55667788'), -- ID 2 (Será Alumno Federado)
('Beth', 'Harmon', '33333333', 'beth@ajedrez.com', '99001122');     -- ID 3 (Será Alumno Recreativo)

-- ==========================================
-- 3. ASIGNACIÓN DE ROLES (Herencia 1:1)
-- ==========================================
-- A Garry (1) le damos el rol de Profesor
INSERT INTO Profesor (id_persona) VALUES (1);

-- A Magnus (2) y Beth (3) les damos el rol de Alumno (acá guardamos su fecha de nacimiento)
INSERT INTO Alumno (id_persona, fecha_nacimiento)
VALUES
(2, '1990-11-30'),
(3, '1995-10-23');

-- A Magnus (2) también le damos el estatus de Federado
INSERT INTO Federado (id_persona, cod_federacion, elo)
VALUES (2, 'FIDE-9999', 2882);

-- ==========================================
-- 4. GESTIÓN ACADÉMICA (Talleres y Horarios)
-- ==========================================
-- Creamos dos talleres distintos dictados por Garry (Profesor 1)
INSERT INTO Taller (nombre, id_profesor, cupo_maximo, precio_actual, duracion, edad_minima, edad_maxima, nivel)
VALUES
('Estrategia Avanzada', 1, 10, 15000.00, 'Anual', 14, 99, 'Federado'),      -- ID 1
('Iniciación al Ajedrez', 1, 20, 10000.00, '4 meses', 8, 99, 'Principiante'); -- ID 2

-- Asignamos horarios a los talleres (Notá cómo el ID 1 tiene dos días distintos)
INSERT INTO Taller_Horario (id_taller, dia_semana, hora_inicio, hora_fin)
VALUES
(1, 'Lunes', '18:00:00', '20:00:00'),
(1, 'Miercoles', '18:00:00', '20:00:00'),
(2, 'Martes', '17:00:00', '18:30:00');

-- ==========================================
-- 5. INSCRIPCIONES (Con Snapshot de precio)
-- ==========================================
INSERT INTO Alumno_Taller (id_alumno, id_taller, precio_acordado)
VALUES
(2, 1, 15000.00), -- Magnus se anota al Avanzado (Paga precio completo)
(3, 2, 8000.00);  -- Beth se anota a Iniciación (¡Mirá! El taller sale 10000, pero le congelamos el precio a 8000 por una beca)

-- ==========================================
-- 6. GESTIÓN CONTABLE (Pagos y Cuotas)
-- ==========================================

-- CASO A: Magnus (Debe el mes de Julio)
-- Generamos su cuota, pero NO creamos un pago. El id_pago queda en NULL y estado Pendiente.
-- Fijo: 10000 (Socio) + 3000 (Federado) + 15000 (Taller) = Total adeudado: 28000.
INSERT INTO Cuota (id_alumno, periodo, monto_base, monto_federado, monto_talleres, fecha_vencimiento, estado, id_pago)
VALUES
(2, '2026-07', 10000.00, 3000.00, 15000.00, '2026-07-10', 'Pendiente', NULL);

-- CASO B: Beth (Pagó el mes de Julio)
-- 1ro: Registramos el ingreso de dinero (Socio 10000 + Taller Beca 8000 = 18000 total).
INSERT INTO Pago (id_alumno, monto_total, medio_pago)
VALUES (3, 18000.00, 'Transferencia'); -- Esto generará el id_pago = 1

-- 2do: Generamos su cuota y la vinculamos directamente al recibo que acabamos de crear (id_pago = 1).
INSERT INTO Cuota (id_alumno, periodo, monto_base, monto_federado, monto_talleres, fecha_vencimiento, estado, id_pago)
VALUES
(3, '2026-07', 10000.00, 0.00, 8000.00, '2026-07-10', 'Pagada', 1);